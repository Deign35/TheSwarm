export const bundle: IPosisBundle<SpawnData_Memory> = {
    install(processRegistry: IPosisProcessRegistry, extensionRegistry: IPosisExtensionRegistry) {
        processRegistry.register(PKG_CreepRefiller, Refiller);
    },
    rootImageName: PKG_CreepRefiller
}

import { CreepBase } from "./CreepBase";
import { MoveToPositionAction } from "Actions/MoveToPositionAction";
import { TransferAction } from "Actions/TransferAction";

class Refiller extends CreepBase<SpawnRefiller_Memory> {
    protected get CreepPrefix() { return 'Ref_'; }
    protected get SpawnBody() {
        return {
            body: [CARRY, MOVE, CARRY, MOVE],
            cost: 200
        }
    }
    protected get SpawnPriority() {
        return Priority.Highest;
    }
    protected activateCreep(): void {
        let creep = Game.creeps[this.memory.creep!];
        if (!creep) {
            // This should never happen
            this.log.fatal(`Creep activation occurred without an assigned creep`);
            this.memory.creep = undefined;
            return;
        }
        if (creep.spawning) {
            return;
        }
        if (creep.room.name != this.memory.targetRoom) {
            new MoveToPositionAction(creep, new RoomPosition(25, 25, this.memory.targetRoom)).Run();
            return;
        }

        if (this.memory.retrieving) {
            if (this.creep.carry.energy == this.creep.carryCapacity) {
                this.memory.retrieving = false;
                this.memory.targetID = undefined;
            } else {
                this.getEnergy(this.creep.carryCapacity / 2);
                return;
            }
        } else if (this.creep.carry.energy == 0) {
            this.memory.targetID = undefined;
            this.memory.retrieving = true;
            this.getEnergy(this.creep.carryCapacity / 2);
            return;
        }

        this.RefillSpawnOrExtension();
    }

    RefillSpawnOrExtension() {
        let target = Game.getObjectById(this.memory.targetID) as StructureExtension | StructureSpawn;
        if (!target || target.energy == target.energyCapacity) {
            this.memory.targetID = undefined;
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
                    target = Game.getObjectById(extensions[i].id) as StructureExtension;
                    if (!target) { continue; }
                    if (target.energy < target.energyCapacity) {
                        this.memory.targetID = extensions[i].id;
                        break;
                    }
                }
            }

            if (!this.memory.targetID) {
                let spawns = roomData.structures.spawn;
                if (spawns) {
                    for (let i = 0; i < spawns.length; i++) {
                        target = Game.getObjectById(spawns[i].id) as StructureSpawn;
                        if (!target) { continue; }
                        if (target.energy < target.energyCapacity) {
                            this.memory.targetID = spawns[i].id;
                            break;
                        }
                    }
                }
            }
        }

        if (this.memory.targetID) {
            new TransferAction(this.creep, target).Run()
        } else {
            this.log.info(() => `Nothing to refill`);
        }
    }
}