import { Test, TestingModule } from '@nestjs/testing';
import { OnerpService } from './onerp.service';

describe('OnerpService', () => {
  let service: OnerpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OnerpService],
    }).compile();

    service = module.get<OnerpService>(OnerpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
