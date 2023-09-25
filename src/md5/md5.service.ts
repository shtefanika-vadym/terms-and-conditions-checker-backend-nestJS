import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';

@Injectable()
export class Md5Service {
  calculateMd5Hash(data: any): string {
    const md5Hash = createHash('md5');
    md5Hash.update(JSON.stringify(data));
    return md5Hash.digest('hex');
  }
}
