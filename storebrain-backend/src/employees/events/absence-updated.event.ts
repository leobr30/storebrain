import { UserAbsence } from '@prisma/client';


export class AbsenceUpdatedEvent {
  constructor(public readonly absenceId: number,
    public readonly historyId: number
  ) {}
}
