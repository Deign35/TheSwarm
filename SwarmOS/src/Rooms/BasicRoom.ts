
export const OSPackage: IPackage<RoomStateMemory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(PKG_SimpleOwnedRoom, BasicRoom);
    }
}

import { BasicCreepGroup } from "CreepGroups/BasicCreepGroup";
import { TempBranchGroup } from "CreepGroups/TempBranch";

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

    protected get TempGroup(): TempBranchGroup | undefined {
        if (this.roomData.groups.CG_TempBranch) {
            return (this.kernel.getProcessByPID(this.roomData.groups.CG_TempBranch) as TempBranchGroup);
        }
        return undefined;
    }
    protected EnsureGroupFormation(): void {
        if (!this.roomData.groups.CG_TempBranch) {
            let tempMem: TempBranchGroup_Memory = {
                assignments: {},
                enabled: true,
                homeRoom: this.roomName,
                pri: Priority_Medium,
                targetRoom: this.roomName,
                unprocessedCreeps: [],
                jobs: {
                    CreepBuilder: [],
                    CreepRefiller: [],
                    CreepUpgrader: [],
                }
            }
            let tempPID = this.kernel.startProcess(CG_TempBranch, tempMem);
            this.roomData.groups.CG_TempBranch = tempPID;
        }
        if (this.roomData.owner == MY_USERNAME) {
            if (!this.roomData.groups.CG_Control) {
                let newMem: ControlGroup_Memory = {
                    assignments: {},
                    enabled: true,
                    homeRoom: this.roomName,
                    pri: Priority_Medium,
                    targetRoom: this.roomName
                }
                let newPID = this.kernel.startProcess(CG_Control, newMem);
                this.roomData.groups.CG_Control = newPID;
            }

        }

        if (!this.roomData.owner || this.roomData.owner == MY_USERNAME) {
            if (!this.roomData.groups.CG_Extraction) {
                let extrMem: ExtractionGroup_Memory = {
                    assignments: {},
                    enabled: true,
                    homeRoom: this.roomName,
                    pri: Priority_Medium,
                    targetRoom: this.roomName,
                }
                let extrPID = this.kernel.startProcess(CG_Extraction, extrMem);
                this.roomData.groups.CG_Extraction = extrPID;
            }
            if (!this.roomData.groups.CG_Infrastructure) {
                let infrMem: InfrastructureGroup_Memory = {
                    enabled: true,
                    homeRoom: this.roomName,
                    pri: Priority_Medium,
                    targetRoom: this.roomName,
                    assignments: {}
                }
                let infrPID = this.kernel.startProcess(CG_Infrastructure, infrMem);
                this.roomData.groups.CG_Infrastructure = infrPID;
            }
        }

    }

    ReceiveCreep(creep: Creep, oldAssignment: CreepGroup_Assignment) {
        if (this.roomData.groups.CG_TempBranch) {
            (this.kernel.getProcessByPID(this.roomData.groups.CG_TempBranch) as BasicCreepGroup<any>).ReceiveCreep(creep, oldAssignment);
        }
    }
}