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
        this.EnsureAssignment('Hauler', CT_Refiller, spawnRoom.controller!.level > 1 ? 1 : 0, {
            pri: Priority_High,
            res: true
        });

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
            this.EnsureAssignment(viewData.sourceIDs[i], CT_Harvester, extractionLevel, context);
        }
    }
    protected get GroupPrefix(): string { return 'Extr'; }
}