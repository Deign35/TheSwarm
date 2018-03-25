import { MasterCreepMemory, MasterFlagMemory, MasterRoomMemory, MasterStructureMemory } from "SwarmMemory/StorageMemory";

const STATIC_OBJECTS = 'static_objects';
const ROOM_OBJECTS = 'room_objects';
export class SwarmLoader {
    //protected SwarmObjectInstances = {}
    constructor() {
        /*this.SwarmObjectInstances[SwarmType.SwarmContainer] = SwarmCreator.CreateSwarmObject(SwarmType.SwarmContainer);
        this.SwarmObjectInstances[SwarmType.SwarmController] = SwarmCreator.CreateSwarmObject(SwarmType.SwarmController);
        this.SwarmObjectInstances[SwarmType.SwarmCreep] = SwarmCreator.CreateSwarmObject(SwarmType.SwarmCreep);
        this.SwarmObjectInstances[SwarmType.SwarmSite] = SwarmCreator.CreateSwarmObject(SwarmType.SwarmSite);
        this.SwarmObjectInstances[SwarmType.SwarmFlag] = SwarmCreator.CreateSwarmObject(SwarmType.SwarmFlag);
        this.SwarmObjectInstances[SwarmType.SwarmMineral] = SwarmCreator.CreateSwarmObject(SwarmType.SwarmMineral);
        this.SwarmObjectInstances[SwarmType.SwarmNuke] = SwarmCreator.CreateSwarmObject(SwarmType.SwarmNuke);
        this.SwarmObjectInstances[SwarmType.SwarmResource] = SwarmCreator.CreateSwarmObject(SwarmType.SwarmResource);
        this.SwarmObjectInstances[SwarmType.SwarmRoom] = SwarmCreator.CreateSwarmObject(SwarmType.SwarmRoom);
        this.SwarmObjectInstances[SwarmType.SwarmSource] = SwarmCreator.CreateSwarmObject(SwarmType.SwarmSource);
        this.SwarmObjectInstances[SwarmType.SwarmTombstone] = SwarmCreator.CreateSwarmObject(SwarmType.SwarmTombstone);
        this.SwarmObjectInstances[SwarmType.SwarmExtension] = SwarmCreator.CreateSwarmObject(SwarmType.SwarmExtension);
        this.SwarmObjectInstances[SwarmType.SwarmExtractor] = SwarmCreator.CreateSwarmObject(SwarmType.SwarmExtractor);
        this.SwarmObjectInstances[SwarmType.SwarmKeepersLair] = SwarmCreator.CreateSwarmObject(SwarmType.SwarmKeepersLair);
        this.SwarmObjectInstances[SwarmType.SwarmLab] = SwarmCreator.CreateSwarmObject(SwarmType.SwarmLab);
        this.SwarmObjectInstances[SwarmType.SwarmLink] = SwarmCreator.CreateSwarmObject(SwarmType.SwarmLink);
        this.SwarmObjectInstances[SwarmType.SwarmNuker] = SwarmCreator.CreateSwarmObject(SwarmType.SwarmNuker);
        this.SwarmObjectInstances[SwarmType.SwarmObserver] = SwarmCreator.CreateSwarmObject(SwarmType.SwarmObserver);
        this.SwarmObjectInstances[SwarmType.SwarmPowerBank] = SwarmCreator.CreateSwarmObject(SwarmType.SwarmPowerBank);
        this.SwarmObjectInstances[SwarmType.SwarmPowerSpawn] = SwarmCreator.CreateSwarmObject(SwarmType.SwarmPowerSpawn);
        this.SwarmObjectInstances[SwarmType.SwarmPortal] = SwarmCreator.CreateSwarmObject(SwarmType.SwarmPortal);
        this.SwarmObjectInstances[SwarmType.SwarmRampart] = SwarmCreator.CreateSwarmObject(SwarmType.SwarmRampart);
        this.SwarmObjectInstances[SwarmType.SwarmRoad] = SwarmCreator.CreateSwarmObject(SwarmType.SwarmRoad);
        this.SwarmObjectInstances[SwarmType.SwarmSpawn] = SwarmCreator.CreateSwarmObject(SwarmType.SwarmSpawn);
        this.SwarmObjectInstances[SwarmType.SwarmTerminal] = SwarmCreator.CreateSwarmObject(SwarmType.SwarmTerminal);
        this.SwarmObjectInstances[SwarmType.SwarmTower] = SwarmCreator.CreateSwarmObject(SwarmType.SwarmTower);
        this.SwarmObjectInstances[SwarmType.SwarmWall] = SwarmCreator.CreateSwarmObject(SwarmType.SwarmWall);*/
        this.LoadTheSwarm();
    }
    protected MasterMemory!: {
        creeps: MasterCreepMemory,
        flags: MasterFlagMemory,
        rooms: MasterRoomMemory,
        structures: MasterStructureMemory
    }
    TheSwarm = {
        creeps: {} as { [id: string]: ISwarmCreep },
        flags: {} as { [id: string]: ISwarmFlag },
        rooms: {} as { [id: string]: ISwarmRoom },
        roomObjects: {} as { [id: string]: TSwarmRoomObject },
        structures: {} as { [id: string]: TSwarmStructure }
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
            rooms: Swarmlord.CheckoutMasterMemory('rooms') as MasterRoomMemory,
            structures: Swarmlord.CheckoutMasterMemory('structures') as MasterStructureMemory
        };
        let keys = Object.keys(Game.rooms);
        for (let i = 0; i < keys.length; i++) {
            this.TheSwarmByRoom[keys[i]] = {};
            this.LoadRoom(Game.rooms[keys[i]]);
        }
        // Load the memory!
        this.LoadCreeps();

