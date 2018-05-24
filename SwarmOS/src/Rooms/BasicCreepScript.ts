export const OSPackage: IPackage<RoomStateMemory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(PKG_SimpleOwnedRoom, BasicCreepScript);
    }
}

import { BasicCreepGroup } from "CreepGroups/BasicCreepGroup";

const EmergencyHauler = 'E_Hauler';
const NormalHauler = 'N_Hauler';
export class BasicCreepScript extends BasicCreepGroup<CreepScript_Memory> {
    protected GetNewTarget(assignmentID: string): string {
        switch (this.targetTypes[assignmentID]) {
            case ('Harvest'):
                return assignmentID;
            case ('Refill'):
                let viewData = this.View.GetRoomData(this.memory.targetRoom)!;
                let nextTarget = undefined;
                if (!viewData.structures.extension || !viewData.structures.spawn) {
                    throw new Error(`Missing data`);
                }
                for (let i = 0; i < viewData.structures.extension.length; i++) {
                    let extension = Game.getObjectById(viewData.structures.extension[i]) as StructureExtension;
                    if (extension && extension.energy < extension.energyCapacity) {
                        nextTarget = extension;
                        break;
                    }
                }
                for (let i = 0; i < viewData.structures.spawn.length; i++) {
                    let spawn = Game.getObjectById(viewData.structures.spawn[i]) as StructureSpawn;
                    if (spawn && spawn.energy < spawn.energyCapacity) {
                        nextTarget = spawn;
                        break;
                    }
                }
                if (!nextTarget) {
                    if (viewData.structures.spawn.length > 0) {
                        nextTarget = Game.getObjectById(viewData.structures.spawn[0]) as StructureSpawn;
                    }
                }

                if (!nextTarget) {
                    throw new Error(`Couldn't find anyting to refill`);
                }
                return nextTarget.id;
            case ('Upgrade'):
                return this.room.controller!.id;
        }

        return '';
    }
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
    protected get targetTypes() {
        return this.memory.targetTypes;
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
                creeps: {}
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
            this.EnsureAssignment(sourceIDs[i], CT_Harvester, extractionLevel, Priority_Medium, CJ_Harvester);
            this.targetTypes[sourceIDs[i]] = 'Harvest';
        }
    }

    protected EnsureRefiller(): void {
        let creepIDs = Object.keys(this.creeps);
        if (creepIDs.length < 2) {
            // Check for an existing hauler
            this.EnsureAssignment(EmergencyHauler, CT_Refiller, 0, Priority_EMERGENCY, CJ_Refiller);
            this.targetTypes[EmergencyHauler] = 'Refill';
        } else {
            this.EnsureAssignment(NormalHauler, CT_FastHauler, 1, Priority_Highest, CJ_Refiller);
            this.targetTypes[NormalHauler] = 'Refill';
            if (this.assignments[EmergencyHauler]) {
                for (let i = 0; i < creepIDs.length; i++) {
                    if (this.creeps[creepIDs[i]].aID == EmergencyHauler) {
                        this.HandleDeadJob(EmergencyHauler);
                        let creepData = this.creeps[creepIDs[i]];
                        creepData.aID = NormalHauler;
                        this.assignments[NormalHauler].c = creepData.name;
                        //this.kernel.killProcess(this.assignments[NormalHauler].pid!, 'Reassigning Refill to Hauler');
                        this.HandleDeadJob(NormalHauler);
                        this.EnsureAssignment(NormalHauler, CT_FastHauler, 1, Priority_Highest, CJ_Refiller);
                    }
                }
            }
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
            this.EnsureAssignment('Upgrader_' + i, CT_Upgrader, upgraderSize, Priority_Low, CJ_Upgrade);
            this.targetTypes['Upgrader_' + i] = 'Upgrade';
        }
    }
}