import {
  Action,
  AppAbility,
} from 'src/casl/casl-ability.factory/casl-ability.factory';
import { IPolicyHandler } from 'src/casl/policy.interface';

export class ReadTrainingPolicyHandler implements IPolicyHandler {
  handle(ability: AppAbility): boolean {
    console.log("📌 Policy Check: Action.Read, Subject: employees →", ability.can(Action.Read, 'employees'));
    return (
      ability.can(Action.Read, 'trainings') ||
      ability.can(Action.Manage, 'all')
    );
  }
}

