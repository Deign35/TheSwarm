import { ImperatorBase } from "Imperators/ImperatorBase";
import { ActionBase } from "Actions/ActionBase";
import { UpgradeAction } from "Actions/UpgradeAction";
import { MoveToPositionAction } from "Actions/MoveToPositionAction";

export class ControllerImperator extends ImperatorBase {
    ActivateCreep(creepData: CreepConsul_Data): SwarmlingResponse {
        let creep = Game.creeps[creepData.creepName];
        if (creep.spawning) { return C_NONE; }
        // This is very fragile, if the creep is in another room, this breaks!
        let controller = Game.getObjectById(creepData.targetID) as StructureController;
        let upgradeAction: ActionBase = new UpgradeAction(creep, controller);
        let upgradeResult = upgradeAction.ValidateAction();

        if (upgradeResult == C_MOVE) {
            new MoveToPositionAction(creep, controller.pos).Run(true);
        } else {
            upgradeAction.Run();
        }
        return C_NONE;
    }
    ActivateSigner(creepData: CreepConsul_Data) {
        let creep = Game.creeps[creepData.creepName];
        if (!creep.room.controller!.sign || creep.room.controller!.sign!.text != MY_SIGNATURE) {
            if (!creep.pos.isNearTo(creep.room.controller!.pos)) {
                creep.moveTo(creep.room.controller!.pos);
            }
            creep.signController(creep.room.controller!, MY_SIGNATURE);
        }
    }
}