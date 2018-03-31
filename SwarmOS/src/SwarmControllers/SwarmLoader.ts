import { MasterCreepMemory, MasterFlagMemory, MasterRoomMemory, MasterStructureMemory, MasterRoomObjectMemory, MasterOtherMemory, RoomObjectMemory } from "SwarmMemory/StorageMemory";
import { SwarmCreep } from "SwarmTypes/SwarmCreep";
import { SwarmRoom } from "SwarmTypes/SwarmRoom";
import { SwarmFlag } from "SwarmTypes/SwarmFlag";
import { SwarmObject, SwarmRoomObject, SwarmMineral } from "SwarmTypes/SwarmTypes";
import { SwarmSource } from "SwarmTypes/SwarmSource";

const STATIC_OBJECTS = 'static_objects';
const ROOM_OBJECTS = 'room_objects';
const STRUCTURE_OBJECTS = 'structure_objects'
export class SwarmLoader {
    constructor() {
        this.LoadTheSwarm();
    }
    protected MasterMemory!: {
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
    TheSwarmByRoom = {
        // this is not correctly implemented.  Need to separate the different objects into different groupings.
        // Use this only with id instead of copy.
        // i.e. TheSwarmByRoom[room.saveID].structures.container => [id1, id2, id3];
        // TheSwarm.structures[id1] & TheSwarm.structures[id2] & TheSwarm.structures[id3];
    }
    protected LoadTheSwarm() {
        this.MasterMemory = {
            creeps: Swarmlord.CheckoutMasterMemory('creeps') as MasterCreepMemory,
            flags: Swarmlord.CheckoutMasterMemory('flags') as MasterFlagMemory,
            other: Swarmlord.CheckoutMasterMemory('otherData') as MasterOtherMemory,
            rooms: Swarmlord.CheckoutMasterMemory('rooms') as MasterRoomMemory,
            roomObjects: Swarmlord.CheckoutMasterMemory('roomObjects') as MasterRoomObjectMemory,
            structures: Swarmlord.CheckoutMasterMemory('structures') as MasterStructureMemory
        };
        let keys = Object.keys(Game.rooms);
        for (let i = 0; i < keys.length; i++) {
            this.TheSwarmByRoom[keys[i]] = {};
            this.LoadRoom(Game.rooms[keys[i]]);
        }
        // Load the memory!
        this.LoadCreeps();
        this.LoadFlags();

        global['TheSwarm'] = this.TheSwarm;
    }

    protected LoadCreeps() {
        let allCreeps = Game.creeps;
        let keys = Object.keys(this.MasterMemory.creeps.GetDataIDs());

        for (let i = 0; i < keys.length; i++) {
            let curCreep = this.MasterMemory.creeps.CheckoutMemory(keys[i]);
            if (!Game.creeps[curCreep.id]) {
                this.MasterMemory.creeps.RemoveData(curCreep.id);
            }
        }

        keys = Object.keys(allCreeps);
        for (let i = 0; i < keys.length; i++) {
            let newCreep = Game.creeps[keys[i]];
            let newMem = SwarmCreator.CreateNewSwarmMemory(keys[i], SwarmType.SwarmCreep);
            this.MasterMemory.creeps.SaveMemory(newMem.ReleaseMemory());
            newMem = this.MasterMemory.creeps.CheckoutMemory(keys[i]);
            let swarmObject = SwarmCreator.CreateSwarmObject(SwarmType.SwarmCreep) as SwarmCreep;
            swarmObject.AssignObject(newCreep, newMem);
            // Validate current actions
            // If no action available, put in queue.
            this.TheSwarm.creeps[swarmObject.saveID] = swarmObject;
            this.TheSwarmByRoom[swarmObject.room.name][swarmObject.saveID] = this.TheSwarm.creeps[swarmObject.saveID];
        }
    }

    protected LoadRoom(room: Room) {
        let roomObj = SwarmCreator.CreateSwarmObject(SwarmType.SwarmRoom) as SwarmRoom;
        if (!this.MasterMemory.rooms.HasData(room.name)) {
            let newMem = SwarmCreator.CreateNewSwarmMemory(room.name, SwarmType.SwarmRoom);
            roomObj.AssignObject(room, newMem as IRoomMemory);
            this.InitRoom(roomObj);
            this.MasterMemory.rooms.SaveMemory(roomObj.ReleaseMemory());
        }
        let roomMem = this.MasterMemory.rooms.CheckoutMemory(room.name);
        roomObj.AssignObject(room, roomMem);

        if (roomObj.my) {
            // load stuff
            //let csites = this.LoadObjectsInRoom(roomObj, roomObj.memory, FIND_CONSTRUCTION_SITES);

            this.LoadStructures(roomObj);
            this.LoadMisc(roomObj);
        } else if (roomObj.owner) {
            // Look for enemy stuff.  To be added later.
            // Check if roomObj.owner is even reliable to use in this way...
        }

        this.TheSwarm.rooms[roomObj.saveID] = roomObj;
    }

    /*protected LoadObjectsInRoom(room: SwarmRoom, curMem: TSwarmMemory, find: FindConstant, filter?: (a: any) => boolean) {
        let objs = room.find(find, filter);
        let swarmObjs = {};

        for (let i = 0; i < objs.length; i++) {
            let obj = objs[i] as RoomObject;
            let swarmType = SwarmCreator.GetSwarmType(obj);
            let swarmObj = SwarmCreator.CreateSwarmObject(swarmType);
            let saveID = SwarmCreator.GetObjSaveID(obj);

            if (!curMem.HasData(saveID)) {
                let newMem = SwarmCreator.CreateNewSwarmMemory(saveID, swarmType);
                newMem.ReserveMemory();
                swarmObj.AssignObject(obj, newMem);
                curMem.SetData(saveID, swarmObj.GetCopyOfMemory().ReleaseMemory());
            }

            let swarmMem = SwarmCreator.CreateSwarmMemory(curMem.GetData(saveID));
            swarmObj.AssignObject(obj, swarmMem);
            swarmObjs[saveID] = swarmObj;
        }


        return swarmObjs;
    }*/



    protected LoadStructures(room: SwarmRoom) {
        let structureIDs = this.MasterMemory.structures.GetDataIDs();
        let structuresList = {};
        let objs = room.find(FIND_STRUCTURES);

        for (let i = 0; i < objs.length; i++) {
            let structure = objs[i];

            if (!structuresList[structure.structureType]) {
                structuresList[structure.structureType] = [];
            }
            structuresList[structure.structureType].push(structure.id);

            let swarmType = SwarmCreator.GetStructureSwarmType(structure);
            if (!this.MasterMemory.structures.HasData(structure.id)) {
                let newMem = SwarmCreator.CreateNewSwarmMemory(structure.id, swarmType);
                this.MasterMemory.structures.SaveMemory(newMem.ReleaseMemory());
            }
            let mem = this.MasterMemory.structures.CheckoutMemory(structure.id);
            let swarmStructure = SwarmCreator.CreateSwarmObject(swarmType) as ISwarmStructureType<StructureConstant>;
            swarmStructure.AssignObject(structure, mem);
            this.TheSwarm.structures[swarmStructure.saveID] = swarmStructure as TSwarmStructure;
            this.TheSwarmByRoom[room.saveID][swarmStructure.saveID] = this.TheSwarm.structures[swarmStructure.saveID];
        }

        let ids = this.MasterMemory.structures.GetDataIDs();
        for (let i = 0; i < ids.length; i++) {
            if (!this.TheSwarm.structures[ids[i]]) {
                // Structure has disappeared
                this.MasterMemory.structures.RemoveData(ids[i]);
            }
        }
    }
    protected LoadFlags() {
        let allCreeps = Game.flags;
        let keys = Object.keys(this.MasterMemory.flags.GetDataIDs());

        for (let i = 0; i < keys.length; i++) {
            let curFlag = this.MasterMemory.flags.CheckoutMemory(keys[i]);
            if (!Game.flags[curFlag.id]) {
                this.MasterMemory.flags.RemoveData(curFlag.id);
            }
        }

        keys = Object.keys(allCreeps);
        for (let i = 0; i < keys.length; i++) {
            let newFlag = Game.flags[keys[i]];
            let newMem = SwarmCreator.CreateNewSwarmMemory(keys[i], SwarmType.SwarmFlag);
            this.MasterMemory.flags.SaveMemory(newMem.ReleaseMemory());
            newMem = this.MasterMemory.flags.CheckoutMemory(keys[i]);
            let swarmObject = SwarmCreator.CreateSwarmObject(SwarmType.SwarmCreep) as SwarmFlag;
            swarmObject.AssignObject(newFlag, newMem);
            // Validate current actions
            // If no action available, put in queue.
            this.TheSwarm.flags[swarmObject.saveID] = swarmObject;
            this.TheSwarmByRoom[swarmObject.room!.name][swarmObject.saveID] = this.TheSwarm.creeps[swarmObject.saveID];
        }
    }

    protected LoadMisc(room: SwarmRoom) {
        let staticData = room.memory.GetData(STATIC_OBJECTS);
        let roomData = room.memory.GetData(ROOM_OBJECTS);

        let foundObjects = {};
        if (Game.time % 5 == 0) {
            let foundResources = room.find(FIND_DROPPED_RESOURCES);
            for (let i = 0; i < foundResources.length; i++) {
                foundObjects[foundResources[i].id] = foundResources[i];
            }
        }

        if (Game.time % 11 == 0) {
            let foundTombstones = room.find(FIND_TOMBSTONES);
            for (let i = 0; i < foundTombstones.length; i++) {
                foundObjects[foundTombstones[i].id] = foundTombstones[i];
            }
        }

        if (Game.time % 233 == 0) {
            let foundNukes = room.find(FIND_NUKES);
            for (let i = 0; i < foundNukes.length; i++) {
                foundObjects[foundNukes[i].id] = foundNukes[i];
            }
        }

        let keys = Object.keys(roomData);
        for (let i = 0; i < keys.length; i++) {
            let data = roomData[keys[i]] as TRoomObjectData;
            let obj = Game.getObjectById(data.id) as RoomObjectType;
            if (!obj) {
                delete roomData[keys[i]];
                continue;
            }
            let swarmMem = SwarmCreator.CreateSwarmMemory(data);
            let swarmObj = SwarmCreator.CreateSwarmObject(swarmMem.GetData('SWARM_TYPE')) as SwarmRoomObject<TRoomObjectMemory, RoomObjectType>
            swarmObj.AssignObject(obj, swarmMem as TRoomObjectMemory);
            this.TheSwarm.roomObjects[swarmObj.saveID] = swarmObj as TSwarmRoomObject;
            this.TheSwarmByRoom[room.saveID][swarmObj.saveID] = this.TheSwarm.roomObjects[swarmObj.saveID];
        }

        keys = Object.keys(foundObjects);
        for (let i = 0; i < keys.length; i++) {
            if (this.TheSwarm.roomObjects[keys[i]]) {
                continue;
            }
            let obj = foundObjects[keys[i]] as RoomObjectType;
            let swarmObj = SwarmCreator.CreateNewSwarmObject(obj) as SwarmRoomObject<TRoomObjectMemory, RoomObjectType>;
            roomData[swarmObj.saveID] = swarmObj.ReleaseMemory();
            let mem = SwarmCreator.CreateSwarmMemory(roomData[swarmObj.saveID]);
            swarmObj.AssignObject(obj, mem as TRoomObjectMemory);
            this.TheSwarm.roomObjects[swarmObj.saveID] = swarmObj as TSwarmRoomObject;
            this.TheSwarmByRoom[room.saveID][swarmObj.saveID] = this.TheSwarm.roomObjects[swarmObj.saveID];
        }
    }

    SaveTheSwarm() {
        this.SaveCreeps();
        let keys = Object.keys(this.TheSwarm.rooms);
        for (let i = 0; i < keys.length; i++) {
            this.SaveRoom(this.TheSwarm.rooms[keys[i]] as ISwarmRoom);
        }

        for (let id in this.MasterMemory) {
            Swarmlord.SaveMasterMemory(this.MasterMemory[id], true);
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