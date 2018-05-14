export const OSPackage: IPackage<SpawnerExtension_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(PKG_CreepRefiller, Refiller);
    }
}

import { CreepBase } from "./CreepBase";
import { MoveToPositionAction } from "Actions/MoveToPositionAction";
import { TransferAction } from "Actions/TransferAction";

class Refiller extends CreepBase<SpawnRefiller_Memory> {
    protected get CreepPrefix() { return 'Ref_'; }
    /*
         protected get SpawnRequest() { should replace these }
     protected get SpawnBody() {
        let spawnCap = Game.rooms[this.memory.loc].energyCapacityAvailable;
        if (spawnCap >= 2000) {
            return {
                body: [
                    CARRY, CARRY, CARRY, CARRY, CARRY,
                    MOVE, MOVE, MOVE, MOVE, MOVE,
                    CARRY, CARRY, CARRY, CARRY, CARRY,
                    MOVE, MOVE, MOVE, MOVE, MOVE,
                    CARRY, CARRY, CARRY, CARRY, CARRY,
                    MOVE, MOVE, MOVE, MOVE, MOVE,
                    CARRY, CARRY, CARRY, CARRY, CARRY,
                    MOVE, MOVE, MOVE, MOVE, MOVE
                ],
                cost: 2000
            }
        } else if (spawnCap > 1000) {
            return {
                body: [
                    CARRY, CARRY, CARRY, CARRY, CARRY,
                    MOVE, MOVE, MOVE, MOVE, MOVE,
                    CARRY, CARRY, CARRY, CARRY, CARRY,
                    MOVE, MOVE, MOVE, MOVE, MOVE,
                ],
                cost: 1000
            }
        } else if (spawnCap >= 500) {
            return {
                body: [
                    CARRY, CARRY, CARRY, CARRY, CARRY,
                    MOVE, MOVE, MOVE, MOVE, MOVE,
                ],
                cost: 500
            }
        } else {
            if (Object.keys(Game.creeps).length == 0) {
                return {
                    body: [WORK, WORK, CARRY, MOVE],
                    cost: 300
                }
            } else {
                return {
                    body: [CARRY, MOVE, CARRY, MOVE],
                    cost: 200
                }
            }
        }
    }
    protected get SpawnPriority() {
        let spawnCap = Game.rooms[this.memory.loc].energyCapacityAvailable;
        if (spawnCap > 4000) {
            return Priority_Low;
        } else if (spawnCap > 2000) {
            return Priority_Medium;
        } else if (spawnCap > 1000) {
            return Priority_High;
        } else {
            if (Object.keys(Game.creeps).length == 0) {
                return Priority_EMERGENCY;
            }
            return Priority_Highest;
        }
    }*/
    protected activateCreep(): void {
        let creep = this.creep;

        if (this.memory.en) {
            if (creep.carry.energy == creep.carryCapacity) {
                this.memory.tar = undefined;
                this.memory.en = false;
            } else {
                return;
            }
        } else if (creep.carry.energy == 0) {
            this.memory.tar = undefined;
            this.memory.en = true;
            this.getEnergy(creep.carryCapacity / 2);
            return;
        }

        if (this.memory.tar && creep.room.name != this.memory.loc) {
            new MoveToPositionAction(creep, new RoomPosition(25, 25, this.memory.loc)).Run();
            return;
        }

        this.RefillSpawnOrExtension();
    }

    RefillSpawnOrExtension() {
        let target = Game.getObjectById(this.memory.tar) as StructureExtension | StructureSpawn;
        if (!target || target.energy == target.energyCapacity) {
            this.memory.tar = undefined;
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
    }
}