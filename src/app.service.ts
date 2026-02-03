import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello AndresDev!';
  }

  postHello():string{
    return 'from post on service'
  }
}
