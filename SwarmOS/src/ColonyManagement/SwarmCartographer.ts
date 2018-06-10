declare var Memory: {
    roomData: RoomStateMemory;
}

export const OSPackage: IPackage<CreepRegistry_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(PKG_Cartography, SwarmCartographer);
    }
}

import { BasicProcess } from "Core/BasicTypes";

const PKG_Cartography_LogContext: LogContext = {
    logID: PKG_Cartography,
    logLevel: LOG_INFO
}

class SwarmCartographer extends BasicProcess<CartographerMemory> {
    @extensionInterface(EXT_CreepActivity)
    protected creepActivity!: ICreepActivityExtensions;
    @extensionInterface(EXT_CreepRegistry)
    protected creepRegistry!: ICreepRegistryExtensions;
    @extensionInterface(EXT_RoomView)


    protected get logID(): string {
        return PKG_Cartography_LogContext.logID;
    }
    protected get logLevel(): LogLevel {
        return PKG_Cartography_LogContext.logLevel!;
    }

    get memory(): CartographerMemory {
        if (!Memory.roomData) {
            this.log.warn(`Initializing RoomManager memory`);
            Memory.roomData = {
                roomStateData: {},
                cartographicMemory: {
                    creeps: {},
                    homeRooms: {}
                }
            }
        }
        return Memory.roomData.cartographicMemory;
    }
    protected View!: IRoomDataExtension;
    protected scoutCreeps!: Creep[];
    protected scoutIndex!: number;
    protected get homeRooms() {
        return this.memory.homeRooms;
    }
    protected get creeps() {
        return this.memory.creeps;
    }
    RunThread(): ThreadState {
        let roomIDs = Object.keys(this.homeRooms);
        for (let i = 0; i < roomIDs.length; i++) {
            let roomID = roomIDs[i];
            let roomProcData = this.homeRooms[roomID];
            if (roomProcData.nearbyRooms.length == 0) {
                this.homeRooms[roomID].nearbyRooms = _.without(this.GatherRoomIDs(roomID, 3), roomID);

            }

            if (roomProcData.creepID) {
                let creep = this.creepRegistry.tryGetCreep(roomProcData.creepID, this.pid);
                if (!creep) {
                    if (this.creeps[roomProcData.creepID]) {
                        this.kernel.killProcess(this.creeps[roomProcData.creepID].a);
                    }
                    delete this.creeps[roomProcData.creepID];
                    delete this.homeRooms[roomID].creepID;
                }
            }

            if (!roomProcData.creepID) {
                this.CreateScoutSpawnActivity(roomID);
            }

            let creepID = roomProcData.creepID!;
            let creepData = this.creeps[creepID];
            if (!creepData.a || !this.kernel.getProcessByPID(creepData.a)) {
                let creep = this.creepRegistry.tryGetCreep(roomProcData.creepID, this.pid);
                if (!creep) {
                    if (this.creeps[creepID]) {
                        this.kernel.killProcess(this.creeps[creepID].a);
                    }
                    delete this.creeps[creepID];
                    delete this.homeRooms[roomID].creepID;
                    i--;
                    continue;
                } else {
                    this.CreateNewScoutActivity(creep.name);
                }
            }
        }

        this.sleeper.sleep(this.pid, 10);
        return ThreadState_Done;
    }

    CreateScoutSpawnActivity(roomID: RoomID) {
        let creepID = roomID + (Game.time + '_s').slice(-5);
        let sID = this.spawnRegistry.requestSpawn({
            l: 0,
            ct: CT_Scout,
            n: creepID
        }, roomID, Priority_Lowest, 1, {
                ct: CT_Scout,
                lvl: 0
            });
        let spawnMem: SpawnActivity_Memory = {
            sID: sID,
            HC: 'CreateNewScoutActivity'
        }
        this.creeps[creepID] = {
            a: this.kernel.startProcess(SPKG_SpawnActivity, spawnMem),
            home: roomID
        }
        this.kernel.setParent(this.creeps[creepID].a!, this.pid);
        this.homeRooms[roomID].creepID = creepID;

        return creepID;
    }

    CreateNewScoutActivity(creepID: CreepID) {
        this.creepRegistry.tryReserveCreep(creepID, this.pid);
        let creep = this.creepRegistry.tryGetCreep(creepID, this.pid);
        if (!creep) {
            this.CreateScoutSpawnActivity(this.creeps[creepID].home);
            return;
        }

        let homeRoomID = this.creeps[creep.name].home
        let allRooms = this.homeRooms[homeRoomID].nearbyRooms;

        let nextRoom = homeRoomID;
        let bestRoom: RoomState | undefined = undefined;
        for (let i = 0; i < allRooms.length; i++) {
            let data = this.View.GetRoomData(allRooms[i]);
            if (!data) {
                nextRoom = allRooms[i];
                break;
            }

            if (bestRoom) {
                if (bestRoom.lastUpdated <= data.lastUpdated) {
                    continue;
                }
            }

            bestRoom = data;
            nextRoom = allRooms[i];
        }

        this.creepActivity.CreateNewCreepActivity({
            at: AT_MoveToPosition,
            tp: {
                x: 25,
                y: 25,
                roomName: nextRoom
            },
            c: creep.name,
            f: [],
            HC: 'CreateNewScoutActivity'
        }, this.pid, this.extensions);
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