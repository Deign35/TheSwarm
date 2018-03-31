import { MasterCreepMemory, MasterFlagMemory, MasterRoomMemory, MasterStructureMemory, MasterRoomObjectMemory, MasterOtherMemory, RoomObjectMemory } from "SwarmMemory/StorageMemory";
import { SwarmCreep } from "SwarmTypes/SwarmCreep";
import { SwarmRoom } from "SwarmTypes/SwarmRoom";
import { SwarmFlag } from "SwarmTypes/SwarmFlag";
import { SwarmObject, SwarmRoomObject, SwarmMineral, ObjectBase } from "SwarmTypes/SwarmTypes";
import { SwarmSource } from "SwarmTypes/SwarmSource";

const STATIC_OBJECTS = 'static_objects';
const ROOM_OBJECTS = 'room_objects';
const STRUCTURE_OBJECTS = 'structure_objects'
export class SwarmLoader {
    constructor() {
        this.LoadTheSwarm();
    }
    protected MasterMemory!: {
        [dataType: string]: IMasterMemory<MasterSwarmDataTypes, SwarmMemoryTypes>
        creeps: MasterCreepMemory,
        flags: MasterFlagMemory,
        rooms: MasterRoomMemory,
        structures: MasterStructureMemory,
        roomObjects: MasterRoomObjectMemory,
        other: MasterOtherMemory
    }
    TheSwarm = {
        creeps: {} as { [id: string]: ISwarmCreep },
        flags: {} as { [id: string]: ISwarmFlag },
        rooms: {} as { [id: string]: ISwarmRoom },
        roomObjects: {} as { [id: string]: TSwarmRoomObject },
        structures: {} as { [id: string]: TSwarmStructure },
        other: {} as { [id: string]: IOtherObject }
    }
    protected LoadTheSwarm() {
        this.MasterMemory = {
            creeps: Swarmlord.CheckoutMasterMemory(SwarmControllerDataTypes.Creeps) as MasterCreepMemory,
            flags: Swarmlord.CheckoutMasterMemory(SwarmControllerDataTypes.Flags) as MasterFlagMemory,
            other: Swarmlord.CheckoutMasterMemory(SwarmControllerDataTypes.Other) as MasterOtherMemory,
            rooms: Swarmlord.CheckoutMasterMemory(SwarmControllerDataTypes.Rooms) as MasterRoomMemory,
            roomObjects: Swarmlord.CheckoutMasterMemory(SwarmControllerDataTypes.RoomObjects) as MasterRoomObjectMemory,
            structures: Swarmlord.CheckoutMasterMemory(SwarmControllerDataTypes.Structures) as MasterStructureMemory,
        };

        let keys = this.MasterMemory.roomObjects.GetDataIDs();
        for (let j = 0; j < keys.length; j++) {
            this.LoadObject<RoomObject>(keys[j], Game.getObjectById(keys[j]) as RoomObject, SwarmControllerDataTypes.RoomObjects);
        }
        keys = this.MasterMemory.structures.GetDataIDs();
        for (let j = 0; j < keys.length; j++) {
            this.LoadObject<Structure>(keys[j], Game.getObjectById(keys[j]) as Structure, SwarmControllerDataTypes.Structures);
        }
        // Load the memory!
        keys = Object.keys(Game.creeps);
        for (let i = 0; i < keys.length; i++) {
            this.LoadObject<Creep>(keys[i], Game.creeps[keys[i]], SwarmControllerDataTypes.Creeps);
        }
        keys = Object.keys(Game.flags);
        for (let i = 0; i < keys.length; i++) {
            this.LoadObject<Flag>(keys[i], Game.flags[keys[i]], SwarmControllerDataTypes.Flags);
        }
        keys = this.MasterMemory[SwarmControllerDataTypes.Other].GetDataIDs();
        for (let i = 0; i < keys.length; i++) {
            let otherObj = SwarmCreator.CreateSwarmObject(SwarmType.Any) as IOtherObject;
            let otherMem = this.MasterMemory[SwarmControllerDataTypes.Other].CheckoutMemory(keys[i]) as IOtherMemory;
            otherObj.AssignObject({}, otherMem);
        }
        keys = this.MasterMemory.rooms.GetDataIDs();
        for (let i = 0; i < keys.length; i++) {
            if (!Game.rooms[keys[i]]) {
                // Room is still in memory, but I dont have sight.  Need to create an empty RoomObject for this scenario.
                continue;
            }
            this.LoadObject<Room>(keys[i], Game.rooms[keys[i]], SwarmControllerDataTypes.Rooms);
            // load structures and room objects 
            let roomObj = this.TheSwarm[keys[i]] as SwarmRoom;
            if (roomObj.my) {
                let structures = roomObj.find(FIND_STRUCTURES);
                for (let j = 0; j < structures.length; j++) {
                    this.LoadObject<Structure>(structures[j].id, structures[j], SwarmControllerDataTypes.Structures);
                }

                let newRoomObjects = {};
                if (Game.time % 5 == 0) {
                    let foundResources = roomObj.find(FIND_DROPPED_RESOURCES);
                    for (let j = 0; j < foundResources.length; j++) {
                        if (!this.TheSwarm.roomObjects[foundResources[j].id]) {
                            this.LoadObject<Resource>(foundResources[j].id, foundResources[j], SwarmControllerDataTypes.RoomObjects);
                        }
                    }
                }

                if (Game.time % 11 == 0) {
                    let foundTombstones = roomObj.find(FIND_TOMBSTONES);
                    for (let j = 0; j < foundTombstones.length; j++) {
                        if (!this.TheSwarm.roomObjects[foundTombstones[j].id]) {
                            this.LoadObject<Tombstone>(foundTombstones[j].id, foundTombstones[j], SwarmControllerDataTypes.RoomObjects);
                        }
                    }
                }

                if (Game.time % 233 == 0) {
                    let foundNukes = roomObj.find(FIND_NUKES);
                    for (let j = 0; j < foundNukes.length; j++) {
                        if (!this.TheSwarm.roomObjects[foundNukes[j].id]) {
                            this.LoadObject<Nuke>(foundNukes[j].id, foundNukes[j], SwarmControllerDataTypes.RoomObjects);
                        }
                    }
                }
            } else if (roomObj.owner) {
                // Also need to check if I have vision (this goes for my unreserved harvest rooms.)
                // Look for enemy stuff.  To be added later.
                // Check if roomObj.owner is even reliable to use in this way...
            }
        }

        global['TheSwarm'] = this.TheSwarm;
    }

