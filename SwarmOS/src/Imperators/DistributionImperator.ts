import { ImperatorBase } from "Imperators/ImperatorBase";
import { MoveToPositionAction } from "Actions/MoveToPositionAction";
import { TransferAction } from "Actions/TransferAction";

export class DistributionImperator extends ImperatorBase {
    ActivateCreep(creepData: DistributionConsul_CreepData): SwarmlingResponse {
        let creep = Game.creeps[creepData.creepName];
        let transferResult: SwarmlingResponse = C_NONE;
        if (creep && !creep.spawning) {
            let target = Game.getObjectById(creepData.targetID) as RefillTarget;
            if (!target) { return C_NONE; } // This should not return from here.

            let action = new TransferAction(creep, target);
            transferResult = action.ValidateAction();
            switch (transferResult) {
                case (C_NONE): break;
                case (E_INVALID): break;
                case (E_TARGET_INELLIGIBLE): break;
                case (C_MOVE):
                    new MoveToPositionAction(creep, target.pos).Run(true);
                    break;
            }
            if (transferResult != C_MOVE) {
                transferResult = action.Run();
                switch (transferResult) {
                    case (C_NONE):
                        break;
                    case (E_TARGET_INELLIGIBLE):
                    case (E_ACTION_UNNECESSARY):
                        //console.log('DistributionResult: ' + transferResult); // What happens i wonder?
                        break;
                }
            }
        }
        return transferResult;
    }
}