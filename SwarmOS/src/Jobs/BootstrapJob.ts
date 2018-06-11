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
                if (this.room.energyCapacityAvailable >= 550) { // Big enough to support a 5 work harvester
                    this.CompleteBootstrapping();
                }
                return ThreadState_Done;
            }

            let sites = this.room.find(FIND_CONSTRUCTION_SITES, {
                filter: (site) => {
                    return site.structureType == STRUCTURE_CONTAINER;
                }
            });
            if (sites && sites.length > 0) {
                for (let i = 0; i < sites.length; i++) {
                    this.containers.push(sites[i].id);
                }
                this.roomData!.groups[CJ_BootRefill] = [];
                this.roomData!.groups[CJ_Harvest] = [];
                this.roomData!.groups[CJ_BootBuild] = [];

                let sources = this.room.find(FIND_SOURCES);
                let spawn = this.room.find(FIND_MY_SPAWNS)[0];
                for (let i = 0; i < sources.length; i++) {
                    this.CreatePathAndContainerSites(spawn, sources[i]);

                    let harvMem: HarvestJob_Memory = {
                        rID: this.memory.rID,
                        t: sources[i].id
                    }
                    let newPID = this.kernel.startProcess(CJ_Harvest, harvMem);
                    this.roomData!.groups[CJ_Harvest]!.push(newPID);
                    // Don't set as parent so that the harvester job will continue even once bootstrapping is complete.

                    let startMem: BootstrapRefiller_Memory = {
                        hb: false,
                        rID: this.memory.rID,
                        s: sources[i].id,
                        ref: {},
                    }
                    newPID = this.kernel.startProcess(CJ_BootRefill, startMem);
                    this.roomData!.groups[CJ_BootRefill]!.push(newPID);
                    this.kernel.setParent(newPID, this.pid);

                    let buildMem: BootstrapBuilder_Memory = {
                        bui: {},
                        rID: this.memory.rID,
                        s: sources[i].id,
                        sites: this.containers
                    }
                    newPID = this.kernel.startProcess(CJ_BootBuild, buildMem);
                    this.roomData!.groups[CJ_BootBuild]!.push(newPID);
                    this.kernel.setParent(newPID, this.pid);
                }
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
                let sources = this.room.find(FIND_SOURCES);
                for (let i = 0; i < sources.length; i++) {
                    this.CreatePathAndContainerSites(spawn, sources[i]);
                }
            }
            return ThreadState_Done;

        } else {
            for (let i = 0; i < this.containers.length; i++) {
                if (!Game.getObjectById(this.containers[i])) {
                    this.containers.splice(i--, 1);
                }
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

    protected CompleteBootstrapping() {
        this.kernel.killProcess(this.pid, `Bootstrapping ${this.memory.rID} complete`); // This will kill all the child processes.
        let containers = this.room!.find(FIND_STRUCTURES, {
            filter: (struct) => {
                return struct.structureType == STRUCTURE_CONTAINER;
            }
        });

        let refillerEnergyTargets: WorkerTargetDictionary = {};

        let sources = this.room!.find(FIND_SOURCES);
        for (let i = 0; i < sources.length; i++) {
            let container = sources[i].pos.findInRange(containers, 1);
            if (container && container.length > 0) {
                refillerEnergyTargets[container[0].id] = {
                    a: AT_Withdraw,
                    p: Priority_Medium,
                    t: TT_StorageContainer,
                };
            }
        }

        let refillerFillTargets: WorkerTargetDictionary = {};
        let workerEnergyTargets: WorkerTargetDictionary = {};

        let spawn = this.room!.find(FIND_MY_SPAWNS)[0];
        refillerFillTargets[spawn.id] = {
            a: AT_Transfer,
            p: Priority_Medium,
            t: TT_StorageContainer
        }
        let spawnTainer = spawn.pos.findInRange(containers, 1);
        if (spawnTainer && spawnTainer.length > 0) {
            refillerEnergyTargets[spawnTainer[0].id] = {
                a: AT_Withdraw,
                p: Priority_Low,
                t: TT_StorageContainer
            }
            refillerFillTargets[spawnTainer[0].id] = {
                a: AT_Transfer,
                p: Priority_Lowest,
                t: TT_StorageContainer,
            };
            workerEnergyTargets[spawnTainer[0].id] = {
                a: AT_Withdraw,
                p: Priority_Low,
                t: TT_StorageContainer
            };
        }

        let workerWorkTargets: WorkerTargetDictionary = {};
        workerWorkTargets[this.room!.controller!.id] = {
            a: AT_Upgrade,
            p: Priority_Lowest,
            t: TT_Controller,
        }
        let controlTainer = this.room!.controller!.pos.findInRange(containers, 1);
        if (controlTainer && controlTainer.length > 0) {
            refillerEnergyTargets[controlTainer[0].id] = {
                a: AT_Withdraw,
                p: Priority_Lowest,
                t: TT_StorageContainer
            }
            refillerFillTargets[controlTainer[0].id] = {
                a: AT_Transfer,
                p: Priority_Low,
                t: TT_StorageContainer,
            };
            workerEnergyTargets[controlTainer[0].id] = {
                a: AT_Withdraw,
                p: Priority_Medium,
                t: TT_StorageContainer
            };
        }

        let extensions = this.room!.find(FIND_STRUCTURES, {
            filter: (struct) => {
                return struct.structureType == STRUCTURE_EXTENSION;
            }
        });
        for (let i = 0; i < extensions.length; i++) {
            refillerFillTargets[extensions[i].id] = {
                a: AT_Transfer,
                p: Priority_High,
                t: TT_StorageContainer
            }
        }

        let sites = this.room!.find(FIND_CONSTRUCTION_SITES);
        for (let i = 0; i < sites.length; i++) {
            workerWorkTargets[sites[i].id] = {
                a: AT_Build,
                p: Priority_Low,
                t: TT_ConstructionSite
            }
        }

        let refillMem: ControlledRoomRefiller_Memory = {
            rID: this.memory.rID,
            et: refillerEnergyTargets,
            wt: refillerFillTargets,
            tr: this.memory.rID,
        }
        this.roomData!.groups.CJ_Refill = this.kernel.startProcess(CJ_Refill, refillMem);
        let workerMem: GenericWorkerGroup_Memory = {
            creeps: {},
            rID: this.memory.rID,
            energy: workerEnergyTargets,
            targets: workerWorkTargets
        }
        this.roomData!.groups.CJ_Work = this.kernel.startProcess(CJ_Work, workerMem);

        let scoutMem: ScoutJob_Memory = {
            n: _.without(this.GatherRoomIDs(this.memory.rID, 3), this.memory.rID),
            rID: this.memory.rID
        }
        this.roomData!.groups.CJ_Scout = this.kernel.startProcess(CJ_Scout, scoutMem);
    }

    protected GatherRoomIDs(centerRoom: RoomID, distance: number): RoomID[] {
        let nearbyRooms: RoomID[] = [];
        let nearby = Game.map.describeExits(centerRoom);
        if (nearby) {
            if (nearby["1"]) {
                nearbyRooms.push(nearby["1"]!);
                if (distance > 1) {
                    let furtherRooms = this.GatherRoomIDs(nearby["1"]!, distance - 1);
                    nearbyRooms.concat(furtherRooms)
                }
            }
            if (nearby["3"]) {
                nearbyRooms.push(nearby["3"]!);
                if (distance > 1) {
                    let furtherRooms = this.GatherRoomIDs(nearby["3"]!, distance - 1);
                    nearbyRooms.concat(furtherRooms)
                }
            }
            if (nearby["5"]) {
                nearbyRooms.push(nearby["5"]!);
                if (distance > 1) {
                    let furtherRooms = this.GatherRoomIDs(nearby["5"]!, distance - 1);
                    nearbyRooms.concat(furtherRooms)
                }
            }
            if (nearby["7"]) {
                nearbyRooms.push(nearby["7"]!);
                if (distance > 1) {
                    let furtherRooms = this.GatherRoomIDs(nearby["7"]!, distance - 1);
                    nearbyRooms.concat(furtherRooms)
                }
            }
        }
        return _.unique(nearbyRooms);
    }
}