    protected LoadObject<T extends Room | RoomObject>(saveID: string, obj: T, swarmDataType: SwarmControllerDataTypes) {
        let swarmType = SwarmCreator.GetSwarmType(obj);
        let swarmObj = SwarmCreator.CreateSwarmObject(swarmType) as ObjectBase<SwarmMemoryTypes, T>;
        if (!this.MasterMemory[swarmDataType].HasData(saveID)) {
            let newMem = SwarmCreator.CreateNewSwarmMemory(saveID, swarmType);
            swarmObj.AssignObject(obj, newMem);
            swarmObj.InitNewObject();
            this.MasterMemory[swarmDataType].SaveMemory(swarmObj.ReleaseMemory());
        }

        let objMem = this.MasterMemory[swarmDataType].CheckoutMemory(saveID);
        swarmObj.AssignObject(obj, objMem);

        this.TheSwarm[swarmDataType][saveID] = swarmObj;
    }

    SaveTheSwarm() {
        this.SaveCreeps();
        let keys = Object.keys(this.TheSwarm.rooms);
        for (let i = 0; i < keys.length; i++) {
            this.SaveRoom(this.TheSwarm.rooms[keys[i]] as ISwarmRoom);
        }

        for (let id in this.MasterMemory) {
            Swarmlord.SaveMasterMemory<MasterMemoryTypes>(this.MasterMemory[id] as MasterMemoryTypes, true);
        }
    }
    protected SaveCreeps() {

    }
    protected SaveRoom(swarmRoom: ISwarmRoom) {

    }

    protected InitRoom(room: SwarmRoom) {
        // Would love to add a pathfinding.
        let staticObjects = [];
        let sources = room.find(FIND_SOURCES);
        for (let i = 0; i < sources.length; i++) {
            let obj = SwarmCreator.CreateSwarmObject(SwarmType.SwarmSource) as SwarmSource;
            let newMem = SwarmCreator.CreateNewSwarmMemory(sources[i].id, SwarmType.SwarmSource);
            newMem.ReserveMemory();
            obj.AssignObject(sources[i], newMem as ISourceMemory);
            staticObjects.push(obj.ReleaseMemory());
        }
        let mineralObjects = [];
        let minerals = room.find(FIND_MINERALS);
        for (let i = 0; i < minerals.length; i++) {
            let obj = SwarmCreator.CreateSwarmObject(SwarmType.SwarmMineral) as SwarmMineral;
            let newMem = SwarmCreator.CreateNewSwarmMemory(sources[i].id, SwarmType.SwarmMineral);
            newMem.ReserveMemory();
            obj.AssignObject(minerals[i], newMem as IMineralMemory);
            staticObjects.push(obj.ReleaseMemory());
        }

        room.memory.SetData(STATIC_OBJECTS, staticObjects);
        room.memory.SetData(ROOM_OBJECTS, {});
    }
}