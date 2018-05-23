export const OSPackage: IPackage<SpawnRegistry_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(PKG_CreepBuilder, BuilderThread2);
        processRegistry.register(PKG_CreepHarvester, HarvesterThread2);
        processRegistry.register(PKG_CreepRepair, RepairThread2);
        processRegistry.register(PKG_CreepUpgrader, UpgraderThread2);
    }
}

import { MoveToPositionAction } from "Actions/MoveToPositionAction";
import { ActionBase } from "Actions/ActionBase";
import { UpgradeAction } from "Actions/UpgradeAction";
import { BuildAction } from "Actions/BuildAction";
import { EasyCreep } from "./EasyCreep";
import { HarvestAction } from "Actions/HarvestAction";
import { RepairAction } from "Actions/RepairAction";

export class BuilderThread2 extends EasyCreep<BuilderThread_Memory> {
    GetActionType() {
        return AT_Build as ActionType;
    }
}

export class UpgraderThread2 extends EasyCreep<UpgraderThread_Memory> {
    GetActionType() {
        return AT_Upgrade as ActionType;
    }
}

export class RepairThread2 extends EasyCreep<RepairThread_Memory> {
    GetActionType() {
        return AT_Repair as ActionType;
    }
}

export class HarvesterThread2 extends EasyCreep<HarvesterThread_Memory> {
    GetActionType() {
        return AT_Harvest as ActionType;
    }
    RunThread(): ThreadState {
        if (!this.creep || this.creep.spawning) {
            return ThreadState_Done;
        }

        if (this.creep.room.name != this.memory.l) {
            new MoveToPositionAction(this.creep, new RoomPosition(25, 25, this.memory.l)).Run();
            return ThreadState_Done;
        }

        let depositTarget = Game.getObjectById(this.memory.t2) as StructureContainer | StructureLink;
        let hasContainer = depositTarget && depositTarget.structureType == STRUCTURE_CONTAINER;
        if (hasContainer) {
            if (!this.creep.pos.isEqualTo(depositTarget.pos)) {
                new MoveToPositionAction(this.creep, depositTarget.pos).Run();
            }
        }

        let target = Game.getObjectById(this.memory.t) as Source;

        let action: ActionBase = new HarvestAction(this.creep, target);
        switch (action.ValidateAction()) {
            case (SR_NONE):
            case (SR_MOVE):
            case (SR_ACTION_UNNECESSARY): // Creep's carry is full
                break;
            case (SR_TARGET_INELLIGIBLE): // Target is empty.
            default:
                if (this.creep.carry.energy > 0) {
                    if (hasContainer && depositTarget.hits < depositTarget.hitsMax) {
                        action = new RepairAction(this.creep, depositTarget);
                    }
                }
        }

        action.Run(!hasContainer);
        return ThreadState_Done
    }
}