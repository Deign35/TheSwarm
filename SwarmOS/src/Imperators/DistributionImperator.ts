import * as SwarmCodes from "Consts/SwarmCodes"
import { ImperatorBase } from "Imperators/ImperatorBase";
import { DistributionConsul } from "Consuls/DistributionConsul";
import { MoveToPositionAction } from "Actions/MoveToPositionAction";
import { HiveQueenBase } from "Queens/HiveQueenBase";
import { TransferAction } from "Actions/TransferAction";

const CONSUL_TYPE = 'Distribution';
export class DistributionImperator extends ImperatorBase {
    ActivateCreep(creepData: DistributionConsul_RefillerData): SwarmCodes.SwarmlingResponse {
        let creep = Game.creeps[creepData.creepName];
        if (!creepData.fetching) {
            let target = Game.getObjectById(creepData.refillList[creepData.curTarget]) as SpawnRefillTarget;
            if (!target) { return SwarmCodes.C_NONE; } // This should not return from here.

            let action = new TransferAction(creep, target);
            let actionResult = action.ValidateAction();
            switch (actionResult) {
                case (SwarmCodes.C_NONE): break;
                case (SwarmCodes.E_INVALID): break;
                case (SwarmCodes.E_TARGET_INELLIGIBLE): break;
                case (SwarmCodes.C_MOVE):
                    new MoveToPositionAction(creep, target.pos).Run(true);
                    break;
            }
            if (actionResult != SwarmCodes.C_MOVE) {
                let transferResult = action.Run();
                switch (transferResult) {
                    case (SwarmCodes.C_NONE): break;
                    case (SwarmCodes.E_TARGET_INELLIGIBLE):
                    case (SwarmCodes.E_ACTION_UNNECESSARY):
                        console.log('DistributionResult: ' + transferResult); // What happens i wonder?
                        break;
                }
            }
        }
        return SwarmCodes.C_NONE;
    }
}