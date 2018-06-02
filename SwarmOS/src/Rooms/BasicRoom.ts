export const OSPackage: IPackage<RoomStateMemory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(PKG_SimpleOwnedRoom, BasicRoom);
    }
}

import { BasicProcess } from "Core/BasicTypes";

class BasicRoom extends BasicProcess<CreepGroup_Memory> {
    @extensionInterface(EXT_CreepRegistry)
    protected creepRegistry!: ICreepRegistryExtensions;
    @extensionInterface(EXT_RoomView)
    protected View!: IRoomDataExtension;
    protected roomData!: RoomState;
    get roomName() {
        return this.memory.homeRoom;
    }
    get room() {
        return Game.rooms[this.roomName];
    }
    PrepTick() {
        this.roomData = this.View.GetRoomData(this.roomName)!;
    }
    RunThread(): ThreadState {
        if (!this.roomData.groups.CG_SimpleSource) {
            this.roomData.groups.CG_SimpleSource = [];
        }
        if (this.roomData.groups.CG_SimpleSource.length < this.roomData.sourceIDs.length) {
            if (this.roomData.groups.CG_SimpleSource.length > 0) {
                this.log.alert(`ASSUMPTION FAILURE -- BasicRoom.EnsureGroupFormation()`);
            }
            for (let i = 0; i < this.roomData.sourceIDs.length; i++) {
                let newMem: HarvestJob_Memory = {
                    t: this.roomData.sourceIDs[i],
                    r: this.memory.targetRoom
                }
                this.roomData.groups.CG_SimpleSource.push(this.kernel.startProcess(CJ_Harvester, newMem));
            }
        }
        return ThreadState_Done;
        /*if (this.roomData.owner == MY_USERNAME) {
            if (!this.room.controller!.safeMode && !this.room.controller!.safeModeCooldown && this.room.controller!.safeModeAvailable > 0) {
                let hostiles = this.room.find(FIND_HOSTILE_CREEPS);
                for (let i = 0; i < hostiles.length; i++) {
                    if (hostiles[i].getActiveBodyparts(ATTACK) > 0 || hostiles.length >= 3) {
                        this.room.controller!.activateSafeMode();
                    }
                }
            }
            if (!this.roomData.groups.CG_Control) {
                let newMem: ControlGroup_Memory = {
                    assignments: {},
                    homeRoom: this.roomName,
                    targetRoom: this.roomName,
                    level: 0,
                    needsInfrastructureBoot: true
                }
                let newPID = this.kernel.startProcess(CG_Control, newMem);
                this.roomData.groups.CG_Control = newPID;
            }
            if (!this.roomData.groups.CG_SelfDefense) {
                let newMem: SelfDefenseGroup_Memory = {
                    assignments: {},
                    homeRoom: this.roomName,
                    targetRoom: this.roomName,
                    needsInfrastructureBoot: true
                }

                let newPID = this.kernel.startProcess(CG_SelfDefense, newMem);
                this.roomData.groups.CG_SelfDefense = newPID;
            }

            // (TODO): Combine this with the other source one...this is just ugly
            /*if (this.room.controller!.level > 3 && this.room.energyCapacityAvailable >= 800) {
                if (this.roomData.groups.CG_Source) {
                    for (let i = 0; i < this.roomData.groups.CG_Source.length; i++) {
                        let creepGroup = this.kernel.getProcessByPID(this.roomData.groups.CG_Source[i]) as BasicCreepGroup<any>;
                        creepGroup.CloseCreepGroupAssignments();
                        this.kernel.killProcess(this.roomData.groups.CG_Source[i], `Room source group updated to simple source`);
                    }
                    delete this.roomData.groups.CG_Source;
                }
                if (!this.roomData.groups.CG_SimpleSource) {
                    this.roomData.groups.CG_SimpleSource = [];
                    for (let i = 0; i < this.roomData.sourceIDs.length; i++) {
                        let sourceMem: SourceGroup_Memory = {
                            assignments: {},
                            homeRoom: this.roomName,
                            targetRoom: this.roomName,
                            sourceID: this.roomData.sourceIDs[i]
                        }
                        let sourcePID = this.kernel.startProcess(CG_SimpleSource, sourceMem);
                        this.roomData.groups.CG_SimpleSource.push(sourcePID);
                    }
                }
            }*
        }

        if (!this.roomData.owner || this.roomData.owner == MY_USERNAME) {
            /*if (!this.roomData.groups.CG_SimpleSource && this.room.controller && this.room.controller.level <= 3) {
                if (!this.roomData.groups.CG_Source) {
                    this.roomData.groups.CG_Source = [];
                    for (let i = 0; i < this.roomData.sourceIDs.length; i++) {
                        let sourceMem: SourceGroup_Memory = {
                            assignments: {},
                            homeRoom: this.roomName,
                            targetRoom: this.roomName,
                            sourceID: this.roomData.sourceIDs[i],
                            needsInfrastructureBoot: true
                        }
                        let sourcePID = this.kernel.startProcess(CG_Source, sourceMem);
                        this.roomData.groups.CG_Source.push(sourcePID);
                    }
                }
            }*
            if (!this.roomData.groups.CG_Infrastructure) {
                let infrMem: CreepGroup_Memory = {
                    homeRoom: this.roomName,
                    targetRoom: this.roomName,
                    assignments: {}
                }
                let infrPID = this.kernel.startProcess(CG_Infrastructure, infrMem);
                this.roomData.groups.CG_Infrastructure = infrPID;
                this.kernel.setParent(infrPID, this.pid);
            }

            if (!this.roomData.groups.CG_Refill) {
                this.roomData.groups.CG_Refill = [];
                let refillerMem: CreepGroup_Memory = {
                    homeRoom: this.roomName,
                    targetRoom: this.roomName,
                    assignments: {}
                };
                let refillerPID = this.kernel.startProcess(CG_Refill, refillerMem);
                this.roomData.groups.CG_Refill.push(refillerPID);
            }
        }

        if (!this.roomData.groups.CG_SimpleSource) {
            this.roomData.groups.CG_SimpleSource = [];
        }*/
    }
}