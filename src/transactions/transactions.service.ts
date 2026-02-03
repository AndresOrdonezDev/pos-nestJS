import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction, TransactionContents } from './entities/transaction.entity';
import { Between, FindManyOptions, Repository } from 'typeorm';
import { Product } from 'src/products/entities/product.entity';
import { endOfDay, isValid, parseISO, startOfDay } from 'date-fns';
import { error } from 'console';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction) private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(TransactionContents) private readonly transactionContentsRepository: Repository<TransactionContents>,
    @InjectRepository(Product) private readonly productRepository: Repository<Product>
  ) { }

  async create(createTransactionDto: CreateTransactionDto) {

    await this.productRepository.manager.transaction(async (transactionEntityManager) => {

      const transaction = new Transaction()
      //transaction.total = createTransactionDto.contents.reduce((total,item)=> total+(item.price * item.quantity),0)
      transaction.total = 0
      await transactionEntityManager.save(transaction)

      const errors: string[] = []
      for (const contents of createTransactionDto.contents) {

        const product = await transactionEntityManager.findOneBy(Product, { id: contents.productId })

        if (!product) {
          errors.push('Producto no encontrado')
          throw new NotFoundException(errors)
        }
        if (contents.quantity > product.inventory) {
          errors.push(`No hay inventario suficiente de: ${product.name}`)
          throw new BadRequestException(errors)
        }
        if (Number(product.price) !== contents.price) {
          errors.push(`El precio de: ${product.name} ha cambiado el precio, favor actualizar el pedido`)
          throw new BadRequestException(errors)
        }

        transaction.total += product.price * contents.quantity
        product.inventory -= contents.quantity
        //create TransactionContents instance
        const transactionContent = new TransactionContents()
        transactionContent.price = product.price
        transactionContent.product = product
        transactionContent.quantity = contents.quantity
        transactionContent.transaction = transaction
        await transactionEntityManager.save(transactionContent)
      }
      await transactionEntityManager.save(transaction)
    })
    return 'Venta registrada';
  }

  async findAll(transactionDate?: string) {
    const options: FindManyOptions<Transaction> = {
      relations: {
        contents: true
      }
    }
    if (transactionDate) {
      const date = parseISO(transactionDate)
      if (!isValid(date)) {
        throw new BadRequestException('Fecha incorrecta para filtrar')
      }
      const start = startOfDay(date)
      const end = endOfDay(date)
      options.where = {
        transactionDate: Between(start, end)
      }
    }

    return await this.transactionRepository.find(options);
  }

  async findOne(id: number) {
    const transaction = await this.transactionRepository.findOne({
      where: {
        id
      },
      relations:{
        contents:true
      }
    })
    if (!transaction) {
      throw new NotFoundException('Transacción no encontrada')
    }
    return transaction;
  }

  async update(id: number, updateTransactionDto: UpdateTransactionDto) {
    if (!updateTransactionDto.contents || updateTransactionDto.contents.length === 0) {
      throw new BadRequestException('Se requieren contenidos para actualizar la transacción')
    }

    const transaction = await this.findOne(id)

    await this.productRepository.manager.transaction(async (transactionEntityManager) => {
      // Restaurar inventario de los productos anteriores
      for (const contents of transaction.contents) {
        const product = await transactionEntityManager.findOneBy(Product, { id: contents.product.id })
        if (product) {
          product.inventory += contents.quantity
          await transactionEntityManager.save(product)
        }
        // Eliminar contenidos anteriores
        const transactionContents = await transactionEntityManager.findOneBy(TransactionContents, { id: contents.id })
        transactionContents && await transactionEntityManager.remove(transactionContents)
      }

      // Crear nuevos contenidos
      transaction.total = 0
      const errors: string[] = []

      for (const contents of updateTransactionDto.contents) {
        const product = await transactionEntityManager.findOneBy(Product, { id: contents.productId })

        if (!product) {
          errors.push('Producto no encontrado')
          throw new NotFoundException(errors)
        }
        if (contents.quantity > product.inventory) {
          errors.push(`No hay inventario suficiente de: ${product.name}`)
          throw new BadRequestException(errors)
        }
       
        transaction.total += product.price * contents.quantity
        product.inventory -= contents.quantity

        const transactionContent = new TransactionContents()
        transactionContent.price = product.price
        transactionContent.product = product
        transactionContent.quantity = contents.quantity
        transactionContent.transaction = transaction

        await transactionEntityManager.save(product)
        await transactionEntityManager.save(transactionContent)
      }

      await transactionEntityManager.save(transaction)
    })

    return `Transacción #${id} actualizada`;
  }

  async remove(id: number) {
    const transaction = await this.findOne(id)
    for(const contents of transaction.contents){
      const product = await this.productRepository.findOneBy({id:contents.product.id})
      product && (product.inventory += contents.quantity)
      product && await this.productRepository.save(product)
      const transactionContents = await this.transactionContentsRepository.findOneBy({id:contents.id})
      transactionContents && await this.transactionContentsRepository.remove(transactionContents)
    }
    await this.transactionRepository.remove(transaction)
    return `Transacción #${id} eliminada`;
  }
}
