export const OSPackage: IPackage<SpawnRegistry_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(RJ_Misc, RoomStateMiscActivity);
        processRegistry.register(RJ_Structures, RoomStateStructureActivity);
    }
}

import { BasicProcess } from "Core/BasicTypes";

export abstract class RoomStateActivity<T extends RoomStateActivity_Memory> extends BasicProcess<T> {
    @extensionInterface(EXT_RoomView)
    protected View!: IRoomDataExtension;

    private _room?: Room;
    protected get room(): Room | undefined {
        return this._room;
    }
    private _roomData!: RoomState;
    protected get roomData() {
        return this._roomData;
    }
    protected get roomName(): RoomID {
        return this.memory.rID;
    }
    PrepTick() {
        this._room = Game.rooms[this.roomName];
        this._roomData = this.View.GetRoomData(this.memory.rID)!;
        if (!this._roomData) {
            throw new Error(`Roomstate activity is missing roomdata ${this.memory.rID}`);
        }
    }

    protected shouldRefresh(frequency: number, offset: number, lastUpdated: number): boolean {
        if (Game.time - lastUpdated >= frequency) {
            return true;
        }
        return (Game.time + offset) % frequency == 0;
    }
}

class RoomStateMiscActivity extends RoomStateActivity<RoomStateMisc_Memory> {
    RunThread(): ThreadState {
        if (!this.room) {
            return ThreadState_Done;
        }
        if (this.memory.nb) {
            this.roomData.mineralIDs = this.room.find(FIND_MINERALS).map((value: Mineral) => {
                return value.id;
            })
            this.roomData.sourceIDs = this.room.find(FIND_SOURCES).map((value: Source) => {
                return value.id;
            })
            delete this.memory.nb;
        }

        this.roomData.owner = (this.room.controller && this.room.controller.owner && this.room.controller.owner.username) || undefined;
        if (this.shouldRefresh(11, this.roomData.minUpdateOffset, this.memory.lu)) {
            let newCount = 0;
            this.roomData.resources = this.room.find(FIND_DROPPED_RESOURCES).map((value: Resource) => {
                newCount += value.energy || 0;
                return value.id;
            });

            if (this.roomData.RoomType.type == RT_Home && this.room.energyAvailable == this.room.energyCapacityAvailable) {
                if (this.memory.lr + 300 <= newCount || (this.memory.lr < newCount && newCount > 2000)) { // Should this scale?
                    // Spawn a worker
                    this.log.info(`Spawning a worker for ${this.memory.rID}.  Ground resources are growing quite quickly`);
                    let newMem: Worker_Memory = {
                        rID: this.memory.hr,
                        tr: this.memory.rID,
                        target: {
                            at: AT_NoOp,
                            t: '',
                            tt: TT_None
                        },
                        exp: true
                    }

                    this.kernel.startProcess(CJ_Work, newMem);
                } else {
                    this.log.debug(`Resources On the ground diff: ${newCount - this.memory.lr}`);
                }
            }

            this.memory.lr = newCount;
        }

        if (this.shouldRefresh(17, this.roomData.minUpdateOffset, this.memory.lu)) {
            this.roomData.tombstones = this.room.find(FIND_TOMBSTONES).map((value: Tombstone) => {
                return value.id;
            });
        }

        this.memory.lu = Game.time;
        return ThreadState_Done;
    }
}

