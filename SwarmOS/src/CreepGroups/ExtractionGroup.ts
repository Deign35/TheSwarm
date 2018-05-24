import { BasicCreepGroup } from "./BasicCreepGroup";

export const OSPackage: IPackage<SpawnRegistry_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(CG_Extraction, ExtractionGroup);
    }
}

class ExtractionGroup extends BasicCreepGroup<ExtractionGroup_Memory> {
    protected EnsureGroupFormation(): void {
        let viewData = this.View.GetRoomData(this.memory.targetRoom)!;

        let spawnRoom = Game.rooms[this.memory.homeRoom];
        if (viewData.owner && viewData.owner == MY_USERNAME) {
            spawnRoom = Game.rooms[this.memory.targetRoom];
        }

        this.EnsureAssignment('Hauler', CT_Refiller, spawnRoom.controller!.level > 1 ? 1 : 0, Priority_High, CJ_Refiller);
        let extractionLevel = 0;
        if (spawnRoom.energyCapacityAvailable >= 800) {
            extractionLevel = 2;
        } else if (spawnRoom.energyCapacityAvailable >= 550) {
            extractionLevel = 1;
        }

        for (let i = 0; i < viewData.sourceIDs.length; i++) {
            this.EnsureAssignment(viewData.sourceIDs[i], CT_Harvester, extractionLevel, Priority_High, CJ_Harvester);
        }
    }
    protected GetNewTarget(assignmentID: string): string {
        debugger;
        let viewData = this.View.GetRoomData(this.memory.targetRoom)!;
        switch (assignmentID) {
            case ('Hauler'):// Get a new Target for refilling
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
                return nextTarget ? nextTarget.id : '';
            default:
                return assignmentID;
        }
    }
}