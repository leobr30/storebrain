import { HttpException, HttpStatus } from '@nestjs/common';

export class JobNotFoundException extends HttpException {
  constructor() {
    super('Job with given Id not found', HttpStatus.NOT_FOUND);
  }
}

export class ContractNotFoundException extends HttpException {
  constructor() {
    super('Contract with given Id not found', HttpStatus.NOT_FOUND);
  }
}

export class UserNotFoundException extends HttpException {
  constructor() {
    super('User with given Id not found', HttpStatus.NOT_FOUND);
  }
}
