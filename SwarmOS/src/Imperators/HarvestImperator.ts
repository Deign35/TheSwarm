import * as _ from "lodash";
import * as SwarmCodes from "Consts/SwarmCodes";
import { ImperatorBase } from "Imperators/ImperatorBase";
import { MoveToPositionAction } from "Actions/MoveToPositionAction";
import { HarvestAction } from "Actions/HarvestAction";
import { ActionBase } from "Actions/ActionBase";

export class HarvestImperator extends ImperatorBase {
    ActivateCreep(creepData: CollectorConsul_CreepData): SwarmCodes.SwarmlingResponse {
        let creep = Game.creeps[creepData.creepName];
        if (creep.spawning) { return SwarmCodes.C_NONE; }
        let sourceTarget = Game.getObjectById(creepData.targetID) as Source;
        let action: ActionBase = new HarvestAction(creep, sourceTarget);
        let actionResult = action.ValidateAction();

        switch (actionResult) {
            case (SwarmCodes.C_NONE): break;
            case (SwarmCodes.C_MOVE):
                action = new MoveToPositionAction(creep, creepData.harvestPosition);
            case (SwarmCodes.E_ACTION_UNNECESSARY):
                break;
            case (SwarmCodes.E_TARGET_INELLIGIBLE):
            default:
                console.log('HarvestResult: ' + actionResult); // What happens i wonder?  
        }
        return action.Run();
    }
}