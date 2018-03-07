import * as SwarmCodes from "Consts/SwarmCodes"
import { ImperatorBase } from "Imperators/ImperatorBase";
import { DistributionConsul } from "Consuls/DistributionConsul";
import { MoveToPositionAction } from "Actions/MoveToPositionAction";
import { HiveQueenBase } from "Queens/HiveQueenBase";
import { TransferAction } from "Actions/TransferAction";

export class DistributionImperator extends ImperatorBase {
    ActivateCreep(creepData: DistributionConsul_CreepData): SwarmCodes.SwarmlingResponse {
        let creep = Game.creeps[creepData.creepName];
        let transferResult: SwarmCodes.SwarmlingResponse = SwarmCodes.C_NONE;
        if (creep && !creep.spawning) {
            let target = Game.getObjectById(creepData.targetID) as RefillTarget;
            if (!target) { return SwarmCodes.C_NONE; } // This should not return from here.

            let action = new TransferAction(creep, target);
            transferResult = action.ValidateAction();
            switch (transferResult) {
                case (SwarmCodes.C_NONE): break;
                case (SwarmCodes.E_INVALID): break;
                case (SwarmCodes.E_TARGET_INELLIGIBLE): break;
                case (SwarmCodes.C_MOVE):
                    new MoveToPositionAction(creep, target.pos).Run(true);
                    break;
            }
            if (transferResult != SwarmCodes.C_MOVE) {
                transferResult = action.Run();
                switch (transferResult) {
                    case (SwarmCodes.C_NONE):
                        break;
                    case (SwarmCodes.E_TARGET_INELLIGIBLE):
                    case (SwarmCodes.E_ACTION_UNNECESSARY):
                        //console.log('DistributionResult: ' + transferResult); // What happens i wonder?
                        break;
                }
            }
        }
        return transferResult;
    }
}