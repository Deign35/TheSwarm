export const OSPackage: IPackage<SpawnRegistry_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(PKG_BootRoom, BootstrapJob);
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
                //this.kernel.killProcess(this.pid, `Bootstrapping ${this.memory.rID} complete`);
            }

            let sites = this.room.find(FIND_CONSTRUCTION_SITES);
            if (sites && sites.length > 0) {
                let targetMem: IDictionary<string, WorkerTarget_PriorityMemory> = {}
                for (let i = 0; i < sites.length; i++) {
                    if (sites[i].structureType == STRUCTURE_CONTAINER) {
                        this.containers.push(sites[i].id);
                        targetMem[sites[i].id] = {
                            a: AT_Build,
                            p: Priority_Low,
                            t: TT_ConstructionSite
                        }
                    }
                }

                let bootMem: BootstrapBuilder_Memory = {
                    bui: {},
                    rID: this.memory.rID,
                    sites: this.containers
                }
                let newPID = this.kernel.startProcess(CJ_BootBuild, bootMem);
                this.roomData!.groups[CJ_BootBuild]!.push(newPID);
                this.kernel.setParent(newPID, this.pid);

                let workMem: WorkerGroup_Memory = {
                    creeps: {},
                    rID: this.memory.rID
                }
                newPID = this.kernel.startProcess(CJ_Work, workMem);
                this.roomData!.groups[CJ_Work] = newPID;
                return ThreadState_Active;
            } else {
                let spawns = this.room.find(FIND_MY_SPAWNS);
                if (spawns.length == 0) {
                    return ThreadState_Done;
                }
                let spawn = spawns[0];
                spawn.room.createConstructionSite(spawn.pos.x - 1, spawn.pos.y, STRUCTURE_CONTAINER);

                let controller = this.room.controller;
                if (controller) {
                    this.CreatePathAndContainerSites(spawn, controller);
                }

                this.roomData!.groups[CJ_BootRefill] = [];
                this.roomData!.groups[CJ_Harvest] = [];
                this.roomData!.groups[CJ_BootBuild] = [];
                let sources = this.room.find(FIND_SOURCES);
                for (let i = 0; i < sources.length; i++) {
                    this.CreatePathAndContainerSites(spawn, sources[i]);
                    let startMem: BootstrapRefiller_Memory = {
                        hb: false,
                        rID: this.memory.rID,
                        s: sources[i].id,
                        ref: {},
                    }
                    let newPID = this.kernel.startProcess(CJ_BootRefill, startMem);
                    this.roomData!.groups[CJ_BootRefill]!.push(newPID);
                    this.kernel.setParent(newPID, this.pid);

                    let harvMem: HarvestJob_Memory = {
                        r: this.memory.rID,
                        t: sources[i].id
                    }
                    newPID = this.kernel.startProcess(CJ_Harvest, harvMem);
                    this.roomData!.groups[CJ_Harvest]!.push(newPID);

                    let buildMem: BootstrapBuilder_Memory = {
                        bui: {},
                        rID: this.memory.rID,
                        s: sources[i].id,
                        sites: []
                    }
                    newPID = this.kernel.startProcess(CJ_BootBuild, buildMem);
                    this.roomData!.groups[CJ_BootBuild]!.push(newPID);
                    this.kernel.setParent(newPID, this.pid);
                }
                return ThreadState_Done;
            }
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
}