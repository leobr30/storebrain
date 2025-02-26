import { HttpException, HttpStatus } from '@nestjs/common';

export class CompanyNotFoundException extends HttpException {
  constructor() {
    super('Company with given Id not found', HttpStatus.NOT_FOUND);
  }
}
