import { BasicCreepGroup } from "./BasicCreepGroup";

export const OSPackage: IPackage<SpawnRegistry_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(CG_Extraction, ExtractionGroup);
    }
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
            if (!this.assignments[targetID]) {
                let newAssignment: CreepGroup_Assignment = {
                    CT: CT_Harvester,
                    lvl: extractionLevel,
                    SR: '',
                    GR: '',
                    con: {
                        tar: targetID
                    }
                }
                this.assignments[targetID] = newAssignment;
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