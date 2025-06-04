import {
  Action,
  AppAbility,
} from 'src/casl/casl-ability.factory/casl-ability.factory';
import { IPolicyHandler } from 'src/casl/policy.interface';

export class StartTrainingPolicyHandler implements IPolicyHandler {
  handle(ability: AppAbility): boolean {
    console.log("🔍 StartTrainingPolicyHandler - Vérification des permissions");
    console.log("📌 Policy Check: Action.Start, Subject: training →", ability.can(Action.Start, 'training'));
    console.log("📌 Policy Check: Action.Manage, Subject: Training →", ability.can(Action.Manage, 'Training'));
    console.log("📌 Policy Check: Action.Manage, Subject: all →", ability.can(Action.Manage, 'all'));

    return (
      ability.can(Action.Start, 'training') ||
      ability.can(Action.Manage, 'Training') ||
      ability.can(Action.Manage, 'all')
    );
  }
}