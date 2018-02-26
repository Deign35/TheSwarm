import * as _ from "lodash";
import * as SwarmCodes from "Consts/SwarmCodes";
import { ImperatorBase } from "Imperators/ImperatorBase";
import { MoveToPositionAction } from "Actions/MoveToPositionAction";
import { ActionBase } from "Actions/ActionBase";
import { HarvestAction } from "Actions/HarvestAction";
import { BuildAction } from "Actions/BuildAction";

const CONSUL_TYPE = 'H_Consul';
export class BootstrapImperator extends ImperatorBase {
    ActivateCreep(creep: CreepConsul_Data): SwarmCodes.SwarmlingResponse {
        throw new Error("Method not implemented.");
    }

    // Activate temp worker as a different function
    // temp worker can try to withdraw from the container first.
    ActivateHarvester(data: HarvestConsul_SourceData, harvester: Creep) {
        if (harvester.spawning) { return; }
        let sourceTarget = Game.getObjectById(data.sourceID) as Source;
        let moveTarget = (Game.getObjectById(data.constructionSite || data.containerID) as RoomObject);
        if (moveTarget) {
            if (!harvester.pos.isEqualTo(moveTarget.pos)) {
                new MoveToPositionAction(harvester, moveTarget.pos).Run(true);
                return;
            }
        }

        let harvestAction: ActionBase = new HarvestAction(harvester, sourceTarget);
        // Do a container check, where if it exists, do an express version that doesn't go through this logic.
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
                if (data.creepName == harvester.name) {
                    if (data.constructionSite) {
                        harvestAction = new BuildAction(harvester, Game.getObjectById(data.constructionSite) as ConstructionSite);
                    }
                }
                break; // Creep's carry is full
            case (SwarmCodes.E_TARGET_INELLIGIBLE): break; // Target is empty.
            case (SwarmCodes.C_MOVE):
                if (!moveTarget) {
                    new MoveToPositionAction(harvester, sourceTarget.pos).Run(true);
                }
                break;
        }

        if (harvestResult != SwarmCodes.C_MOVE) {
            harvestResult = harvestAction.Run();
            // Dont care about the result
        }
    }
}