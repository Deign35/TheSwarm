export const OSPackage: IPackage<SpawnRegistry_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(SPKG_RoomActivity, RoomActivity);
    }
}

import { BasicProcess } from "Core/BasicTypes";

class RoomActivity extends BasicProcess<RoomActivity_Memory> {
    @extensionInterface(EXT_RoomView)
    protected View!: IRoomDataExtension;

    private _room?: Room;
    protected get room(): Room | undefined {
        return this._room;
    }
    protected get roomName(): RoomID {
        return this.memory.rID;
    }

    PrepTick() {
        this._room = Game.rooms[this.roomName];
    }

    RunThread(): ThreadState {
        let roomData = this.View.GetRoomData(this.memory.rID)!;
        if (this.room) {
            roomData.owner = (this.room.controller && (
                (this.room.controller.owner && this.room.controller.owner.username) ||
                (this.room.controller.reservation && this.room.controller.reservation.username)
            )) || undefined;

            this.EnsureRoomGroups();

            if (!this.memory.hb) {
                let spawn = this.room.find(FIND_MY_SPAWNS);
                if (spawn && spawn.length > 0) {
                    this.room.createConstructionSite(spawn[0].pos.x - 1, spawn[0].pos.y, STRUCTURE_CONTAINER);
                    let sources = this.room.find(FIND_SOURCES);
                    for (let i = 0; i < sources.length; i++) {
                        this.CreatePath(spawn[0].pos, sources[i].pos, true);
                    }
                    this.CreatePath(spawn[0].pos, this.room.controller!.pos, sources.length < 4);// limit of 5 containers
                    for (let i = 0; i < sources.length; i++) {
                        this.CreatePath(sources[i].pos, this.room.controller!.pos, false);
                    }
                }

                this.memory.hb = true;
            }

            if (this.shouldRefresh(11, roomData!.minUpdateOffset, roomData.lastUpdated)) {
                roomData.resources = this.room.find(FIND_DROPPED_RESOURCES).map((value: Resource) => {
                    return value.id;
                });
            }

            if (this.shouldRefresh(27, roomData!.minUpdateOffset, roomData.lastUpdated)) {
                roomData.tombstones = this.room.find(FIND_TOMBSTONES).map((value: Tombstone) => {
                    return value.id;
                });
            }

            // (TODO): Change this to plan out the layout
            if (this.shouldRefresh(29, roomData!.minUpdateOffset, roomData.lastUpdated)) {
                let curEnergyLevel = 0;
                let targets: WorkerTargetDictionary = {};

                this.RefreshRoomStructures(roomData);
                roomData.cSites = this.room.find(FIND_CONSTRUCTION_SITES).map((value: ConstructionSite) => {
                    return value.id;
                });
                let siteKeys = Object.keys(roomData.cSites);
                let siteInfo: WorkerTargetDictionary = {};
                let leftToBuild = 0;

                for (let i = 0; i < siteKeys.length; i++) {
                    let priority: Priority = Priority_Low;
                    let cSite = Game.getObjectById(roomData.cSites[siteKeys[i]]) as ConstructionSite;
                    leftToBuild += cSite.progressTotal - cSite.progress;
                    switch (cSite.structureType) {
                        case (STRUCTURE_SPAWN):
                            priority = Priority_Highest
                            break;
                        case (STRUCTURE_CONTAINER):
                        case (STRUCTURE_EXTENSION):
                            priority = Priority_High;
                            break;
                        case (STRUCTURE_EXTRACTOR):
                        case (STRUCTURE_LAB):
                        case (STRUCTURE_LINK):
                        case (STRUCTURE_STORAGE):
                        case (STRUCTURE_TERMINAL):
                        case (STRUCTURE_TOWER):
                            priority = Priority_Medium;
                            break;
                        case (STRUCTURE_OBSERVER):
                        case (STRUCTURE_RAMPART):
                        case (STRUCTURE_ROAD):
                        case (STRUCTURE_WALL):
                            priority = Priority_Low;
                            break;
                        case (STRUCTURE_NUKER):
                        case (STRUCTURE_POWER_SPAWN):
                        default:
                            priority = Priority_Lowest;
                    }
                    siteInfo[roomData.cSites[siteKeys[i]]] = {
                        a: AT_Build,
                        t: TT_ConstructionSite,
                        p: priority
                    }
                }
                let sortedKeys = Object.keys(siteInfo).sort((a, b) => {
                    let siteA = siteInfo[a];
                    let siteB = siteInfo[b];
                    if (siteA.p != siteB.p) {
                        return siteA.p < siteB.p ? 1 : -1;
                    }
                    return 0;
                });
                for (let i = 0; i < sortedKeys.length && i < SET_MaxSites; i++) {
                    targets[sortedKeys[i]] = siteInfo[sortedKeys[i]];
                }

                // (TODO): Prioritize repairs
                let keys = Object.keys(roomData.needsRepair);
                for (let i = 0; i < keys.length; i++) {
                    targets[roomData.needsRepair[keys[i]]] = {
                        a: AT_Repair,
                        t: TT_AnyStructure,
                        p: Priority_Low,
                    }
                }
                if (roomData.owner == MY_USERNAME) {
                    targets[this.room!.controller!.id] = {
                        a: AT_Upgrade,
                        t: TT_Controller,
                        p: Priority_Hold
                    }
                }

                roomData.targets.CR_Work.targets = targets;

                for (let i = 0; i < roomData.structures.container.length; i++) {
                    let containerID = roomData.structures.container[i];
                    let container = Game.getObjectById(containerID) as StructureContainer;
                    if (!container) { continue; }
                    curEnergyLevel += container.energy || 0;

                    if (!this.memory.energyTargets[containerID]) {
                        let sources = container.pos.findInRange(FIND_SOURCES, 1);
                        if (sources && sources.length > 0) {
                            if (!roomData.targets.CR_SpawnFill.energy[containerID]) {
                                roomData.targets.CR_SpawnFill.energy[containerID] = {
                                    a: AT_Withdraw,
                                    p: Priority_Medium,
                                    t: TT_StorageContainer
                                }
                            }
                        } else {
                            if (!roomData.targets.CR_SpawnFill.targets[containerID]) {
                                roomData.targets.CR_SpawnFill.targets[containerID] = {
                                    a: AT_Transfer,
                                    p: Priority_Low,
                                    t: TT_StorageContainer
                                }
                            }
                            if (!roomData.targets.CR_Work.energy[containerID]) {
                                roomData.targets.CR_Work.energy[containerID] = {
                                    a: AT_Withdraw,
                                    p: Priority_Low,
                                    t: TT_StorageContainer
                                }
                            }
                        }

                        this.memory.energyTargets[containerID] = true;
                    }
                }

                if (roomData.structures.spawn) {
                    for (let i = 0; i < roomData.structures.spawn.length; i++) {
                        let spawnID = roomData.structures.spawn[i];
                        if (!roomData.targets.CR_SpawnFill.targets[spawnID]) {
                            roomData.targets.CR_SpawnFill.targets[spawnID] = {
                                a: AT_Transfer,
                                p: Priority_Medium,
                                t: TT_StorageContainer
                            }
                        }
                    }
                }

                if (roomData.structures.extension) {
                    for (let i = 0; i < roomData.structures.extension.length; i++) {
                        let extensionID = roomData.structures.extension[i];
                        if (!roomData.targets.CR_SpawnFill.targets[extensionID]) {
                            roomData.targets.CR_SpawnFill.targets[extensionID] = {
                                a: AT_Transfer,
                                p: Priority_High,
                                t: TT_StorageContainer
                            }
                        }
                    }
                }

                if (this.room && this.room.storage) {
                    curEnergyLevel += this.room.storage.energy;
                    if (!roomData.targets.CR_SpawnFill.targets[this.room.storage.id]) {
                        roomData.targets.CR_SpawnFill.targets[this.room.storage.id] = {
                            a: AT_Transfer,
                            p: Priority_Lowest,
                            t: TT_StorageContainer
                        }
                    }
                    if (!roomData.targets.CR_Work.energy[this.room.storage.id]) {
                        roomData.targets.CR_Work.energy[this.room.storage.id] = {
                            a: AT_Withdraw,
                            p: Priority_Lowest,
                            t: TT_StorageContainer
                        }
                    }
                }

                if (roomData.structures.tower && roomData.structures.tower.length > 0) {
                    if (!roomData.groups.RJ_Tower || !this.kernel.getProcessByPID(roomData.groups.RJ_Tower)) {
                        let towerProcessMemroy: Tower_Memory = {
                            rID: this.memory.rID
                        }
                        roomData.groups.RJ_Tower = this.kernel.startProcess(RJ_Tower, towerProcessMemroy);
                    }
                    for (let i = 0; i < roomData.structures.tower.length; i++) {
                        if (!roomData.targets.CR_SpawnFill.targets[roomData.structures.tower[i]]) {
                            roomData.targets.CR_SpawnFill.targets[roomData.structures.tower[i]] = {
                                a: AT_Transfer,
                                p: Priority_Medium,
                                t: TT_StorageContainer
                            }
                        }
                    }
                }

                if (roomData && roomData.groups.CR_Work) {
                    let workProcess = this.kernel.getProcessByPID(roomData.groups.CR_Work);
                    if (workProcess) {
                        let workMem = workProcess.memory as WorkerGroup_Memory;
                        let creepIDs = Object.keys(workMem.creeps);
                        for (let i = 0; i < creepIDs.length; i++) {
                            let creep = Game.creeps[creepIDs[i]];
                            if (!creep || creep.memory.ct != CT_Worker) {
                                continue;
                            }
                            if (!roomData.targets.CR_SpawnFill.targets[creep.id]) {
                                roomData.targets.CR_SpawnFill.targets[creep.id] = {
                                    a: AT_Transfer,
                                    p: Priority_Lowest,
                                    t: TT_Creep
                                }
                            }
                        }

                        let neededCreepCount = roomData.owner == MY_USERNAME ? 2 : 0;
                        if (this.room.storage) { } else { } // (TODO): <-- this .. Set up storage energy gating
                        if (leftToBuild == 0) {
                            if (curEnergyLevel - SET_TriggerNewWorker > roomData.lastEnergy) {
                                neededCreepCount += 1;
                            }
                        } else {
                            neededCreepCount = leftToBuild / SET_SiteToWorkRatio + 1;
                        }


                        let resourcesIDs = roomData.resources;
                        let groundResources = 0;
                        for (let i = 0; i < resourcesIDs.length; i++) {
                            let resource = Game.getObjectById(resourcesIDs[i]) as Resource;
                            if (resource && resource.energy && resource.energy > 50) {
                                groundResources += resource.energy - 50; // Decay (?)
                            }
                        }

                        if (this.room.energyAvailable == this.room.energyCapacityAvailable && groundResources >= SET_GroundWorkerRatio) {
                            neededCreepCount += 1;
                        }

                        if (creepIDs.length < neededCreepCount) {
                            let curReq = this.spawnRegistry.getRequestContext(this.memory.sID);
                            if (!curReq) {
                                let spawnReq = this.spawnRegistry.requestSpawn({
                                    c: CT_Worker,
                                    l: 0,
                                    n: GetSUID() + (Game.time + '_w').slice(-5),
                                    p: roomData.groups.CR_Work
                                }, this.memory.rID, Priority_Lowest, 3, {
                                        ct: CT_Worker,
                                        lvl: 0,
                                        p: roomData.groups.CR_Work
                                    })
                                let spawnMem: SpawnActivity_Memory = {
                                    sID: spawnReq,
                                    HC: 'AddCreep'
                                }
                                let newPID = this.kernel.startProcess(SPKG_SpawnActivity, spawnMem);
                                this.memory.sID = spawnReq;
                                this.kernel.setParent(newPID, roomData.groups.CR_Work)
                            }
                        }
                    }
                    roomData.lastEnergy = curEnergyLevel;
                }
            }
            // (TODO): Update path stuff somehow.
            roomData.lastUpdated = Game.time;
        }
        return ThreadState_Done;
    }

