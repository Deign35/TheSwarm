import { BasicCreepGroup } from "./BasicCreepGroup";

declare interface UnitDef { unit?: PID, lvl: number }
declare interface Formation_ExtractionUnit {
    harv: UnitDef;
}
declare interface ExtractionUnit {
    target: ObjectID;
    harv?: GroupID;
}
declare interface ExtractionGroup_Memory extends CreepGroup_Memory {
    targetGroups: { [id: string]: ExtractionUnit }; // Source or Mineral
    haul?: UnitDef;
}
class ExtractionGroup extends BasicCreepGroup<ExtractionGroup_Memory> {
    protected EnsureGroupFormation(): void {
        let viewData = this.View.GetRoomData(this.memory.targetRoom)!;

        let room = Game.rooms[this.memory.homeRoom];
        if (viewData.owner && viewData.owner == MY_USERNAME) {
            room = Game.rooms[this.memory.targetRoom];
        }

        let extractionLevel = 0;
        if (room.energyCapacityAvailable >= 800) {
            extractionLevel = 2;
        } else if (room.energyCapacityAvailable >= 550) {
            extractionLevel = 1;
        }

        for (let i = 0; i < viewData.sourceIDs.length; i++) {
            let targetID = viewData.sourceIDs[i];
            if (!this.memory.targetGroups[targetID]) {
                this.createNewAssignment(targetID, CT_Harvester, extractionLevel);
            }

            let childSR = this.spawnRegistry.getRequestContext(this.assignments[targetID].SR);
            if (!childSR) {
                this.createNewCreepProcess(targetID);
                childSR = this.spawnRegistry.getRequestContext(this.assignments[targetID].SR);
                if (!childSR) {
                    throw new Error(`Restarting of creep thread failed.`);
                }
            }

            if (childSR.l != extractionLevel) {
                this.assignments[targetID].lvl = extractionLevel;
                this.createNewCreepProcess(targetID);
            }
        }
    }
    protected get GroupPrefix(): string { return 'Extr'; }
}