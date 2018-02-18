import * as SwarmCodes from "Consts/SwarmCodes";
import { ImperatorBase } from "Imperators/ImperatorBase";
import { HarvestConsul } from "Consuls/HarvestConsul";
import { HarvestAction } from "Actions/HarvestAction";
import { MoveToPositionAction } from "Actions/MoveToPositionAction";
import { RepairAction } from "Actions/RepairAction";
import { BuildAction } from "Actions/BuildAction";
import { ActionBase } from "Actions/ActionBase";

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
        this.Consul.ScanRoom();
    }

    ActivateImperator(): SwarmCodes.SwarmErrors {
        // Request hive harvesters from the nestqueen.
        let sourceData = this.Consul.SourceData;
        for (let i = 0, length = this.Consul.SourceData.length; i < length; i++) {
            let data = this.Consul.SourceData[i];
            if (!data.harvester) continue;
            let harvester = Game.creeps[data.harvester];
            if (!harvester) {
                // update the consul?
                continue;
            }

            let sourceTarget = Game.getObjectById(data.id) as Source;
            let harvestAction: ActionBase = new HarvestAction(harvester, sourceTarget);
            let harvestResult = harvestAction.ValidateAction();
            switch (harvestResult) {
                case (SwarmCodes.C_NONE):
                    if (!data.constructionSite && !data.containerID) {
                        let foundCS = harvester.pos.lookFor(LOOK_CONSTRUCTION_SITES);
                        if (foundCS && foundCS.length > 0) {
                            if ((foundCS[0] as ConstructionSite).structureType == STRUCTURE_CONTAINER) {
                                data.constructionSite = (foundCS[0] as ConstructionSite).id;
                            }
                        } else {
                            let foundS = harvester.pos.lookFor(LOOK_STRUCTURES);
                            if (foundS && foundS.length > 0 && (foundS[0] as Structure).structureType == STRUCTURE_CONTAINER) {
                                data.containerID = (foundS[0] as StructureContainer).id;
                            } else {
                                harvester.room.createConstructionSite(harvester.pos, STRUCTURE_CONTAINER);
                            }
                        }
                    }
                    break;
                case (SwarmCodes.E_ACTION_UNNECESSARY):
                    if (data.constructionSite) {
                        harvestAction = new BuildAction(harvester, Game.getObjectById(data.constructionSite) as ConstructionSite);
                    } else if (data.containerID) {
                        let container = Game.getObjectById(data.containerID) as StructureContainer;
                        if (container.hits < container.hitsMax) {
                            harvestAction = new RepairAction(harvester, container);
                        }
                    }
                    break; // Creep's carry is full
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