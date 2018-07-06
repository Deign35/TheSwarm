export const OSPackage: IPackage<SpawnRegistry_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(CR_Scout, ScoutJob);
    }
}
import { SoloJob } from "./SoloJob";

class ScoutJob extends SoloJob<ScoutJob_Memory> {
    protected GetNewSpawnID(): string {
        let spawnLevel = 0;
        return this.spawnRegistry.requestSpawn({
            l: spawnLevel,
            c: CT_Scout,
            n: (Game.time + '_Sc').slice(-6),
            p: this.pid
        }, this.memory.home, Priority_Lowest, 1, {
                ct: CT_Scout,
                lvl: spawnLevel,
                p: this.pid
            });
    }
    protected CreateCustomCreepActivity(creep: Creep): string | undefined {
        if (creep.room.controller) {
            let sign = creep.room.controller.sign && creep.room.controller.sign.text || '';
            // (TODO): Change when shouldSign is true.  Shouldn't just be my rooms, but this will do for now.
            let shouldSign = sign != MY_SIGNATURE && sign != SIGN_NOVICE_AREA && sign != SIGN_RESPAWN_AREA;
            if (shouldSign && creep.room.controller.my) {
                return this.creepActivity.CreateNewCreepActivity({
                    t: creep.room.controller.id,
                    at: AT_SignController,
                    c: creep.name,
                    m: MY_SIGNATURE,
                }, this.pid);
            }
        }

        if (!this.memory.rID || creep.room.name == this.memory.rID) {
            let nearby = this.GatherNearbyRoomIDs(creep.room.name, 2);
            let nextRoom = this.memory.home;
            let bestRoom: RoomState | undefined = undefined;
            for (let i = 0; i < nearby.length; i++) {
                let data = this.roomView.GetRoomData(nearby[i]);
                if (!data) {
                    nextRoom = nearby[i];
                    break;
                }

                if (bestRoom) {
                    if (bestRoom.lastUpdated <= data.lastUpdated) {
                        continue;
                    }
                }

                bestRoom = data;
                nextRoom = nearby[i];
            }
            this.memory.rID = nextRoom;
        }

        if (creep.room.name != this.memory.rID) {
            let map = Game.map.findRoute(creep.room.name, this.memory.rID);
            let nextRoom = this.memory.rID;
            if (map == ERR_NO_PATH) {
                delete this.memory.rID
                return this.creepActivity.CreateNewCreepActivity({
                    at: AT_MoveToPosition,
                    p: creep.pos,
                    c: creep.name
                }, this.pid)
            }
            if (map && map.length > 0) {
                nextRoom = map[0].room;
            }
            let path = creep.pos.findPathTo(new RoomPosition(25, 25, nextRoom), {
                ignoreCreeps: true
            });
            let lastPosition = path[path.length - 1];
            if (!lastPosition) {
                throw new Error(`Scout attempted to find a path to the next room, but failed`);
            }

            return this.creepActivity.CreateNewCreepActivity({
                at: AT_MoveToPosition,
                c: creep.name,
                p: { x: lastPosition.x, y: lastPosition.y, roomName: creep.room.name }
            }, this.pid);
        }

        return undefined;
    }

    // (TODO): Cache these results for future use (between OS loads)
    protected GatherNearbyRoomIDs(centerRoom: RoomID, distance: number): RoomID[] {
        let nearbyRooms: RoomID[] = [];
        let roomData = this.roomView.GetRoomData(centerRoom);
        if (roomData) {
            let nearby = roomData.exits
            if (nearby) {
                if (nearby["1"]) {
                    nearbyRooms.push(nearby["1"]!);
                    if (distance > 1) {
                        let furtherRooms = this.GatherNearbyRoomIDs(nearby["1"]!, distance - 1);
                        nearbyRooms = nearbyRooms.concat(furtherRooms)
                    }
                }
                if (nearby["3"]) {
                    nearbyRooms.push(nearby["3"]!);
                    if (distance > 1) {
                        let furtherRooms = this.GatherNearbyRoomIDs(nearby["3"]!, distance - 1);
                        nearbyRooms = nearbyRooms.concat(furtherRooms)
                    }
                }
                if (nearby["5"]) {
                    nearbyRooms.push(nearby["5"]!);
                    if (distance > 1) {
                        let furtherRooms = this.GatherNearbyRoomIDs(nearby["5"]!, distance - 1);
                        nearbyRooms = nearbyRooms.concat(furtherRooms)
                    }
                }
                if (nearby["7"]) {
                    nearbyRooms.push(nearby["7"]!);
                    if (distance > 1) {
                        let furtherRooms = this.GatherNearbyRoomIDs(nearby["7"]!, distance - 1);
                        nearbyRooms = nearbyRooms.concat(furtherRooms)
                    }
                }
            }
        }
        return _.unique(nearbyRooms);
    }
}