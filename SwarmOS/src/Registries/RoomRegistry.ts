declare var Memory: {
    roomData: RoomStateMemory
}

import { ExtensionBase, BasicProcess } from "Core/BasicTypes";

export const OSPackage: IPackage<RoomStateMemory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(PKG_RoomManager, RoomRegistry);
        extensionRegistry.register(EXT_RoomView, new RoomExtension(extensionRegistry));
    }
}

const ROOM_HEIGHT = 50;
const ROOM_WIDTH = 50;
const ROOM_ARRAY_SIZE = ROOM_HEIGHT * ROOM_WIDTH;

class RoomRegistry extends BasicProcess<RoomStateMemory> {
    get memory(): RoomStateMemory {
        if (!Memory.roomData) {
            this.log.warn(`Initializing RoomManager memory`);
            Memory.roomData = {
                roomStateData: {}
            }
        }
        return Memory.roomData;
    }

    RunThread(): ThreadState {
        for (let roomID in Game.rooms) {
            let data = this.View.GetRoomData(roomID);
            if (!data || !data.activityPID || !this.kernel.getProcessByPID(data.activityPID)) {
                this.View.BootRoom(roomID, false);
            }
        }

        return ThreadState_Done;
    }
}

class RoomExtension extends ExtensionBase implements IRoomDataExtension {
    get memory(): RoomStateMemory {
        if (!Memory.roomData) {
            this.log.warn(`Initializing RoomManager memory`);
            Memory.roomData = {
                roomStateData: {}
            }
        }

        return Memory.roomData;
    }

    GetRoomData(roomID: string): RoomState | undefined {
        return this.memory.roomStateData[roomID];
    }

    BootRoom(roomID: string, force: boolean) {
        let data = this.GetRoomData(roomID);
        if (force || !data) {
            if (data && data.activityPID) {
                this.kernel.killProcess(data.activityPID, 'Rebooting room');
                delete data.activityPID;
            }
            let room = Game.rooms[roomID];
            this.memory.roomStateData[roomID] = {
                owner: '',
                lastUpdated: 0,
                lastEnergy: 0,
                EnergyIncomeRate: 0,
                mineralIDs: room.find(FIND_MINERALS)!.map((val: Mineral) => {
                    return val.id;
                }),
                minUpdateOffset: GetRandomIndex(primes_3000) || 73,
                structures: {
                    container: [],
                    road: []
                },
                groups: {
                    CR_Work: '',
                    RJ_Misc: '',
                    RJ_Structures: '',
                    RJ_WorkTarget: ''
                },
                targets: {
                    CR_SpawnFill: {
                        energy: {},
                        targets: {}
                    },
                    CR_Work: {
                        energy: {},
                        targets: {}
                    },
                    Other: {
                        at: AT_NoOp,
                        t: TT_None,
                        en: 0,
                        target: ''
                    },
                    Fill: {
                        at: AT_NoOp,
                        t: TT_None,
                        c: 0,
                        target: ''
                    }
                },
                activityPID: '',
                RoomType: {
                    other: {
                        tr: roomID
                    },
                    type: RT_None
                },
                exits: Game.map.describeExits(roomID),
                distanceMaps: {}
            }
        }

        data = this.GetRoomData(roomID)!;
        if (!data.activityPID || !this.kernel.getProcessByPID(data.activityPID)) {
            let newMem: RoomProvider_Memory = {
                rID: roomID,
                home: roomID
            }
            this.memory.roomStateData[roomID]!.activityPID = this.kernel.startProcess(SPKG_RoomActivity, newMem);
        }
    }

    CreateDistanceMap(room: Room, id: string, targetPositions: RoomPosition[], maxDistance: number, ignoreImpassable: boolean = true, force: boolean = false) {
        let roomData = this.GetRoomData(room.name)!;
        if (roomData.distanceMaps[id]) {
            if (!force) {
                return;
            }
        }

        let arr = new Array(ROOM_ARRAY_SIZE).fill(0);
        let pendingNodes = [];
        for (let i = 0; i < targetPositions.length; i++) {
            pendingNodes.push({ x: targetPositions[i].x, y: targetPositions[i].y, dist: 1 });
            arr[targetPositions[i].y * 50 + targetPositions[i].x] = -1;
        }

        while (pendingNodes.length > 0) {
            let curNode = pendingNodes.shift();
            if (!curNode) {
                break;
            }
            let neighbors = this.GetNeighborNodes(curNode.x, curNode.y, curNode.dist + 1);
            for (let i = 0; i < neighbors.length; i++) {
                let xPos = neighbors[i].x;
                let yPos = neighbors[i].y;
                if (xPos < 0 || xPos >= 50 || yPos < 0 || yPos >= 50 || neighbors[i].dist > maxDistance || neighbors[i].dist <= curNode.dist ||
                    arr[neighbors[i].y * 50 + neighbors[i].x] || Game.map.getTerrainAt(xPos, yPos, room.name) == Terrain_Wall) {
                    continue;
                }

                if (!ignoreImpassable) {
                    let walkable = true;
                    let lookAt = room.lookAt(xPos, yPos);
                    for (let i = 0; i < lookAt.length; i++) {
                        if (lookAt[i].type == LOOK_STRUCTURES) {
                            if (lookAt[i].structure!.structureType == STRUCTURE_CONTAINER ||
                                lookAt[i].structure!.structureType == STRUCTURE_PORTAL ||
                                lookAt[i].structure!.structureType == STRUCTURE_ROAD ||
                                lookAt[i].structure!.structureType == STRUCTURE_RAMPART) {
                                continue;
                            }
                            walkable = false;
                            break;
                        }
                    }

                    if (!walkable) {
                        continue;
                    }
                }
                arr[yPos * 50 + xPos] = neighbors[i].dist;
                pendingNodes.push(neighbors[i]);
            }
        }

        roomData.distanceMaps[id] = arr;
    }

    protected GetNeighborNodes(x: number, y: number, dist: number) {
        return [
            { x: x - 1, y: y - 1, dist },
            { x: x - 1, y, dist },
            { x: x - 1, y: y + 1, dist },
            { x, y: y - 1, dist },
            { x, y: y + 1, dist },
            { x: x + 1, y: y - 1, dist },
            { x: x + 1, y, dist },
            { x: x + 1, y: y + 1, dist },
        ];
    }
}
