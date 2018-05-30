export const OSPackage: IPackage<SpawnRegistry_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(CG_Source, SourceGroup);
        processRegistry.register(CG_SimpleSource, SimpleSourceGroup);
    }
}

import { BasicCreepGroup } from "Groups/BasicCreepGroup";
import { FindNextTo } from "Tools/TheFinder";

class SimpleSourceGroup extends BasicCreepGroup<SourceGroup_Memory> {
    protected EnsureGroupFormation(): void {
        let viewData = this.View.GetRoomData(this.memory.targetRoom)!;
        let source = Game.getObjectById(this.memory.sourceID) as Source;
        let isMyRoom = viewData.owner && viewData.owner == MY_USERNAME;
        this.EnsureAssignment('Harvester', CT_Harvester, 2, isMyRoom ? Priority_High : Priority_Medium, CJ_Harvester, TT_Harvest, this.memory.sourceID);

        this.sleeper.sleep(this.pid, 10);
    }
}
export class SourceGroup extends BasicCreepGroup<SourceGroup_Memory> {
    protected EnsureGroupFormation(): void {
        let viewData = this.View.GetRoomData(this.memory.targetRoom)!;
        let source = Game.getObjectById(this.memory.sourceID) as Source;
        let targetRoom = Game.rooms[this.memory.targetRoom];
        let extractionLevel = 0;
        let isMyRoom = viewData.owner && viewData.owner == MY_USERNAME;
        let spawnCap = 300;
        if (!viewData.owner) {
            let room = Game.rooms[this.memory.homeRoom];
            extractionLevel = 2;
            spawnCap = room.energyCapacityAvailable;
        } else {
            spawnCap = targetRoom.energyCapacityAvailable;
            if (spawnCap >= CreepBodies.Harvester[2].cost) {
                extractionLevel = 2;
            } else if (spawnCap >= CreepBodies.Harvester[1].cost) {
                extractionLevel = 1;
            }
        }
        this.EnsureAssignment('Harvester', CT_Harvester, extractionLevel,
            isMyRoom ? Priority_High : Priority_Highest, CJ_Harvester, TT_Harvest, this.memory.sourceID);
        if (extractionLevel == 0) {
            if (source) {
                let spaces = FindNextTo(source.pos, LOOK_TERRAIN);
                if (spaces.length > 1) {
                    this.EnsureAssignment('Harvester2', CT_Harvester, 0, Priority_Medium, CJ_Harvester, TT_Harvest, this.memory.sourceID);
                    if (spaces.length > 2) {
                        this.EnsureAssignment('Harvester3', CT_Harvester, 0, Priority_Medium, CJ_Harvester, TT_Harvest, this.memory.sourceID);
                    }
                }
            }
        }

        if (this.memory.needsInfrastructureBoot) {
            this.CreateSites();
            delete this.memory.needsInfrastructureBoot;
        } else if (this.memory.savedPath) {
            this.GatherSites();
            delete this.memory.savedPath;
        } else if (this.memory.constructionIDs && this.memory.constructionIDs.length > 0) {
            while (this.memory.constructionIDs.length > 0) {
                let constructionSite = Game.getObjectById(this.memory.constructionIDs[0]);
                if (!constructionSite) {
                    this.memory.constructionIDs.shift();
                    continue;
                }
                this.EnsureAssignment('SupportBuilder', CT_Worker, spawnCap >= CreepBodies.Worker[1].cost ? 1 : 0,
                    Priority_Lowest, CJ_Build, TT_Builder, this.memory.constructionIDs[0]);
                break;
            }
        } else if (this.assignments['SupportBuilder']) {
            this.CloseAssignment('SupportBuilder');
            delete this.memory.constructionIDs;
            delete this.assignments['SupportBuilder'];
        }

        this.sleeper.sleep(this.pid, 10);
    }

    CreateSites() {
        let path;
        let targetRoom = Game.rooms[this.memory.targetRoom];
        if (this.memory.targetRoom != this.memory.homeRoom) {
            if (targetRoom) {
                let source = Game.getObjectById(this.memory.sourceID) as Source;
                // (TODO): Incomplete.  Need to figure out how to create the road in other rooms.
            }
        } else {
            let source = Game.getObjectById(this.memory.sourceID) as Source;
            let spawn = source.pos.findClosestByRange(FIND_MY_SPAWNS);

            path = spawn.pos.findPathTo(source);
        }

        if (path) {
            let end = path[path.length - 2];
            targetRoom.createConstructionSite(end.x, end.y, STRUCTURE_CONTAINER);
            for (let i = 0; i < path.length - 2; i++) {
                targetRoom.createConstructionSite(path[i].x, path[i].y, STRUCTURE_ROAD);
            }
            this.memory.savedPath = path;
        }
    }

    GatherSites() {
        this.memory.constructionIDs = [];
        for (let i = 0; i < this.memory.savedPath!.length; i++) {
            let pos = new RoomPosition(this.memory.savedPath![i].x, this.memory.savedPath![i].y, this.memory.targetRoom);
            let site = pos.lookFor(LOOK_CONSTRUCTION_SITES);
            if (site && site.length > 0) {
                this.memory.constructionIDs.push(site[0].id);
            }
        }
        this.memory.constructionIDs = this.memory.constructionIDs.reverse();
    }
}