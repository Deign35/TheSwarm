import * as SwarmCodes from "Consts/SwarmCodes";
import { ImperatorBase } from "Imperators/ImperatorBase";
import { HarvestConsul } from "Consuls/HarvestConsul";
import { HarvestAction } from "Actions/HarvestAction";
import { MoveToPositionAction } from "Actions/MoveToPositionAction";

export class HarvestImperator extends ImperatorBase {
    Consul!: HarvestConsul;
    AssignCreep(creepName: string): void {
        let result = this.Consul.AssignCreepToSource(creepName);
        if (result == SwarmCodes.E_MISSING_TARGET) {
            this.ReleaseCreep(creepName, 'No jobs available'); // Then make it supplement an open spot or so?
        }
    }

    ReleaseCreep(creepName: string, releaseReason: string) {
        // This should be to give the harvester creep back to the queen.
        this.Consul.ReleaseCreep(creepName);
    }

    InitImperator(memoryHandle: string): void {
        this.Consul = new HarvestConsul(memoryHandle, this.Queen);
        if (this.Consul.RefinementRequired && Game.time % 1000) {
            this.Consul.SnapshotData();
            try {
                this.Consul.RefineSourceData();
                this.Consul.ResetSnapshotData();
            } catch {
                this.Consul.ReloadSnapshot(true);
            }
        }
    }

    ActivateImperator(): SwarmCodes.SwarmErrors {
        let requirements = this.Consul.DetermineRequirements();
        // Request hive harvesters from the nestqueen.
        let sourceData = this.Consul.SourceData;
        for (let i = 0, length = this.Consul.SourceData.length; i < length; i++) {
            let data = this.Consul.SourceData[i];
            if (!data.harvester) continue;
            let harvester = Game.creeps[data.harvester];
            if (!harvester) {
                // update the consul,
                continue;
            }

            let sourceTarget = Game.getObjectById(data.id) as Source;
            let harvestAction = new HarvestAction(harvester, sourceTarget);
            let harvestResult = harvestAction.ValidateAction();
            switch (harvestResult) {
                case (SwarmCodes.C_NONE):
                    if (!data.constructionSite && !data.containerID) {
                        harvester.room.createConstructionSite(harvester.pos, STRUCTURE_CONTAINER);
                    }
                    break;
                case (SwarmCodes.E_ACTION_UNNECESSARY): break; // Creep's carry is full
                case (SwarmCodes.E_TARGET_INELLIGIBLE): break; // Target is empty.
                case (SwarmCodes.C_MOVE):
                    let targetPos = sourceTarget.pos;
                    if (data.constructionSite || data.containerID) {
                        let targetStruct = (Game.getObjectById(data.constructionSite) ||
                            Game.getObjectById(data.containerID)) as ConstructionSite | StructureContainer;
                        if (targetStruct) {
                            targetPos = targetStruct.pos;
                        }
                    }
                    new MoveToPositionAction(harvester, targetPos).Run(true);
                    break;
            }

            if (harvestResult != SwarmCodes.C_MOVE) {
                harvestResult = harvestAction.Run();
                // Dont care about the result
            }
        }

        return SwarmCodes.C_NONE; // unused
    }

    ImperatorComplete(): void {
        this.Consul.Save();
    }
}