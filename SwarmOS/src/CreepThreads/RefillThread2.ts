export const OSPackage: IPackage<SpawnRegistry_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(PKG_CreepRefiller, RefillThread2);
    }
}

import { MoveToPositionAction } from "Actions/MoveToPositionAction";
import { TransferAction } from "Actions/TransferAction";
import { EasyCreep } from "./EasyCreep";

class RefillThread2 extends EasyCreep<RefillerThread_Memory> {
    GetActionType() {
        return AT_Transfer as ActionType;
    }
    GetTargetID() {
        let target = Game.getObjectById(this.memory.t) as StructureExtension | StructureSpawn;
        if (!target || target.energy == target.energyCapacity) {
            this.memory.t = undefined;
            let roomData = this.RoomView.GetRoomData(this.creep.room.name);
            if (!roomData) {
                // This should never happen
                this.log.fatal(`Roomdata missing`);
                this.kernel.killProcess(this.pid);
                return;
            }

            let extensions = roomData.structures.extension;
            if (extensions) {
                for (let i = 0; i < extensions.length; i++) {
                    target = Game.getObjectById(extensions[i]) as StructureExtension;
                    if (!target) { continue; }
                    if (target.energy < target.energyCapacity) {
                        this.memory.t = extensions[i];
                        break;
                    }
                }
            }

            if (!this.memory.t) {
                let spawns = roomData.structures.spawn;
                if (spawns) {
                    for (let i = 0; i < spawns.length; i++) {
                        target = Game.getObjectById(spawns[i]) as StructureSpawn;
                        if (!target) { continue; }
                        if (target.energy < target.energyCapacity) {
                            this.memory.t = spawns[i];
                            break;
                        }
                    }
                }
            }
        }

        return this.memory.t;
    }
}