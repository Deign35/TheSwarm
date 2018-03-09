import * as _ from "lodash";
import * as SwarmCodes from "Consts/SwarmCodes";
import { ImperatorBase } from "Imperators/ImperatorBase";
import { MoveToPositionAction } from "Actions/MoveToPositionAction";
import { HarvestAction } from "Actions/HarvestAction";
import { ActionBase } from "Actions/ActionBase";
import { BuildAction } from "Actions/BuildAction";
import { RepairAction } from "Actions/RepairAction";

export class HarvestImperator extends ImperatorBase {
    ActivateCreep(creepData: CollectorConsul_CreepData): SwarmCodes.SwarmlingResponse {
        let creep = Game.creeps[creepData.creepName];
        if (creep.spawning) { return SwarmCodes.C_NONE; }
        if (!creep.pos.isEqualTo(creepData.harvestPosition)) {
            new MoveToPositionAction(creep, creepData.harvestPosition).Run(true);
            return SwarmCodes.C_MOVE;
        }
        let sourceTarget = Game.getObjectById(creepData.targetID) as Source;
        let action: ActionBase = new HarvestAction(creep, sourceTarget);
        let actionResult = action.ValidateAction();

        switch (actionResult) {
            case (SwarmCodes.C_NONE): break;
            case (SwarmCodes.C_MOVE):
                action = new MoveToPositionAction(creep, creepData.harvestPosition);
            case (SwarmCodes.E_ACTION_UNNECESSARY):
                if (creep.pos.lookFor(LOOK_CONSTRUCTION_SITES).length > 0) {
                    new BuildAction(creep, creep.pos.lookFor(LOOK_CONSTRUCTION_SITES)[0]!).Run(false);
                } else {
                    let structs = creep.pos.lookFor(LOOK_STRUCTURES);
                    for (let i = 0; i < structs.length; i++) {
                        if ((structs[i] as StructureRampart).setPublic) {
                            continue;
                        }
                        if (structs[i]!.hits + 1000 < structs[i]!.hitsMax) {
                            new RepairAction(creep, structs[i]!).Run(false);
                            break;
                        }
                    }
                }
                break;
            case (SwarmCodes.E_TARGET_INELLIGIBLE):
            default:
                console.log('HarvestResult: ' + actionResult); // What happens i wonder?  
        }
        return action.Run();
    }
}