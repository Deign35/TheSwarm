export const OSPackage: IPackage<RoomStateMemory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(PKG_SimpleOwnedRoom, BootSwarmOS);
    }
}

import { BasicCreepGroup } from "Jobs/BasicCreepGroup";
import { FindNextTo } from "Tools/TheFinder";

class BootSwarmOS extends BasicCreepGroup<BootSwarmOS_Memory> {
    protected EnsureGroupFormation(): void {
        let room = Game.rooms[this.memory.targetRoom];
        this.EnsureAssignment('Bootstrapper', CT_Builder, 0, Priority_EMERGENCY, CJ_Refiller, TT_SpawnRefill);
        let viewData = this.View.GetRoomData(this.memory.targetRoom)!;
        for (let i = 0; i < viewData.sourceIDs.length; i++) {
            this.EnsureSourceGroupFormation(viewData.sourceIDs[i]);
            if (viewData.structures.extension && viewData.structures.extension.length == 5) {
                //nothing
            } else {
                this.EnsureAssignment(viewData.sourceIDs[i] + '_B1', CT_Builder, 0, Priority_Low, CJ_Build, TT_Builder);
            }
        }

        if (this.memory.needsInfrastructureBoot && viewData.structures.spawn) {
            let spawn = Game.getObjectById(viewData.structures.spawn[0]) as StructureSpawn;
            let controller = Game.getObjectById(viewData.structures.controller!) as StructureController;
            let path = spawn.pos.findPathTo(controller);
            for (let i = 0; i < path.length - 1; i++) {
                room.createConstructionSite(path[i].x, path[i].y, STRUCTURE_ROAD);
            }
            delete this.memory.needsInfrastructureBoot;
        }

        if (viewData.structures.container.length >= viewData.sourceIDs.length) {
            this.EnsureAssignment('Upgrader', CT_Upgrader, 0, Priority_Lowest, CJ_Upgrade, TT_Upgrader, viewData.structures.controller!);
            this.EnsureAssignment('Repair', CT_Repair, 0, Priority_Lowest, CJ_Repair, TT_Repair);
        } else {
            this.EnsureAssignment('Builder1', CT_Builder, 0, Priority_Low, CJ_Build, TT_Builder);
            this.EnsureAssignment('Builder2', CT_Builder, 0, Priority_Low, CJ_Build, TT_Builder);
        }

        if (room.controller!.level == 2 && viewData.structures.extension && viewData.structures.extension.length == 5) {
            this.EnsureAssignment('Upgrader2', CT_Upgrader, 1, Priority_Lowest, CJ_Upgrade, TT_Upgrader, viewData.structures.controller!);
            this.EnsureAssignment('Upgrader3', CT_Upgrader, 1, Priority_Lowest, CJ_Upgrade, TT_Upgrader, viewData.structures.controller!);
            this.EnsureAssignment('Upgrader4', CT_Upgrader, 1, Priority_Lowest, CJ_Upgrade, TT_Upgrader, viewData.structures.controller!);
            this.EnsureAssignment('Upgrader5', CT_Upgrader, 1, Priority_Lowest, CJ_Upgrade, TT_Upgrader, viewData.structures.controller!);
            this.EnsureAssignment('Upgrader6', CT_Upgrader, 1, Priority_Lowest, CJ_Upgrade, TT_Upgrader, viewData.structures.controller!);
        }
    }

    protected EnsureSourceGroupFormation(sourceID: string) {
        let nearbyTerrain = FindNextTo((Game.getObjectById(sourceID) as Source).pos, LOOK_TERRAIN);
        let openSpaceCount = 0;
        for (let i = 0; i < nearbyTerrain.length; i++) {
            if (nearbyTerrain[i].terrain != "wall") {
                openSpaceCount++;
            }
        }

        if (openSpaceCount > 0) {
            this.EnsureAssignment(sourceID + '_1', CT_Harvester, 0, Priority_Highest, CJ_Harvester, TT_Harvest, sourceID);
            if (openSpaceCount > 1) {
                this.EnsureAssignment(sourceID + '_2', CT_Harvester, 0, Priority_High, CJ_Harvester, TT_SupportHarvest, sourceID);
                if (openSpaceCount > 2) {
                    this.EnsureAssignment(sourceID + '_3', CT_Harvester, 0, Priority_Medium, CJ_Harvester, TT_SupportHarvest, sourceID);
                }
            }
        }

        let viewData = this.View.GetRoomData(this.memory.targetRoom)!;
        if (this.memory.needsInfrastructureBoot && viewData.structures.spawn) {
            let source = Game.getObjectById(sourceID) as Source;
            let spawn = Game.getObjectById(viewData.structures.spawn![0]) as StructureSpawn;
            let path = spawn.pos.findPathTo(source);
            let room = Game.rooms[this.memory.targetRoom];
            room.createConstructionSite(path[path.length - 2].x, path[path.length - 2].y, STRUCTURE_CONTAINER);
            for (let i = 0; i < path.length - 2; i++) {
                if (i == path.length - 2) {
                    room.createConstructionSite(path[i].x, path[i].y, STRUCTURE_CONTAINER);
                } else {
                    room.createConstructionSite(path[i].x, path[i].y, STRUCTURE_ROAD);
                }
            }
        }
    }
}