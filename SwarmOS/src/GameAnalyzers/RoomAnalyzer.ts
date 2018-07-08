export const OSPackage: IPackage<{}> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(APKG_Room, RoomAnalyzer);
    }
}

import { ProcessBase } from "Core/Types/ProcessTypes";

class RoomAnalyzer extends ProcessBase {
    private _RAMFolder!: IFolder;
    OnTickStart() {
        if (!RAM.GetFolder(this.memPath)) {
            this._RAMFolder = RAM.EnsurePath(this.memPath);
            global['RoomDataPath'] = this.memPath;
        }
    }
    RunThread(): ThreadState {
        let rooms = Object.keys(Game.rooms);
        for (let roomIndex = 0; roomIndex < rooms.length; roomIndex++) {
            let room = Game.rooms[rooms[roomIndex]];
            let roomFile = this.memFolder.CreateFile<RoomDataMemory>(room.name);
            if (!roomFile.Get("rID")) {
                // New File
                roomFile.Set("rID", room.name);
                roomFile.Set("f", GetRandomIndex(primes_5000));
                roomFile.Set("e", room.find(FIND_SOURCES).map(src => src.id));
                roomFile.Set("m", room.find(FIND_MINERALS).map(min => min.id));
                roomFile.Set("x", Game.map.describeExits(room.name));
            }
            roomFile.Set("o", (room.controller && room.controller.owner && room.controller.owner.username) || undefined);


            if ((Game.time + roomFile.Get('f')!) % 11 == 0) {
                let resources = room.find(FIND_DROPPED_RESOURCES);
                let rData: ResourceData[] = [];
                for (let resourceIndex = 0; resourceIndex < resources.length; resourceIndex++) {
                    let resource = resources[resourceIndex];
                    rData.push({
                        id: resource.id,
                        pos: DistMap.ConvertXYToIndex(resource.pos.x, resource.pos.y),
                        amt: resource.amount,
                        type: resource.resourceType
                    })
                }
                let ramFile = this._RAMFolder.CreateFile<RoomRAMData>(room.name);
                ramFile.Set('resources', rData);
            }

            if ((Game.time + roomFile.Get('f')!) % 13 == 0) {
                let tombStones = room.find(FIND_TOMBSTONES);
                let tData: TombstoneData[] = [];
                for (let tIndex = 0; tIndex < tombStones.length; tIndex++) {
                    let tStone = tombStones[tIndex];
                    tData.push({
                        id: tStone.id,
                        pos: DistMap.ConvertXYToIndex(tStone.pos.x, tStone.pos.y),
                        val: tStone.energy
                    })
                }
            }

            if ((Game.time + roomFile.Get('f')!) % 17 == 0) {
                let structures = room.find(FIND_STRUCTURES);
                let sData = {} as IDictionary<StructureConstant, StructureData[]>;
                for (let structureIndex = 0; structureIndex < structures.length; structureIndex++) {
                    let struct = structures[structureIndex];
                    let structData = {
                        id: struct.id,
                        pos: DistMap.ConvertXYToIndex(struct.pos.x, struct.pos.y),
                        hits: struct.hits
                    };

                    if (!sData[struct.structureType]) {
                        sData[struct.structureType] = [];
                    }
                    sData[struct.structureType].push(structData);
                }
                roomFile.Set("s", sData);
            }
        }

        return ThreadState_Done;
    }
}