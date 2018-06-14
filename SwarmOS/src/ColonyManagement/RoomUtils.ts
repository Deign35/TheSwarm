export const RoomActivityUtils = {
    BootRoom(room: Room) {
        let spawn = room.find(FIND_MY_SPAWNS);
        if (spawn && spawn.length > 0) {
            room.createConstructionSite(spawn[0].pos.x - 1, spawn[0].pos.y, STRUCTURE_CONTAINER);
            let sources = room.find(FIND_SOURCES);
            for (let i = 0; i < sources.length; i++) {
                this.CreatePath(room, spawn[0].pos, sources[i].pos, true);
            }
            this.CreatePath(room, spawn[0].pos, room.controller!.pos, sources.length < 4);// limit of 5 containers
            for (let i = 0; i < sources.length; i++) {
                this.CreatePath(room, sources[i].pos, room.controller!.pos, false);
            }
        }
    },

    CreatePath(room: Room, from: RoomPosition, to: RoomPosition, buildContainer: boolean) {
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
            room.createConstructionSite(path[i].x, path[i].y, STRUCTURE_ROAD);
        }
        room.createConstructionSite(path[path.length - 1].x, path[path.length - 1].y, buildContainer ? STRUCTURE_CONTAINER : STRUCTURE_ROAD);
    },
    CreateRoomJob(jobID: string, room: Room, roomData: RoomState, jobMem: SoloJob_Memory): SoloJob_Memory {
        jobMem = Object.assign(jobMem, {
            rID: room.name,
            exp: true,
            tr: room.name
        });

        switch (jobID) {
            case (CJ_Fortify):
            case (CJ_Science):
            case (CJ_Scout):
                console.log(`Command ${jobID} is not configured`);
                break;
            case (CJ_RemoteHarvest):
                jobMem.rID = roomData.RoomType.other.tr;
                break;
            case (CJ_Harvest):
            case (CJ_Refill):
            case (CJ_Work):
                (jobMem as Worker_Memory).target = {
                    at: AT_NoOp,
                    t: '',
                    tt: TT_None
                };
                (jobMem as Worker_Memory).tr = roomData.RoomType.other.tr;
                break;
            default:
                break;
        }

        return jobMem;
    }
}