    protected shouldRefresh(frequency: number, offset: number, lastUpdated: number): boolean {
        if (Game.time - lastUpdated >= frequency) {
            return true;
        }
        return (Game.time + offset) % frequency == 0;
    }

    protected RefreshRoomStructures(roomData: RoomState): void {
        if (!this.room) {
            return;
        }
        if (roomData.owner && this.room.controller!.owner) {
            roomData.structures = {
                constructedWall: [],
                container: [],
                extension: [],
                lab: [],
                link: [],
                rampart: [],
                road: [],
                spawn: [],
                tower: []
            }
        } else {
            roomData.structures = {
                container: [],
                road: []
            }
        }

        roomData.needsRepair = [];
        let allStructures = this.room.find(FIND_STRUCTURES);
        for (let i = 0, length = allStructures.length; i < length; i++) {
            let structure = allStructures[i];
            if (!roomData.structures[structure.structureType]) {
                roomData.structures[structure.structureType] = [];
            }

            if ((roomData.structures[structure.structureType] as string[]).length !== undefined) {
                roomData.structures[structure.structureType]!.push(structure.id);
            }
            // (TODO): Better prioritization
            if (structure.hits + 1000 < structure.hitsMax && structure.structureType != STRUCTURE_WALL && structure.structureType != STRUCTURE_RAMPART) {
                roomData.needsRepair.push(structure.id);
            }
        }
    }

