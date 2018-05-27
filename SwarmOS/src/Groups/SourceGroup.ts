import { BasicCreepGroup } from "Jobs/BasicCreepGroup";

class SourceGroup extends BasicCreepGroup<SourceGroup_Memory> {
    protected EnsureGroupFormation(): void {
        let viewData = this.View.GetRoomData(this.memory.targetRoom)!;
        let targetRoom = Game.rooms[this.memory.targetRoom];
        let extractionLevel = 0;
        let isMyRoom = viewData.owner && viewData.owner == MY_USERNAME;
        if (!viewData.owner) {
            extractionLevel = 2;
        } else {
            if (targetRoom.energyCapacityAvailable >= CreepBodies.Harvester[2].cost) {
                extractionLevel = 2;
            } else if (targetRoom.energyCapacityAvailable >= CreepBodies.Harvester[1].cost) {
                extractionLevel = 1;
            }
        }
        this.EnsureAssignment('Harvester', CT_Harvester, extractionLevel,
            isMyRoom ? Priority_High : Priority_Medium, CJ_Harvester, TT_Harvest, this.memory.sourceID);
        if (this.memory.needsInfrastructureBoot) {
            let path;
            if (this.memory.targetRoom != this.memory.homeRoom) {
                if (targetRoom) {
                    let source = Game.getObjectById(this.memory.sourceID) as Source;
                    // (TODO): Incomplete.  Need to figure out how to create the road in other rooms.
                }
            } else {
                let source = Game.getObjectById(this.memory.sourceID) as Source;
                let spawn = source.pos.findClosestByPath(FIND_MY_SPAWNS);
                path = spawn.pos.findPathTo(source);
            }

            if (path) {
                let end = path[path.length - 2];
                targetRoom.createConstructionSite(end.x, end.y, STRUCTURE_CONTAINER);
                for (let i = 1; i < path.length - 2; i++) {
                    targetRoom.createConstructionSite(path[i].x, path[i].y, STRUCTURE_ROAD);
                }
            }

            delete this.memory.needsInfrastructureBoot;
        }
    }
}