        global['TheSwarm'] = this.TheSwarm;
    }

    protected LoadCreeps() {
        let allCreeps = Game.creeps;
        let keys = Object.keys(this.MasterMemory.creeps.GetDataIDs());

        for (let i = 0; i < keys.length; i++) {
            let curCreep = this.MasterMemory.creeps.CheckoutChildMemory(keys[i]);
            if (!Game.creeps[curCreep.id]) {
                this.MasterMemory.creeps.RemoveData(curCreep.id);
            }
        }

        keys = Object.keys(allCreeps);
        for (let i = 0; i < keys.length; i++) {
            let newCreep = Game.creeps[keys[i]];
            let newMem = SwarmCreator.CreateNewSwarmMemory(keys[i], SwarmType.SwarmCreep) as ICreepMemory;
            this.MasterMemory.creeps.SaveChildMemory(newMem.ReleaseMemory() as TCreepData);
            newMem = this.MasterMemory.creeps.CheckoutChildMemory(keys[i]);
            let swarmObject = SwarmCreator.CreateSwarmObject(SwarmType.SwarmCreep) as TSwarmCreep;
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
            this.MasterMemory.rooms.SaveChildMemory(roomObj.GetCopyOfMemory().ReleaseMemory() as TRoomData);
        }
        let roomMem = this.MasterMemory.rooms.CheckoutChildMemory(room.name);
        roomObj.AssignObject(room, roomMem);

        if (roomObj.my) {
            // load stuff
            this.LoadStructures(roomObj);
            this.LoadFlags(roomObj);
            this.LoadMisc(roomObj);
        } else if (roomObj.owner) {
            // Look for enemy stuff.  To be added later.
            // Check if roomObj.owner is even reliable to use...
        }

        this.TheSwarm.rooms[roomObj.saveID] = roomObj;
    }

    protected LoadStructures(room: SwarmRoom) {
        let structureMem = this.MasterMemory.structures.CheckoutChildMemory(room.saveID);
        let structuresList = {};
        let objs = room.find(FIND_STRUCTURES);

        for (let i = 0; i < objs.length; i++) {
            let structure = objs[i];

            if (!structuresList[structure.structureType]) {
                structuresList[structure.structureType] = [];
            }
            structuresList[structure.structureType].push(structure.id);

            let swarmType = SwarmCreator.GetStructureSwarmType(structure);
            if (!structureMem.HasData(structure.id)) {
                let newMem = SwarmCreator.CreateNewSwarmMemory(structure.id, swarmType);
                this.MasterMemory.structures.SaveChildMemory(newMem.ReleaseMemory() as TStructureData);
            }
            let mem = this.MasterMemory.structures.CheckoutChildMemory(structure.id);
            let swarmStructure = SwarmCreator.CreateSwarmObject(swarmType);
            swarmStructure.AssignObject(structure, mem);
            this.TheSwarm.structures[swarmStructure.saveID] = swarmStructure as TSwarmStructure;
            this.TheSwarmByRoom[room.saveID][swarmStructure.saveID] = this.TheSwarm.structures[swarmStructure.saveID];
        }

        let ids = structureMem.GetDataIDs();
        for (let i = 0; i < ids.length; i++) {
            if (!this.TheSwarm.structures[ids[i]]) {
                // Structure has disappeared
                structureMem.RemoveData(ids[i]);
            }
        }

        this.MasterMemory.structures.SaveChildMemory(structureMem.ReleaseMemory());
    }

    protected LoadFlags(room: SwarmRoom) {
        let flagMem = this.MasterMemory.flags.CheckoutChildMemory(room.saveID);
        let objs = room.find(FIND_FLAGS);

        for (let i = 0; i < objs.length; i++) {
            let flag = objs[i];
            if (!flagMem.HasData(flag.name)) {
                let newMem = SwarmCreator.CreateNewSwarmMemory(flag.name, SwarmType.SwarmFlag);
                this.MasterMemory.flags.SaveChildMemory(newMem.ReleaseMemory() as TFlagData);
            }
            let mem = this.MasterMemory.flags.CheckoutChildMemory(flag.name);
            let swarmFlag = SwarmCreator.CreateSwarmObject(SwarmType.SwarmFlag);
            swarmFlag.AssignObject(swarmFlag, mem);
            this.TheSwarm.flags[swarmFlag.saveID] = swarmFlag as ISwarmFlag;
            this.TheSwarmByRoom[room.saveID][swarmFlag.saveID] = this.TheSwarm.flags[swarmFlag.saveID];
        }

        let ids = flagMem.GetDataIDs();
        for (let i = 0; i < ids.length; i++) {
            if (!this.TheSwarm.flags[ids[i]]) {
                flagMem.RemoveData(ids[i]);
            }
        }

        this.MasterMemory.flags.SaveChildMemory(flagMem.ReleaseMemory());
    }

    protected LoadMisc(room: SwarmRoom) {
        let staticData = room.GetData(STATIC_OBJECTS);
        let roomData = room.GetData(ROOM_OBJECTS);

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
            let obj = Game.getObjectById(data.id);
            if (!obj) {
                delete roomData[keys[i]];
                continue;
            }
            let swarmMem = SwarmCreator.CreateSwarmMemory(data);
            let swarmObj = SwarmCreator.CreateSwarmObject(swarmMem.GetData('SWARM_TYPE'));
            swarmObj.AssignObject(obj, swarmMem);
            this.TheSwarm.roomObjects[swarmObj.saveID] = swarmObj as TSwarmRoomObject;
            this.TheSwarmByRoom[room.saveID][swarmObj.saveID] = this.TheSwarm.roomObjects[swarmObj.saveID];
        }

        keys = Object.keys(foundObjects);
        for (let i = 0; i < keys.length; i++) {
            if (this.TheSwarm.roomObjects[keys[i]]) {
                continue;
            }
            let obj = foundObjects[keys[i]];
            let swarmObj = SwarmCreator.CreateNewSwarmObject(obj);
            roomData[swarmObj.saveID] = swarmObj.GetCopyOfMemory().ReleaseMemory();
            let mem = SwarmCreator.CreateSwarmMemory(roomData[swarmObj.saveID]);
            swarmObj.AssignObject(obj, mem);
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
            let obj = SwarmCreator.CreateSwarmObject(SwarmType.SwarmSource);
            let newMem = SwarmCreator.CreateNewSwarmMemory(sources[i].id, SwarmType.SwarmSource);
            newMem.ReserveMemory();
            obj.AssignObject(sources[i], newMem as IRoomObjectMemory);
            staticObjects.push(obj.GetCopyOfMemory().ReleaseMemory() as ISourceData);
        }
        let mineralObjects = [];
        let minerals = room.find(FIND_MINERALS);
        for (let i = 0; i < minerals.length; i++) {
            let obj = SwarmCreator.CreateSwarmObject(SwarmType.SwarmMineral);
            let newMem = SwarmCreator.CreateNewSwarmMemory(sources[i].id, SwarmType.SwarmMineral);
            newMem.ReserveMemory();
            obj.AssignObject(minerals[i], newMem as IRoomObjectMemory);
            staticObjects.push(obj.GetCopyOfMemory().ReleaseMemory() as IMineralData);
        }

        room.SetData(STATIC_OBJECTS, staticObjects);
        room.SetData(ROOM_OBJECTS, {});
    }
}