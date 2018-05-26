export const OSPackage: IPackage<RoomStateMemory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(PKG_SimpleOwnedRoom, BasicCreepScript);
    }
}

import { BasicCreepGroup } from "Jobs/BasicCreepGroup";

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
        this.EnsureBuilders();
        this.EnsureRepair();
    }
    protected EnsureHarvesters(): void {
        let extractionLevel = 0;
        if (this.room.energyCapacityAvailable >= 800) {
            extractionLevel = 2;
        } else if (this.room.energyCapacityAvailable >= 550) {
            extractionLevel = 1;
        }

        let sourceIDs = this.View.GetRoomData(this.roomName)!.sourceIDs;
        if (sourceIDs.length > 0) {
            this.EnsureAssignment(sourceIDs[0] + '_1', CT_Harvester, extractionLevel, Priority_High, CJ_Harvester, TT_Harvest);
            if (extractionLevel == 0) {
                this.EnsureAssignment(sourceIDs[0] + '_2', CT_Harvester, extractionLevel, Priority_Medium, CJ_Harvester, TT_Harvest);
                this.EnsureAssignment(sourceIDs[0] + '_3', CT_Harvester, extractionLevel, Priority_Medium, CJ_Harvester, TT_Harvest);
            }
        }
        if (sourceIDs.length > 1) {
            this.EnsureAssignment(sourceIDs[1] + '_1', CT_Harvester, extractionLevel, Priority_High, CJ_Harvester, TT_SupportHarvest);
            if (extractionLevel == 0) {
                this.EnsureAssignment(sourceIDs[1] + '_2', CT_Harvester, extractionLevel, Priority_Medium, CJ_Harvester, TT_SupportHarvest);
                this.EnsureAssignment(sourceIDs[1] + '_3', CT_Harvester, extractionLevel, Priority_Medium, CJ_Harvester, TT_SupportHarvest);
            }
        }
    }

    protected EnsureRefiller(): void {
        this.EnsureAssignment(EmergencyHauler, CT_Refiller, 0, Priority_EMERGENCY, CJ_Refiller, TT_SpawnRefill);
        this.EnsureAssignment(NormalHauler, CT_FastHauler, 1, Priority_Medium, CJ_Refiller, TT_SpawnRefill);
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
            this.EnsureAssignment('Upgrader_' + i, CT_Upgrader, upgraderSize, Priority_Lowest, CJ_Upgrade, TT_Upgrader);
        }
    }

    EnsureRepair(): void {
        let viewData = this.View.GetRoomData(this.memory.targetRoom)!;

        let spawnRoom = Game.rooms[this.memory.homeRoom];
        if (viewData.owner && viewData.owner == MY_USERNAME) {
            spawnRoom = Game.rooms[this.memory.targetRoom];
        }

        let repairLevel = 0;
        if (spawnRoom.energyCapacityAvailable >= CreepBodies.Repair[1].cost) { // 1150
            repairLevel = 1;
        }
        if (this.repairQueue.length == 0) {
            let targetRoom = Game.rooms[this.memory.targetRoom];
            if (targetRoom) {
                let structs = targetRoom.find(FIND_STRUCTURES);
                for (let i = 0; i < structs.length; i++) {
                    if (structs[i].hits < structs[i].hitsMax) {
                        this.repairQueue.push(structs[i].id);
                    }
                }
            }

            if (this.repairQueue.length == 0) {
                // (TODO): Update this to a much longer sleep timer.
                this.sleeper.sleep(this.pid, 20);
            }
        }
        if (this.repairQueue.length > 0) {
            this.EnsureAssignment('Repair', CT_Repair, repairLevel, Priority_Low, CJ_Repair, TT_Repair);
        }
    }

    EnsureBuilders(): void {
        let viewData = this.View.GetRoomData(this.memory.targetRoom)!;

        let spawnRoom = Game.rooms[this.memory.homeRoom];
        if (viewData.owner && viewData.owner == MY_USERNAME) {
            spawnRoom = Game.rooms[this.memory.targetRoom];
        }

        let buildLevel = 0;
        if (spawnRoom.energyCapacityAvailable >= 1700) {
            buildLevel = 3;
        } else if (spawnRoom.energyCapacityAvailable >= 1050) {
            buildLevel = 2;
        } else if (spawnRoom.energyCapacityAvailable >= 550) {
            buildLevel = 1;
        }
        if (viewData.cSites.length > 0) {
            this.EnsureAssignment('Builder1', CT_Builder, buildLevel, Priority_Medium, CJ_Build, TT_Builder);
            this.EnsureAssignment('Builder2', CT_Builder, buildLevel, Priority_Low, CJ_Build, TT_Builder);
            this.EnsureAssignment('Builder3', CT_Builder, buildLevel, Priority_Lowest, CJ_Build, TT_Builder);
            this.EnsureAssignment('Builder4', CT_Builder, buildLevel, Priority_Lowest, CJ_Build, TT_Builder);
        }
    }
}