import { SwarmConsulBase } from "Consuls/ConsulBase";
import { SwarmController } from "SwarmTypes/SwarmStructures/SwarmController";
import { SwarmLoader } from "SwarmTypes/SwarmLoader";
import { SwarmCreep } from "SwarmTypes/SwarmCreep";
import { UpgradeAction } from "Actions/UpgradeAction";
import { ActionBase, NoOpAction } from "Actions/ActionBase";
import { MoveToPositionAction } from "Actions/MoveToPositionAction";
import { SwarmRoom } from "SwarmTypes/SwarmRoom";

declare type CONTROLLER_IDS = 'controllerIDs';
const CONTROLLER_IDS = 'controllerIDs';
const ROOM_DATA = 'roomData';
declare interface ControllerConsulData {
    [CONTROLLER_IDS]: string[];
    [ROOM_DATA]: Dictionary;
}
export class ControlConsul extends SwarmConsulBase<ConsulType.Control> implements ControllerConsulData {
    get controllerIDs(): ControllerConsulData[CONTROLLER_IDS] {
        return this.memory.GetData(CONTROLLER_IDS);
    }
    get roomData() { return this.memory.GetData(ROOM_DATA) };
    private ControllerObjects: IDictionary<SwarmController> = {

    };
    PrepObject() {
        let ids = this.controllerIDs;
        for (let i = 0; i < ids.length; i++) {
            if (!this.ControllerObjects[ids[i]]) {
                let controller = SwarmLoader.GetObject<SwarmController>(ids[i], MASTER_STRUCTURE_MEMORY_ID);
                this.ControllerObjects[ids[i]] = controller;
            }

            this.ControllerObjects[ids[i]].memory.ReserveMemory();
            this.ControllerObjects[ids[i]].PrepObject();
            //this.PrepSource(this.ControllerObjects[ids[i]]);
        }
    }

    protected PrepController(controller: SwarmController) {
        if (controller.my) { // My controller
            let creeps = {};
            let workCount = 0;
            for (let i = 0; i < controller.creeps.length; i++) {
                if (!SwarmLoader.HasObject(controller.creeps[i], MASTER_STRUCTURE_MEMORY_ID)) {
                    controller.creeps.splice(i--, 1);
                }
                let creep = SwarmLoader.GetObject<SwarmCreep>(controller.creeps[i], MASTER_STRUCTURE_MEMORY_ID);
                creeps[creep.name] = creep;
                workCount += creep.getActiveBodyparts(WORK);
            }
            if (controller.allowance > 0 && workCount > controller.allowance) {
                DoTest('CTRL_TODO', this.memory, () => { }, () => { });
            }
            switch (controller.level) {
                // Do level specific changes here.
            }
        } else if (controller.reservation && controller.reservation.username == MY_USERNAME) {
            // I have it reserved
        } else { // Unowned or enemy.
        }
    }

    Activate() {
        let ids = this.controllerIDs;
        for (let i = 0; i < ids.length; i++) {
            let controller = SwarmLoader.GetObject<SwarmController>(ids[i], MASTER_ROOMOBJECT_MEMORY_ID);

            if (controller.creeps.length == 0) {
                let creepBody: BodyPartConstant[] = [WORK, CARRY, MOVE];
                /*if (controller.room.energyCapacityAvailable >= 800) {
                    creepBody = ConstructBodyArray([[WORK, 6], [CARRY, 1], [MOVE, 3]]);
                } else if (controller.room.energyCapacityAvailable > 550) {
                    creepBody = ConstructBodyArray([[WORK, 5], [MOVE, 1]]);
                } else if (controller.room.energyCapacityAvailable > 350) {
                    creepBody = ConstructBodyArray([[WORK, 2], [CARRY, 2], [MOVE, 1]])
                }*/

                SwarmLoader.GetObject<SwarmRoom>(controller.room.name, MASTER_ROOM_MEMORY_ID).TrySpawn(
                    creepBody, {
                        requestorID: this.id,
                        requestorType: MASTER_CONSUL_MEMORY_ID,
                        priority: Priority.Low
                    }
                )
            }

            for (let j = 0; j < controller.creeps.length; j++) {
                let creep = SwarmLoader.GetObject<SwarmCreep>(controller.creeps[j], MASTER_CREEP_MEMORY_ID);
                this.ActivateCreep(creep, controller);
            }

            SwarmLoader.SaveObject(this.ControllerObjects[ids[i]]);
        }
    }
    protected ActivateCreep(creep: SwarmCreep, controller: SwarmController) {
        if (creep && !creep.spawning) {
            let action: ActionBase = new UpgradeAction(creep, controller.prototype);
            let validation = action.ValidateAction();
            switch (validation) {
                case (C_NONE):
                    break;
                case (C_MOVE):
                case (E_REQUIRES_ENERGY):
                    action = new MoveToPositionAction(creep, controller.pos);
                    break;
                /*case (E_REQUIRES_ENERGY):
                    action = new NoOpAction(creep);
                    break;*/
            }

            action.Run();
        }
    }
}