    protected GatherNearbyRoomIDs(centerRoom: RoomID, distance: number): RoomID[] {
        let nearbyRooms: RoomID[] = [];
        let nearby = Game.map.describeExits(centerRoom);
        if (nearby) {
            if (nearby["1"]) {
                nearbyRooms.push(nearby["1"]!);
                if (distance > 1) {
                    let furtherRooms = this.GatherNearbyRoomIDs(nearby["1"]!, distance - 1);
                    nearbyRooms.concat(furtherRooms)
                }
            }
            if (nearby["3"]) {
                nearbyRooms.push(nearby["3"]!);
                if (distance > 1) {
                    let furtherRooms = this.GatherNearbyRoomIDs(nearby["3"]!, distance - 1);
                    nearbyRooms.concat(furtherRooms)
                }
            }
            if (nearby["5"]) {
                nearbyRooms.push(nearby["5"]!);
                if (distance > 1) {
                    let furtherRooms = this.GatherNearbyRoomIDs(nearby["5"]!, distance - 1);
                    nearbyRooms.concat(furtherRooms)
                }
            }
            if (nearby["7"]) {
                nearbyRooms.push(nearby["7"]!);
                if (distance > 1) {
                    let furtherRooms = this.GatherNearbyRoomIDs(nearby["7"]!, distance - 1);
                    nearbyRooms.concat(furtherRooms)
                }
            }
        }
        return _.unique(nearbyRooms);
    }

