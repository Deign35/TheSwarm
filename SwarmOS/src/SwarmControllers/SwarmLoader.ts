import { MasterCreepMemory, MasterFlagMemory, MasterRoomMemory, MasterStructureMemory } from "SwarmMemory/StorageMemory";

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
        roomObjects: IMasterRoomObjectMemory,
        structures: MasterStructureMemory
    }
    protected TheWholeSwarm = {
        creeps: {} as { [id: string]: ISwarmCreep },
        flags: {} as { [id: string]: ISwarmFlag },
        rooms: {} as { [id: string]: ISwarmRoom },
        roomObjects: {} as { [id: string]: TSwarmRoomObject },
        structures: {} as { [id: string]: TSwarmStructure }
    }
    protected LoadTheSwarm() {
        this.MasterMemory = {
            creeps: Swarmlord.CheckoutMasterMemory('creeps') as MasterCreepMemory,
            flags: Swarmlord.CheckoutMasterMemory('flags') as MasterFlagMemory,
            rooms: Swarmlord.CheckoutMasterMemory('rooms') as MasterRoomMemory,
            roomObjects: Swarmlord.CheckoutMasterMemory('roomObjects') as IMasterRoomObjectMemory,
            structures: Swarmlord.CheckoutMasterMemory('structures') as MasterStructureMemory
        };
        // Load the memory!
        this.LoadCreeps();
        let keys = Object.keys(Game.rooms);
        for (let i = 0; i < keys.length; i++) {
            this.LoadRoom(Game.rooms[keys[i]]);
        }
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
            let swarmObject = SwarmCreator.CreateSwarmObject(SwarmType.SwarmCreep) as ISwarmCreep;
            swarmObject.AssignObject(newCreep, newMem);
            // Validate current actions
            // If no action available, put in queue.
            this.TheWholeSwarm.creeps[swarmObject.saveID] = swarmObject;
        }
    }

    protected LoadRoom(room: Room) {
        if (!this.MasterMemory.rooms.HasData(room.name)) {
            let newMem = SwarmCreator.CreateNewSwarmMemory(room.name, SwarmType.SwarmRoom);
            this.MasterMemory.rooms.SaveChildMemory(newMem.ReleaseMemory() as TRoomData)
        }
        let roomMem = this.MasterMemory.rooms.CheckoutChildMemory(room.name);
        let roomObj = SwarmCreator.CreateSwarmObject(roomMem['SWARM_TYPE']) as SwarmRoom;
        roomObj.AssignObject(room, roomMem);

        if (roomObj.my) {
            // load stuff
            this.LoadStructures(roomObj);
            this.LoadFlags(roomObj);
        }
        let flags = this.MasterMemory.flags[roomObj.name];
        let curRoomObjectMem = this.MasterMemory.roomObjects[roomObj.name];

        // Look for enemy stuff.  To be added later.


    }
    protected LoadStructures(room: SwarmRoom) {
        let structureMem = this.MasterMemory.structures.CheckoutChildMemory(room.saveID);
        let objs = room.find(FIND_STRUCTURES);

        for (let i = 0; i < objs.length; i++) {
            let structure = objs[i];
            let swarmType = SwarmCreator.GetStructureSwarmType(structure);
            if (!structureMem.HasData(structure.id)) {
                let newMem = SwarmCreator.CreateNewSwarmMemory(structure.id, swarmType);
                this.MasterMemory.structures.SaveChildMemory(newMem.ReleaseMemory() as TStructureData);
            }
            let mem = this.MasterMemory.structures.CheckoutChildMemory(structure.id);
            let swarmStructure = SwarmCreator.CreateSwarmObject(swarmType);
            swarmStructure.AssignObject(structure, mem);
            this.TheWholeSwarm.structures[swarmStructure.saveID] = swarmStructure as TSwarmStructure;
        }

        let ids = structureMem.GetDataIDs();
        for (let i = 0; i < ids.length; i++) {
            if (!this.TheWholeSwarm.structures[ids[i]]) {
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
            this.TheWholeSwarm.flags[swarmFlag.saveID] = swarmFlag as ISwarmFlag;
        }

        let ids = flagMem.GetDataIDs();
        for (let i = 0; i < ids.length; i++) {
            if (!this.TheWholeSwarm.flags[ids[i]]) {
                flagMem.RemoveData(ids[i]);
            }
        }

        this.MasterMemory.flags.SaveChildMemory(flagMem.ReleaseMemory());
    }

    protected SaveTheSwarm() {
        this.SaveCreeps();
        let keys = Object.keys(this.TheWholeSwarm.rooms);
        for (let i = 0; i < keys.length; i++) {
            this.SaveRoom(this.TheWholeSwarm.rooms[keys[i]] as ISwarmRoom);
        }

        for (let id in this.MasterMemory) {
            Swarmlord.SaveMasterMemory(this.MasterMemory[id], true);
        }
    }
    protected SaveCreeps() {

    }
    protected SaveRoom(swarmRoom: ISwarmRoom) {

    }
}