import { Injectable, NotFoundException, Post } from '@nestjs/common';
import { ApplyCouponDto, CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Coupon } from './entities/coupon.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CouponsService {

  constructor(
    @InjectRepository(Coupon) private readonly couponRepository: Repository<Coupon>
  ) { }

  async create(createCouponDto: CreateCouponDto) {
    return await this.couponRepository.save(createCouponDto);
  }

  async findAll() {
    return await this.couponRepository.find();
  }

  async findOne(id: number) {
    const coupon = await this.couponRepository.findOneBy({ id })
    if (!coupon) {
      throw new NotFoundException('Coupon no encontrado o vencido')
    }
    return coupon;
  }

  async update(id: number, updateCouponDto: UpdateCouponDto) {
    const coupon = await this.findOne(id)
    Object.assign(coupon, updateCouponDto)
    await this.couponRepository.save(coupon)
    return `Cupón actualizado`;
  }

  async remove(id: number) {
    const coupon = await this.findOne(id)
    await this.couponRepository.remove(coupon)
    return `Se eliminó el cupón: ${coupon.name}`;
  }


  applyCoupon(coupon: ApplyCouponDto) {
    console.log(coupon)
    return `apply coupon ${coupon.name}`
  }

}