    protected CreatePath(from: RoomPosition, to: RoomPosition, buildContainer: boolean) {
        if (!this.room) {
            return false;
        }
        if (buildContainer) {
            let nearby = to.findInRange(FIND_STRUCTURES, 1, {
                filter: (struct) => {
                    return struct.structureType == STRUCTURE_CONTAINER;
                }
            });

            if (nearby && nearby.length > 0) {
                to = nearby[0].pos;
                buildContainer = false;
            }
        }
        let path = from.findPathTo(to, {
            ignoreCreeps: true,
            ignoreDestructibleStructures: true,
            ignoreRoads: true,
            range: 1,
            swampCost: 1
        });
        for (let i = 0; i < path.length - 1; i++) {
            this.room.createConstructionSite(path[i].x, path[i].y, STRUCTURE_ROAD);
        }
        this.room.createConstructionSite(path[path.length - 1].x, path[path.length - 1].y, buildContainer ? STRUCTURE_CONTAINER : STRUCTURE_ROAD);

        return true;
    }
    protected EnsureRoomGroups() {
        let roomData = this.View.GetRoomData(this.memory.rID)!;
        if (!roomData.groups.CR_Work) {
            let workMem: WorkerGroup_Memory = {
                rID: this.memory.rID,
                creeps: {}
            }
            roomData.groups.CR_Work = this.kernel.startProcess(CJ_Work, workMem);
            roomData.targets.CR_Work = {
                energy: {},
                targets: {}
            }
        }

        // I control this room
        if (this.room!.controller && this.room!.controller!.my) {
            this.View.SetScoutNexus(this.memory.rID);
            if (!roomData.groups.CR_Scout || !this.kernel.getProcessByPID(roomData.groups.CR_Scout)) {
                let scoutMem: ScoutJob_Memory = {
                    n: _.without(this.GatherNearbyRoomIDs(this.memory.rID, 3), this.memory.rID),
                    rID: this.memory.rID
                }
                roomData.groups.CR_Scout = this.kernel.startProcess(CJ_Scout, scoutMem);
            }
            if (!roomData.groups.CR_Harvester) {
                roomData.groups.CR_Harvester = {};
            }

            let sources = this.room!.find(FIND_SOURCES);
            for (let i = 0; i < sources.length; i++) {
                if (!roomData.groups.CR_Harvester[sources[i].id] || !this.kernel.getProcessByPID(roomData.groups.CR_Harvester[sources[i].id])) {
                    let harvMem: HarvestJob_Memory = {
                        rID: this.memory.rID,
                        t: sources[i].id
                    }
                    roomData.groups.CR_Harvester[sources[i].id] = (this.kernel.startProcess(CJ_Harvest, harvMem));
                }
                if (this.room!.energyCapacityAvailable < 550) {
                    if (!roomData.groups.CR_BootFill) {
                        roomData.groups.CR_BootFill = {};
                    }
                    if (!roomData.groups.CR_BootFill[sources[i].id]) {
                        let bootMem: BootstrapRefiller_Memory = {
                            hb: false,
                            s: sources[i].id,
                            rID: this.memory.rID,
                            ref: {}
                        }
                        roomData.groups.CR_BootFill[sources[i].id] = this.kernel.startProcess(CJ_BootRefill, bootMem);
                    }
                } else {
                    if (roomData.groups.CR_BootFill) {
                        let keys = Object.keys(roomData.groups.CR_BootFill);
                        for (let i = 0; i < keys.length; i++) {
                            this.kernel.killProcess(roomData.groups.CR_BootFill[keys[i]]);
                        }
                        delete roomData.groups.CR_BootFill;
                    }
                }
            }

            if (!roomData.groups.CR_SpawnFill) {
                let refillMem: ControlledRoomRefiller_Memory = {
                    rID: this.memory.rID,
                    tr: this.memory.rID,

                }
                roomData.groups.CR_SpawnFill = this.kernel.startProcess(CJ_Refill, refillMem);
                roomData.targets.CR_SpawnFill = {
                    energy: {},
                    targets: {}
                }
            }
        } else {
            // I do not own this room
            if (roomData.groups.CR_Scout) {
                this.kernel.killProcess(roomData.groups.CR_Scout);
                delete roomData.groups.CR_Scout;
            }
            if (roomData.groups.CR_Harvester) {
                let ids = Object.keys(roomData.groups.CR_Harvester);
                for (let i = 0; i < ids.length; i++) {
                    this.kernel.killProcess(roomData.groups.CR_Harvester[i]);
                }
                delete roomData.groups.CR_Harvester;
            }
            if (roomData.groups.CR_BootFill) {
                let keys = Object.keys(roomData.groups.CR_BootFill);
                for (let i = 0; i < keys.length; i++) {
                    this.kernel.killProcess(roomData.groups.CR_BootFill[keys[i]]);
                }
                delete roomData.groups.CR_BootFill;
            }
            if (roomData.groups.CR_SpawnFill) {
                this.kernel.killProcess(roomData.groups.CR_SpawnFill);
                delete roomData.groups.CR_SpawnFill;
            }
        }
    }
}