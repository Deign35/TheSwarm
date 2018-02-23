import * as SwarmCodes from "Consts/SwarmCodes"
import { ImperatorBase } from "Imperators/ImperatorBase";
import { ControllerConsul } from "Consuls/ControllerConsul";
import { ActionBase } from "Actions/ActionBase";
import { UpgradeAction } from "Actions/UpgradeAction";
import { MoveToPositionAction } from "Actions/MoveToPositionAction";

export class ControllerImperator extends ImperatorBase {
    ActivateCreep(creepData: ControllerConsul_CreepData): SwarmCodes.SwarmlingResponse {
        let creep = Game.creeps[creepData.creepName];
        if (creep.spawning || creepData.fetching) { return SwarmCodes.C_NONE; }
        // This is very fragile, if the creep is in another room, this breaks!
        let controller = Game.getObjectById(creepData.controllerTarget) as StructureController;
        let upgradeAction: ActionBase = new UpgradeAction(creep, controller);
        let upgradeResult = upgradeAction.ValidateAction();

        if (upgradeResult == SwarmCodes.C_MOVE) {
            new MoveToPositionAction(creep, controller.pos).Run(true);
        } else {
            upgradeAction.Run();
        }
        return SwarmCodes.C_NONE;
    }
}