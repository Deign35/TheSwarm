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
        if (this.room) {
            let roomData = this.View.GetRoomData(this.memory.rID)!;
            roomData.owner = (this.room.controller && (
                (this.room.controller.owner && this.room.controller.owner.username) ||
                (this.room.controller.reservation && this.room.controller.reservation.username)
            )) || undefined;

            this.EnsureRoomGroups();

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
                this.RefreshRoomStructures(roomData);
                roomData.cSites = this.room.find(FIND_CONSTRUCTION_SITES).map((value: ConstructionSite) => {
                    return value.id;
                });
                let targets: WorkerTargetDictionary = {};
                let keys = Object.keys(roomData.cSites);
                // (TODO): Organize cSites by some priority based on structure type
                for (let i = 0; i < keys.length; i++) {
                    targets[keys[i]] = {
                        a: AT_Build,
                        t: TT_ConstructionSite,
                        p: Priority_Medium
                    }
                }

                keys = Object.keys(roomData.needsRepair);
                for (let i = 0; i < keys.length; i++) {
                    targets[keys[i]] = {
                        a: AT_Repair,
                        t: TT_AnyStructure,
                        p: Priority_Low,
                    }
                }
                if (roomData.owner == MY_USERNAME) {
                    targets[this.room!.controller!.id] = {
                        a: AT_Upgrade,
                        t: TT_Controller,
                        p: Priority_Lowest
                    }
                }

                roomData.targets.CR_Work.targets = targets;

                for (let i = 0; i < roomData.structures.container.length; i++) {
                    let containerID = roomData.structures.container[i];
                    if (!this.memory.energyTargets[containerID]) {
                        let container = Game.getObjectById(containerID) as StructureContainer;
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
            }
            // (TODO): Update path stuff somehow.
            roomData.lastUpdated = Game.time;
        }

        return ThreadState_Done;
    }

    protected shouldRefresh(frequency: number, offset: number, lastUpdated: number): boolean {
        if (Game.time - lastUpdated < frequency) {
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
                        let bootMem: BootstrapRefiller_Memory = {
                            hb: false,
                            s: sources[i].id,
                            rID: this.memory.rID,
                            ref: {}
                        }
                        roomData.groups.CR_BootFill = this.kernel.startProcess(CJ_BootRefill, bootMem);
                    }
                } else {
                    if (roomData.groups.CR_BootFill) {
                        this.kernel.killProcess(roomData.groups.CR_BootFill);
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
                this.kernel.killProcess(roomData.groups.CR_BootFill);
                delete roomData.groups.CR_BootFill;
            }
            if (roomData.groups.CR_SpawnFill) {
                this.kernel.killProcess(roomData.groups.CR_SpawnFill);
                delete roomData.groups.CR_SpawnFill;
            }
        }
    }
}