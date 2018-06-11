export const OSPackage: IPackage<SpawnRegistry_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(CJ_Harvest, HarvestJob);
    }
}
import { BasicProcess } from "Core/BasicTypes";

// (TODO): Search for buildings
class HarvestJob extends BasicProcess<HarvestJob_Memory> {
    @extensionInterface(EXT_CreepRegistry)
    creepRegistry!: ICreepRegistryExtensions;
    @extensionInterface(EXT_RoomView)
    protected View!: IRoomDataExtension;
    @extensionInterface(EXT_CreepActivity)
    protected creepActivity!: ICreepActivityExtensions;
    RunThread(): ThreadState {
        let target = Game.getObjectById(this.memory.t) as Source | Mineral;
        let inLink = Game.getObjectById(this.memory.l) as StructureLink | undefined;
        let container = Game.getObjectById(this.memory.c) as StructureContainer | undefined;
        let creep = this.creepRegistry.tryGetCreep(this.memory.h, this.pid) as Creep | undefined;

        if (creep && !creep.spawning) {
            if (inLink) {
                if (creep.carry.energy * 1.5 >= creep.carryCapacity) {
                    creep.transfer(inLink, RESOURCE_ENERGY);
                }
                if (container) {
                    container.destroy();
                    this.kernel.killProcess(this.memory.a);
                    delete this.memory.c;
                    delete this.memory.a;
                }
            }

            if (!this.memory.a || !this.kernel.getProcessByPID(this.memory.a)) {
                this.CreateHarvestActivity(this.memory.h!);
            }
            if (creep.ticksToLive! < 80) {
                // Let the activity burn itself out while this job begins the next one.
                creep = undefined;
                delete this.memory.h;
                delete this.memory.a;
            }
        }

        if (!creep) {
            if (!this.memory.a || !this.kernel.getProcessByPID(this.memory.a)) {
                /*if ((target as Mineral).mineralType && (target as Mineral).mineralAmount > 0) {
                    let extractor = target.pos.lookFor(LOOK_STRUCTURES) as StructureExtractor[];
                    for (let i = 0; i < extractor.length; i++) {
                        if (extractor[i].structureType == STRUCTURE_EXTRACTOR && (!extractor[i].cooldown || extractor[i].cooldown <= 100)) {
                            this.CreateSpawnActivity(3);
                            break;
                        }
                    }
                }*/
                if ((target as Source).energyCapacity) {
                    let spawnLevel = 0;
                    if (target.room!.controller && target.room!.controller!.my) {
                        if (target.room!.energyCapacityAvailable >= 800) {
                            spawnLevel = 2;
                        } else if (target.room!.energyCapacityAvailable >= 550) {
                            spawnLevel = 1;
                        }
                    } else {
                        spawnLevel = 2;
                    }

                    this.CreateSpawnActivity(spawnLevel);
                }
            }
        }

        return ThreadState_Done;
    }

    CreateSpawnActivity(spawnLevel: number) {
        let sID = this.spawnRegistry.requestSpawn({
            l: spawnLevel,
            c: CT_Harvester,
            n: this.memory.rID + '_HJ' + this.memory.t.slice(-1),
        }, this.memory.rID, Priority_High, 3, {
                ct: CT_Harvester,
                lvl: spawnLevel
            });
        let spawnMem: SpawnActivity_Memory = {
            sID: sID,
            HC: 'SpawnComplete'
        }
        this.memory.a = this.kernel.startProcess(SPKG_SpawnActivity, spawnMem);
        this.kernel.setParent(this.memory.a, this.pid);

        if (!this.memory.l) {
            let possibleLinks
        }
    }

    SpawnComplete(creepID: string) {
        if (this.memory.h) {
            // (TODO): Orphaned creep, what to do with it?!??!?!
            let oldCreep = this.creepRegistry.tryGetCreep(this.memory.h, this.pid);
            this.creepRegistry.releaseCreep(this.memory.h, this.pid);
            this.log.warn(`SpawnComplete, but harvester already exists.  Not working functionality`);
        }
        this.memory.h = creepID;
        this.CreateHarvestActivity(creepID);
    }

    CreateHarvestActivity(creepID: string) {
        if (this.creepRegistry.tryReserveCreep(creepID, this.pid)) {
            let container = Game.getObjectById(this.memory.c) as StructureContainer | undefined;
            let link = Game.getObjectById(this.memory.l) as StructureLink | undefined;
            if (this.memory.SUPPORT || (!container && !link)) {
                this.memory.a = this.creepActivity.CreateNewCreepActivity({
                    at: AT_Harvest,
                    c: creepID,
                    HC: 'HarvestComplete',
                    t: this.memory.t,
                    e: [ERR_FULL, ERR_NOT_ENOUGH_RESOURCES]
                }, this.pid);
            } else if (container) {
                let actions: SingleCreepActivity_Memory[] = [];
                actions.push({
                    at: AT_MoveToPosition,
                    n: 1,
                    p: container.pos
                });
                actions.push({
                    at: AT_Harvest,
                    e: [ERR_FULL],
                    t: this.memory.t
                });
                actions.push({
                    at: AT_Withdraw,
                    t: this.memory.c
                });
                actions.push({
                    at: AT_Repair,
                    t: this.memory.c
                });
                actions.push({
                    at: AT_Drop,
                    p: container.pos
                });
                this.memory.a = this.kernel.startProcess(SPKG_RepetitiveCreepActivity, {
                    a: actions,
                    c: creepID,
                    HC: 'HarvestComplete'
                } as RepetitiveCreepActivity_Memory);
            } else if (link) {
                // (TODO): Set up refilling and using the link
            }

            this.kernel.setParent(this.memory.a!, this.pid);
        }
    }

    HarvestComplete(creepID: string) {
        let creep = this.creepRegistry.tryGetCreep(creepID);
        if (creep) {
            this.CreateHarvestActivity(creepID);
        } else {
            delete this.memory.h;
        }
    }
}