export const OSPackage: IPackage<SpawnRegistry_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(CJ_Harvester, HarvestJob);
    }
}
import { BasicProcess } from "Core/BasicTypes";

class HarvestJob extends BasicProcess<HarvestJob_Memory> {
    @extensionInterface(EXT_CreepRegistry)
    creepRegistry!: ICreepRegistryExtensions;
    @extensionInterface(EXT_RoomView)
    protected View!: IRoomDataExtension;
    @extensionInterface(EXT_CreepActivity)
    protected creepActivity!: ICreepActivityExtensions;
    RunThread(): ThreadState {
        let target = Game.getObjectById(this.memory.t) as Source | Mineral;
        let inLink = Game.getObjectById(this.memory.i) as StructureLink | undefined;
        let outLink = Game.getObjectById(this.memory.o) as StructureLink | undefined;
        let container = Game.getObjectById(this.memory.c) as StructureContainer | undefined;
        let creep = this.creepRegistry.tryGetCreep(this.memory.h, this.pid) as Creep | undefined;

        if (creep && !creep.spawning) {
            if (!this.memory.a || !this.kernel.getProcessByPID(this.memory.a)) {
                this.CreateHarvestActivity(this.memory.h!);
            }
            if (inLink) {
                if (creep.carry.energy * 1.5 >= creep.carryCapacity) {
                    creep.transfer(inLink, RESOURCE_ENERGY);
                }
                if (container) {
                    container.destroy();
                    delete this.memory.c;
                }
            }
            if ((target as Source).energy == 0) {
                creep.cancelOrder('harvest');
                this.sleeper.sleep(this.memory.a!, (target as Source).ticksToRegeneration);
                if (container && container.hits < container.hitsMax) {
                    if (creep.carry.energy > 0) {
                        creep.repair(container);
                    } else if (container.energy > 0) {
                        creep.withdraw(container, RESOURCE_ENERGY);
                    } else {
                        this.sleeper.sleep(this.pid, (target as Source).ticksToRegeneration);
                    }
                }
            }
            if (container && !creep.pos.isEqualTo(container.pos)) {
                creep.cancelOrder('move');
                this.creepActivity.MoveCreep(creep, container.pos);
            }

            if (creep.ticksToLive! < 80) {
                // Let the activity burn itself out while this job begins the next one.
                creep = undefined;
                delete this.memory.h;
            }
        }

        if (!creep) {
            if (!this.memory.a || !this.kernel.getProcessByPID(this.memory.a)) {
            }
        }

        if (inLink && outLink && !inLink.cooldown && inLink.energy * 4 >= inLink.energyCapacity) {
            if (outLink.energyCapacity - outLink.energy >= inLink.energy / 2) {
                inLink.transferEnergy(outLink);
            }
        }

        return ThreadState_Done;
    }

    CreateSpawnActivity(spawnLevel: number) {
        this.memory.a = this.spawnRegistry.requestSpawn({
            l: spawnLevel,
            ct: CT_Harvester,
            n: this.memory.l + '_HJ' + this.memory.t.slice(-1)
        }, this.memory.l, Priority_High, 3, {
                ct: CT_Harvester,
                lvl: spawnLevel
            });
        let spawnMem: SpawnActivity_Memory = {
            sID: this.memory.a,
            HC: 'SpawnComplete'
        }
    }
    SpawnComplete(creepID: string) {
        if (this.memory.h) {
            let oldCreep = this.creepRegistry.tryGetCreep(this.memory.h, this.pid);
        }
        this.memory.h = creepID;
        this.CreateHarvestActivity(creepID);
    }

    CreateHarvestActivity(creepID: string) {
        if (this.creepRegistry.tryReserveCreep(creepID, this.pid)) {
            this.memory.a = this.creepActivity.CreateNewCreepActivity({
                at: AT_Harvest,
                c: this.memory.h!,
                HC: 'HarvestComplete'
            }, this.pid, this.extensions);
        }
    }
    HarvestComplete(creepID: string) {
        let creep = Game.creeps[creepID];
        if (creep) {
            this.CreateHarvestActivity(creepID);
        } else {
            delete this.memory.h;
        }
    }
}