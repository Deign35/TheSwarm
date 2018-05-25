export const OSPackage: IPackage<RoomStateMemory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(PKG_SimpleOwnedRoom, BasicCreepScript);
    }
}

import { BasicCreepGroup } from "CreepGroups/BasicCreepGroup";

const EmergencyHauler = 'E_Hauler';
const NormalHauler = 'N_Hauler';
export class BasicCreepScript extends BasicCreepGroup<CreepScript_Memory> {
    protected get GroupPrefix(): string { return 'BCS' }
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
        this.EnsureHarvesters();
        this.EnsureRefiller();
        this.EnsureUpgraders();

        if (!this.roomData.groups.CG_Maintenance) {
            let maintenanceMem: MaintenanceGroup_Memory = {
                homeRoom: this.roomName,
                targetRoom: this.roomName,
                assignments: {},
                creeps: {},
                repairQueue: []
            }
            let maintenancePID = this.kernel.startProcess(CG_Maintenance, maintenanceMem);
            this.roomData.groups.CG_Maintenance = maintenancePID;
            this.kernel.setParent(maintenancePID, this.pid);
        }
        if (!this.roomData.groups.CG_Infrastructure) {
            let infraMem: InfrastructureGroup_Memory = {
                homeRoom: this.roomName,
                targetRoom: this.roomName,
                assignments: {},
                creeps: {},
                repairQueue: []
            }
            let infraPID = this.kernel.startProcess(CG_Infrastructure, infraMem);
            this.roomData.groups.CG_Infrastructure = infraPID;
            this.kernel.setParent(infraPID, this.pid);
        }
    }
    protected EnsureHarvesters(): void {
        let extractionLevel = 0;
        if (this.room.energyCapacityAvailable >= 800) {
            extractionLevel = 2;
        } else if (this.room.energyCapacityAvailable >= 550) {
            extractionLevel = 1;
        }

        let sourceIDs = this.View.GetRoomData(this.roomName)!.sourceIDs;
        for (let i = 0; i < sourceIDs.length; i++) {
            this.EnsureAssignment(sourceIDs[i], CT_Harvester, extractionLevel, Priority_Medium, CJ_Harvester, TT_Harvest);
            this.SetAssignmentTarget(sourceIDs[i], sourceIDs[i]);
        }
    }

    protected EnsureRefiller(): void {
        let creepIDs = Object.keys(this.creeps);
        if (creepIDs.length < 2 && !this.assignments[NormalHauler]) { // (TODO): Detect a room that cannot fill itself
            // Check for an existing hauler
            this.EnsureAssignment(EmergencyHauler, CT_Refiller, 0, Priority_EMERGENCY, CJ_Refiller, TT_SpawnRefill);
        } else {
            this.EnsureAssignment(NormalHauler, CT_FastHauler, 1, Priority_Highest, CJ_Refiller, TT_SpawnRefill);
            if (this.assignments[EmergencyHauler] && this.assignments[EmergencyHauler].c) {
                this.ChangeCreepAssignment(EmergencyHauler, NormalHauler);
                this.kernel.killProcess(this.assignments[EmergencyHauler].pid!, 'Killing EmergencyHauler');
                delete this.assignments[EmergencyHauler];
                this.kernel.killProcess(this.assignments[NormalHauler].pid!, 'Replacing EmergencyHauler');
                delete this.assignments[NormalHauler].pid;
                this.CreateProcessForAssignment(NormalHauler, Priority_Highest, CJ_Refiller);
            }
            /*this.targetTypes[NormalHauler] = 'Refill';
            if (this.assignments[EmergencyHauler]) {
                for (let i = 0; i < creepIDs.length; i++) {
                    if (this.creeps[creepIDs[i]].aID == EmergencyHauler) {
                        this.HandleDeadJob(EmergencyHauler);
                        let creepData = this.creeps[creepIDs[i]];
                        creepData.aID = NormalHauler;
                        this.assignments[NormalHauler].c = creepData.name;
                        //this.kernel.killProcess(this.assignments[NormalHauler].pid!, 'Reassigning Refill to Hauler');
                        this.HandleDeadJob(NormalHauler);
                        this.EnsureAssignment(NormalHauler, CT_FastHauler, 1, Priority_Highest, CJ_Refiller, TT_SpawnRefill);
                    }
                }
            }*/
        }
    }
    protected EnsureUpgraders() {
        let upgraderSize = 0;
        let numberUpgraders = 4;
        switch (this.room.controller!.level) {
            case (8):
                numberUpgraders = 1;
                upgraderSize = 6;
                break;
            case (7):
                upgraderSize = 5;
                numberUpgraders = 2;
                break;
            case (6):
                upgraderSize = 4;
                break;
            case (5):
                upgraderSize = 3;
                break;
            case (4):
            case (3):
                upgraderSize = 2;
                break;
            case (2):
                upgraderSize = 0;
                break;
            case (1):
            default:
                numberUpgraders = 1;
                break;
        }

        for (let i = 0; i < numberUpgraders; i++) {
            this.EnsureAssignment('Upgrader_' + i, CT_Upgrader, upgraderSize, Priority_Low, CJ_Upgrade, TT_Upgrader);
        }
    }
}