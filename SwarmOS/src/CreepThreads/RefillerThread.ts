export const OSPackage: IPackage<SpawnRegistry_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(PKG_CreepRefiller, RefillThread);
    }
}

import { MoveToPositionAction } from "Actions/MoveToPositionAction";
import { TransferAction } from "Actions/TransferAction";
import { CreepThread } from "./CreepThread";

class RefillThread extends CreepThread<SpawnRefiller_Memory> {
    RunThread(): ThreadState {
        if (!this.creep || this.creep.spawning) {
            return ThreadState_Done;
        }
        let creep = this.creep;

        if (this.memory.get) {
            if (creep.carry.energy == creep.carryCapacity) {
                this.memory.tar = undefined;
                this.memory.get = false;
            } else {
                this.getEnergy(this.creep.carryCapacity / 2);
                return ThreadState_Done;
            }
        } else if (creep.carry.energy == 0) {
            this.memory.tar = undefined;
            this.memory.get = true;
            this.getEnergy(creep.carryCapacity / 2);
            return ThreadState_Done;
        }

        if (this.memory.tar && creep.room.name != this.memory.loc) {
            new MoveToPositionAction(creep, new RoomPosition(25, 25, this.memory.loc)).Run();
            return ThreadState_Done;
        }

        return this.RefillSpawnOrExtension();
    }

    RefillSpawnOrExtension(): ThreadState {
        let target = Game.getObjectById(this.memory.tar) as StructureExtension | StructureSpawn;
        if (!target || target.energy == target.energyCapacity) {
            this.memory.tar = undefined;
            let roomData = this.RoomView.GetRoomData(this.creep.room.name);
            if (!roomData) {
                // This should never happen
                this.log.fatal(`Roomdata missing`);
                this.kernel.killProcess(this.pid);
                return ThreadState_Done;
            }

            let extensions = roomData.structures.extension;
            if (extensions) {
                for (let i = 0; i < extensions.length; i++) {
                    target = Game.getObjectById(extensions[i].id) as StructureExtension;
                    if (!target) { continue; }
                    if (target.energy < target.energyCapacity) {
                        this.memory.tar = extensions[i].id;
                        break;
                    }
                }
            }

            if (!this.memory.tar) {
                let spawns = roomData.structures.spawn;
                if (spawns) {
                    for (let i = 0; i < spawns.length; i++) {
                        target = Game.getObjectById(spawns[i].id) as StructureSpawn;
                        if (!target) { continue; }
                        if (target.energy < target.energyCapacity) {
                            this.memory.tar = spawns[i].id;
                            break;
                        }
                    }
                }
            }
        }

        if (this.memory.tar) {
            new TransferAction(this.creep, target).Run()
        } else {
            this.log.info(() => `Nothing to refill`);
        }

        return ThreadState_Done;
    }
}