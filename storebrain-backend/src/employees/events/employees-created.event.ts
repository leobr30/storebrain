import { CreateEmployeePdfDto } from '../dto/create-employee-pdf.dto';

export class EmployeeCreatedEvent {
  constructor(public readonly dto: CreateEmployeePdfDto) {}
}
