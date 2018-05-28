export const OSPackage: IPackage<RoomStateMemory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(PKG_SimpleOwnedRoom, BasicRoom);
    }
}

import { BasicCreepGroup } from "Jobs/BasicCreepGroup";

class BasicRoom extends BasicCreepGroup<CreepGroup_Memory> {
    protected roomData!: RoomState;
    get roomName() {
        return this.memory.homeRoom;
    }
    get room() {
        return Game.rooms[this.roomName];
    }
    PrepTick() {
        super.PrepTick();
        this.roomData = this.View.GetRoomData(this.roomName)!;
    }
    EnsureGroupFormation() {
        if (this.roomData.owner == MY_USERNAME) {
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

            // (TODO): Combine this with the other source one...this is just ugly
            if (this.room.controller!.level > 3 && this.room.energyCapacityAvailable >= 800) {
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
            }
        }

        if (!this.roomData.owner || this.roomData.owner == MY_USERNAME) {
            if (!this.roomData.groups.CG_SimpleSource && this.room.controller && this.room.controller.level < 3) {
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
            }
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

    }
}