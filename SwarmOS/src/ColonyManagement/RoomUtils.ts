export const RoomActivityUtils = {
    BootRoom(room: Room) {
        let spawn = room.find(FIND_MY_SPAWNS);
        if (spawn && spawn.length > 0) {
            room.createConstructionSite(spawn[0].pos.x - 1, spawn[0].pos.y, STRUCTURE_CONTAINER);
            let sources = room.find(FIND_SOURCES);
            for (let i = 0; i < sources.length; i++) {
                this.BuildContainerAlongPath(room, spawn[0].pos, sources[i].pos, 1);
            }
            this.BuildContainerAlongPath(room, spawn[0].pos, room.controller!.pos, 3);// limit of 5 containers
        }
    },

    BuildContainerAlongPath(room: Room, from: RoomPosition, to: RoomPosition, buildContainerDistance: number) {
        if (buildContainerDistance > 0) {
            let nearby = to.findInRange(FIND_STRUCTURES, buildContainerDistance, {
                filter: (struct) => {
                    return struct.structureType == STRUCTURE_CONTAINER;
                }
            });

            if (nearby && nearby.length > 0) {
                return;
            }
        }
        let path = from.findPathTo(to, {
            ignoreCreeps: true,
            ignoreDestructibleStructures: true,
            ignoreRoads: true,
            range: buildContainerDistance,
            swampCost: 1
        });
        if (path.length > 0) {
            let siteLoc = path[(path.length - 1)];
            room.createConstructionSite(siteLoc.x, siteLoc.y, STRUCTURE_CONTAINER);
        }
    },
    CreateRoomJob(jobID: string, roomID: RoomID, roomData: RoomState, jobMem: SoloJob_Memory): SoloJob_Memory {
        jobMem = Object.assign(jobMem, {
            rID: roomID,
            exp: true,
            home: roomID
        });

        switch (jobID) {
            case (CR_Scout):
                console.log(`Command ${jobID} is not configured`);
                break;
            case (CR_RemoteHarvest):
                jobMem.home = roomData.RoomType.other.tr;
                break;
            case (CR_Harvester):
            case (CR_SpawnFill):
            case (CR_Work):
                (jobMem as Worker_Memory).target = {
                    at: AT_NoOp,
                    t: '',
                    tt: TT_None
                };
                (jobMem as Worker_Memory).home = roomData.RoomType.other.tr;
                break;
            default:
                break;
        }

        return jobMem;
    }
}