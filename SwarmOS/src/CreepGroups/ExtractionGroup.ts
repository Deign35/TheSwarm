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
        let curState = this.GetAssignmentState('Hauler');
        switch (curState) {
            case (JobState_Inactive):
                if (!this.AssignmentHasValidTarget('Hauler')) {
                    // Get a new Target for refilling
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

                    if (nextTarget) {
                        this.SetAssignmentTarget('Hauler', nextTarget);
                    }
                }
                this.StartAssignmentIfInactive('Hauler');
                break;
            default:
                break;
        }
        let extractionLevel = 0;
        if (spawnRoom.energyCapacityAvailable >= 800) {
            extractionLevel = 2;
        } else if (spawnRoom.energyCapacityAvailable >= 550) {
            extractionLevel = 1;
        }

        for (let i = 0; i < viewData.sourceIDs.length; i++) {
            let context: AssignmentContext_Harvester = {
                pri: Priority_Medium,
                tar: viewData.sourceIDs[i],
                res: true
            }
            this.EnsureAssignment(viewData.sourceIDs[i], CT_Harvester, extractionLevel, Priority_High, CJ_Harvester);
            let curState = this.GetAssignmentState(viewData.sourceIDs[i]);
            switch (curState) {
                case (JobState_Inactive):
                    this.SetAssignmentTarget(viewData.sourceIDs[i], Game.getObjectById(viewData.sourceIDs[i]) as Source);
                    this.StartAssignmentIfInactive(viewData.sourceIDs[i]);
            }
        }
    }
    protected get GroupPrefix(): string { return 'Extr'; }
}