class RoomStateStructureActivity extends RoomStateActivity<RoomStateActivity_Memory> {
    RunThread(): ThreadState {
        if (!this.room) {
            return ThreadState_Done;
        }
        if (this.shouldRefresh(27, this.roomData.minUpdateOffset, this.memory.lu)) {
            if (this.roomData.owner == MY_USERNAME) {
                this.roomData.structures = {
                    constructedWall: [],
                    container: [],
                    extension: [],
                    lab: [],
                    link: [],
                    rampart: [],
                    road: [],
                    spawn: [],
                    tower: []
                }
            } else {
                this.roomData.structures = {
                    container: [],
                    road: []
                }
            }

            this.roomData.needsRepair = [];
            let allStructures = this.room.find(FIND_STRUCTURES);
            for (let i = 0, length = allStructures.length; i < length; i++) {
                let structure = allStructures[i];
                if (!this.roomData.structures[structure.structureType]) {
                    this.roomData.structures[structure.structureType] = [];
                }

                if ((this.roomData.structures[structure.structureType] as string[]).length !== undefined) {
                    this.roomData.structures[structure.structureType]!.push(structure.id);
                }
                // (TODO): Better prioritization
                if (structure.hits + 1000 < structure.hitsMax && structure.structureType != STRUCTURE_WALL && structure.structureType != STRUCTURE_RAMPART) {
                    this.roomData.needsRepair.push(structure.id);
                }
            }

            let curEnergyLevel = 0;
            this.roomData.targets.CR_Work.energy = {};
            for (let i = 0; i < this.roomData.resources.length; i++) {
                this.roomData.targets.CR_Work.energy[this.roomData.resources[i]] = {
                    a: AT_Pickup,
                    p: Priority_Low,
                    t: TT_Resource
                }
            }
            for (let i = 0; i < this.roomData.structures.container.length; i++) {
                let containerID = this.roomData.structures.container[i];
                let container = Game.getObjectById(containerID) as StructureContainer;
                if (!container) { continue; }
                curEnergyLevel += container.energy || 0;
                let sources = container.pos.findInRange(FIND_SOURCES, 1);
                if (!this.roomData.targets.CR_SpawnFill.energy[containerID]) {
                    this.roomData.targets.CR_SpawnFill.energy[containerID] = {
                        a: AT_Withdraw,
                        p: Priority_Lowest,
                        t: TT_StorageContainer
                    }
                }
                if (sources && sources.length > 0) {
                    this.roomData.targets.CR_SpawnFill.energy[containerID].p = Priority_Low
                } else {
                    if (!this.roomData.targets.CR_SpawnFill.targets[containerID]) {
                        this.roomData.targets.CR_SpawnFill.targets[containerID] = {
                            a: AT_Transfer,
                            p: Priority_Low,
                            t: TT_StorageContainer
                        }
                    }
                    if (!this.roomData.targets.CR_Work.energy[containerID]) {
                        this.roomData.targets.CR_Work.energy[containerID] = {
                            a: AT_Withdraw,
                            p: Priority_High,
                            t: TT_StorageContainer
                        }
                    }
                }
            }

            if (this.roomData.structures.spawn) {
                for (let i = 0; i < this.roomData.structures.spawn.length; i++) {
                    let spawnID = this.roomData.structures.spawn[i];
                    if (!this.roomData.targets.CR_SpawnFill.targets[spawnID]) {
                        this.roomData.targets.CR_SpawnFill.targets[spawnID] = {
                            a: AT_Transfer,
                            p: Priority_High,
                            t: TT_StorageContainer
                        }
                    }
                }
            }

            if (this.roomData.structures.extension) {
                for (let i = 0; i < this.roomData.structures.extension.length; i++) {
                    let extensionID = this.roomData.structures.extension[i];
                    if (!this.roomData.targets.CR_SpawnFill.targets[extensionID]) {
                        this.roomData.targets.CR_SpawnFill.targets[extensionID] = {
                            a: AT_Transfer,
                            p: Priority_Highest,
                            t: TT_StorageContainer
                        }
                    }
                }
            }

            if (this.room && this.room.storage) {
                curEnergyLevel += this.room.storage.energy;
                if (!this.roomData.targets.CR_SpawnFill.targets[this.room.storage.id]) {
                    this.roomData.targets.CR_SpawnFill.targets[this.room.storage.id] = {
                        a: AT_Transfer,
                        p: Priority_Lowest,
                        t: TT_StorageContainer
                    }
                }
                if (!this.roomData.targets.CR_Work.energy[this.room.storage.id]) {
                    this.roomData.targets.CR_Work.energy[this.room.storage.id] = {
                        a: AT_Withdraw,
                        p: Priority_Lowest,
                        t: TT_StorageContainer
                    }
                }
            }

            for (let i = 0; i < this.roomData.sourceIDs.length; i++) {
                this.roomData.targets.CR_Work.energy[this.roomData.sourceIDs[i]] = {
                    a: AT_Harvest,
                    p: Priority_Hold,
                    t: TT_Source
                }
            }

            if (this.roomData.structures.tower && this.roomData.structures.tower.length > 0) {
                for (let i = 0; i < this.roomData.structures.tower.length; i++) {
                    if (!this.roomData.targets.CR_SpawnFill.targets[this.roomData.structures.tower[i]]) {
                        this.roomData.targets.CR_SpawnFill.targets[this.roomData.structures.tower[i]] = {
                            a: AT_Transfer,
                            p: Priority_Medium,
                            t: TT_StorageContainer
                        }
                    }
                }
            }

            let creeps = this.room.find(FIND_MY_CREEPS);
            for (let i = 0; i < creeps.length; i++) {
                if (creeps[i].memory.ct == CT_Worker) {
                    this.roomData.targets.CR_SpawnFill.targets[creeps[i].id] = {
                        a: AT_Transfer,
                        p: Priority_Lowest,
                        t: TT_Creep
                    }
                }
            }
        }

        this.memory.lu = Game.time;
        return ThreadState_Done;
    }
}