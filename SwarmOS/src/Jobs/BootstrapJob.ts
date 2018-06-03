export const OSPackage: IPackage<SpawnRegistry_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(CJ_Boot, BootstrapJob);
    }
}
import { BasicProcess } from "Core/BasicTypes";

// (TODO): Search for buildings
class BootstrapJob extends BasicProcess<Bootstrap_Memory> {
    @extensionInterface(EXT_CreepRegistry)
    creepRegistry!: ICreepRegistryExtensions;
    @extensionInterface(EXT_RoomView)
    protected View!: IRoomDataExtension;
    @extensionInterface(EXT_CreepActivity)
    protected creepActivity!: ICreepActivityExtensions;


    get creeps() { return this.memory.creeps; }
    get containers() { return this.memory.containers; }
    get room(): Room | undefined { return Game.rooms[this.memory.rID] };
    get roomData() { return this.View.GetRoomData(this.memory.rID); }

    RunThread(): ThreadState {
        if (this.containers.length == 0) {
            if (!this.room) {
                return ThreadState_Done;
            }
            let containers = this.room.find(FIND_STRUCTURES, {
                filter: (struct) => {
                    return struct.structureType == STRUCTURE_CONTAINER;
                }
            });
            if (containers.length > 0) {
                // Replace this job with a standard room worker group
                this.kernel.killProcess(this.pid, `Bootstrapping ${this.memory.rID} complete`);
            }

            let sites = this.room.find(FIND_CONSTRUCTION_SITES);
            if (sites && sites.length > 0) {
                for (let i = 0; i < sites.length; i++) {
                    if (sites[i].structureType == STRUCTURE_CONTAINER) {
                        this.containers.push(sites[i].id);
                    }
                }
            } else {
                let spawns = this.room.find(FIND_MY_SPAWNS);
                if (spawns.length == 0) {
                    return ThreadState_Done;
                }
                let spawn = spawns[0];

                let controller = this.room.controller;
                if (controller) {
                    this.CreatePathAndContainerSites(spawn, controller);
                }

                let sources = this.room.find(FIND_SOURCES);
                for (let i = 0; i < sources.length; i++) {
                    this.CreatePathAndContainerSites(spawn, sources[i]);
                }
                // (TODO): Find a nearby spot to put another container.
            }
        }

        if (!this.memory.refiller || !this.kernel.getProcessByPID(this.memory.refiller)) {
        }


        return ThreadState_Done;
    }

    CreatePathAndContainerSites(spawn: StructureSpawn, target: ObjectTypeWithID) {
        if (!this.room) {
            return false;
        }
        let path = spawn.pos.findPathTo(target, {
            ignoreCreeps: true,
            ignoreDestructibleStructures: true,
            ignoreRoads: true,
            range: 1,
            swampCost: 1
        });
        for (let i = 0; i < path.length - 1; i++) {
            this.room.createConstructionSite(path[i].x, path[i].y, STRUCTURE_ROAD);
        }
        this.room.createConstructionSite(path[path.length - 1].x, path[path.length - 1].y, STRUCTURE_CONTAINER);

        return true;
    }

    CreateRefillerSpawnActivity() {
        let sID = this.spawnRegistry.requestSpawn({
            ct: CT_Worker,
            l: 0,
            n: this.memory.rID + '_BS',
        }, this.memory.rID, Priority_Highest, 1, {
                ct: CT_Worker,
                lvl: 0
            });
        this.memory.refiller = this.kernel.startProcess(SPKG_SpawnActivity, {
            sID: sID,
            HC: 'RefillSpawnComplete'
        });
        this.kernel.setParent(this.memory.refiller, this.pid);
    }

    RefillSpawnComplete(creepID: string) {
        if (this.creepRegistry.tryReserveCreep(creepID, this.pid)) {
            this.memory.refiller = this.creepActivity.CreateNewCreepActivity({
            })
        }
    }

    SpawnComplete(creepID: string) {
        this.memory.hasSpawnRequest = false;
        this.creeps[creepID] = {};
        this.CreateActivity(creepID);
    }

    CreateActivity(creepID: string) {
        if (this.creepRegistry.tryReserveCreep(creepID, this.pid)) {
            this.creeps[creepID].a = this.creepActivity.CreateNewCreepActivity({
                at: AT_Harvest,
                c: creepID,
                HC: 'ActivityComplete',
                t: this.memory.t
            }, this.pid, this.extensions);
        }
    }
    ActivityComplete(creepID: string) {
        let creep = this.creepRegistry.tryGetCreep(creepID);
        if (creep) {
            this.CreateActivity(creepID);
        } else {
            delete this.memory.h;
        }
    }
}