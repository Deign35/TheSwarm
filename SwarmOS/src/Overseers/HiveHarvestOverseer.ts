import * as SwarmCodes from "Consts/SwarmCodes";
import { OverseerBase } from "Overseers/OverseerBase";
import { ActionBase } from "Actions/ActionBase";
import { HarvestConsul } from "Consuls/HarvestConsul";
import { HarvestAction } from "Actions/HarvestAction";
import { MoveToPositionAction } from "Actions/MoveToPositionAction";

const CONSUL_DATA = 'ConsulData';
export class HiveHarvestOverseer extends OverseerBase {
    Consul!: HarvestConsul;
    InitMemory(): void {
        // Request a harvester for each source.
    }

    Save() {
        this.Consul.Save();
        super.Save();
    }

    Load() {
        if (!super.Load()) { return false; }
        this.Consul = new HarvestConsul(CONSUL_DATA, this);
        return true;
    }

    ValidateOverseer() {
        if (Game.time % 100 == 65) {
            this.Consul.ScanRoom();
        }
    }

    ActivateOverseer() {
        let requirements = this.Consul.DetermineRequirements();
        // Order hive harvesters from the nestqueen.
        let sourceData = this.Consul.SourceData;
        for(let i = 0, length = this.Consul.SourceData.length; i < length; i++) {
            let data = this.Consul.SourceData[i];
            if(!data.harvester) continue;
            let harvester = Game.creeps[data.harvester];
            if(!harvester) {
                // update the consul,
                continue;
            }

            let sourceTarget =  Game.getObjectById(data.id) as Source;
            let harvestAction = new HarvestAction(harvester, sourceTarget);
            let harvestValidation = harvestAction.ValidateAction();
            switch(harvestValidation) {
                case(SwarmCodes.C_NONE):
                    if(!data.constructionSite && !data.containerID) {
                        harvester.room.createConstructionSite(harvester.pos, STRUCTURE_CONTAINER);
                    }
                    break;
                case(SwarmCodes.E_ACTION_UNNECESSARY): break; // Creep's carry is full
                case(SwarmCodes.E_TARGET_INELLIGIBLE): break; // Target is empty.
                case(SwarmCodes.C_MOVE):
                    let targetPos = sourceTarget.pos;
                    if(data.constructionSite || data.containerID) {
                        let targetStruct = (Game.getObjectById(data.constructionSite) || Game.getObjectById(data.containerID)) as ConstructionSite | StructureContainer;
                        if(targetStruct) {
                            targetPos = targetStruct.pos;
                        }
                    }
                    new MoveToPositionAction(harvester, targetPos).Run(true);
                    break;
            }
        }
    }

    AssignCreep(creepName: string): void {
        let result = this.Consul.AssignCreepToSource(creepName);

        if(result == SwarmCodes.E_MISSING_TARGET) {
            this.ReleaseCreep(creepName, 'No jobs available');
        }
    }

    ReleaseCreep(creepName: string, releaseReason: string) {
        // This should be to give the harvester creep back to the queen.
        this.Consul.ReleaseCreep(creepName);
    }
}