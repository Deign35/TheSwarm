
export const OSPackage: IPackage<RoomStateMemory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(PKG_SimpleOwnedRoom, BasicRoom);
    }
}

import { BasicCreepGroup } from "CreepGroups/BasicCreepGroup";

class BasicRoom extends BasicCreepGroup<RoomThreadMemory> {
    protected get GroupPrefix(): string { return 'BSC' }
    @extensionInterface(EXT_RoomView)
    RoomView!: IRoomDataExtension;

    protected get room() {
        return Game.rooms[this.roomName];
    }
    protected get roomName() {
        return this.memory.homeRoom;
    }
    protected get controller() {
        return this.room && this.room.controller;
    }
    protected get roomData() {
        return this.RoomView.GetRoomData(this.roomName)!;
    }
    protected EnsureGroupFormation(): void {
        if (this.roomData.owner == MY_USERNAME) {
            if (!this.roomData.groups.CG_Control) {
                let newMem: ControlGroup_Memory = {
                    assignments: {},
                    childThreads: {},
                    enabled: true,
                    homeRoom: this.roomName,
                    PKG: CG_Control,
                    pri: Priority_Medium,
                    targetRoom: this.roomName
                }
                let newPID = this.kernel.startProcess(CG_Control, newMem);
                this.roomData.groups.CG_Control = newPID;
                this.AttachChildThread(newMem, this.pid, newPID);
            }
            if (!this.roomData.groups.CG_Infrastructure) {
                let infMem: InfrastructureGroup_Memory = {
                    assignments: {},
                    childThreads: {},
                    enabled: true,
                    homeRoom: this.roomName,
                    PKG: CG_Infrastructure,
                    pri: Priority_Medium,
                    targetRoom: this.roomName,
                    unprocessedCreeps: [],
                    jobs: {
                        CreepBuilder: [],
                        CreepRefiller: [],
                        CreepUpgrader: [],
                    }
                }
                let infPID = this.kernel.startProcess(CG_Infrastructure, infMem);
                this.roomData.groups.CG_Infrastructure = infPID;
                this.AttachChildThread(infMem, this.pid, infPID);
            }
        }

        if (!this.roomData.owner || this.roomData.owner == MY_USERNAME) {
            if (!this.roomData.groups.CG_Extraction) {
                let extrMem: ExtractionGroup_Memory = {
                    assignments: {},
                    childThreads: {},
                    enabled: true,
                    homeRoom: this.roomName,
                    PKG: CG_Extraction,
                    pri: Priority_Medium,
                    targetRoom: this.roomName,
                }
                let extrPID = this.kernel.startProcess(CG_Extraction, extrMem);
                this.roomData.groups.CG_Extraction = extrPID;
                this.AttachChildThread(extrMem, this.pid, extrPID);
            }
        }
    }
}