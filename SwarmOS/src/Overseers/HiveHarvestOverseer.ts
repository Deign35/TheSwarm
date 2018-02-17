import * as SwarmCodes from "Consts/SwarmCodes";
import { OverseerBase } from "Overseers/OverseerBase";
import { ActionBase } from "Actions/ActionBase";
import { HarvestConsul } from "Consuls/HarvestConsul";

const CONSUL_DATA = 'ConsulData';
export class HiveHarvestOverseer extends OverseerBase {
    Consul!: HarvestConsul;
    InitNewOverseer(): void {
        // Request a harvester for each source.
    }

    Save() {
        this.Consul.Save();
        super.Save();
    }

    Load() {
        if (!super.Load()) { throw 'Unable to load Harvest Overseer for: ' + this.Hive.name }
        this.Consul = new HarvestConsul(CONSUL_DATA, this);
        return true;
    }

    ValidateOverseer() {
        if (Game.time % 100 == 65) {
            this.Consul.ScanRoom();

        }
    }

    ActivateOverseer() {
        for (let index in this.NodeObjects) {
            if (!this.NodeObjects[index].creep || (this.NodeObjects[index].creep as Creep).spawning) {
                continue;
            }
            let creep = this.NodeObjects[index].creep as Creep;
            let constructionSite = this.NodeObjects[index].constructionSite as ConstructionSite;
            let container = this.NodeObjects[index].container as StructureContainer;

            let action: ActionBase | undefined;
            if (creep.carryCapacity > 0 && creep.carry.energy * 2 > creep.carryCapacity) {
                if (constructionSite) {
                    // Build it
                    action = new BuildAction(creep, constructionSite);
                } else if (container) {
                    if (container.hits < container.hitsMax) {
                        // Repair it
                        action = new RepairAction(creep, container);
                    } else {
                        action = new DropAction(creep, container.pos, RESOURCE_ENERGY);
                    }
                }
                let suplementalActionResponse: SwarmCodes.SwarmlingResponse = SwarmCodes.C_NONE;
                if (action && action.ValidateAction() == SwarmCodes.C_NONE) {
                    suplementalActionResponse = action.Run(false);
                    //Need to do some validation here maybe?
                    // if successful, should just exit now.
                }
            } else if (creep.carryCapacity == 0) {
                let targetPos = this.NodeObjects[index].source.pos;
                if (container) {
                    targetPos = container.pos;
                } else if (constructionSite) {
                    targetPos = constructionSite.pos;
                }
                action = new MoveToPositionAction(creep, targetPos);
                action.Run();
            }



            action = new HarvestAction(this.NodeObjects[index].creep as Creep, this.NodeObjects[index].source);

            action.ValidateAction();
            let harvestResult = action.Run(true);
            // Check if harvest worked
            switch (harvestResult) {
                case (SwarmCodes.C_NONE):
                case (SwarmCodes.E_TARGET_INELLIGIBLE): break; // The source is empty.  Just wait.
                default: console.log('FAILED ACTION[HiveHarvestOverseer] -- ' + harvestResult);
            }
        }
    }

    AssignCreep(creepName: string): void {
        for (let i = 0, length = this.NodeObjects.length; i < length; i++) {
            if (!this.NodeObjects[i].creep) {
                this.SourceNodes[i].creepName = creepName;
                break;
            }
        }
    }

    ReleaseCreep(creepName: string, releaseReason: string) {
        for (let i = 0, length = this.SourceNodes.length; i < length; i++) {
            if (this.SourceNodes[i].creepName == creepName) {
                delete this.SourceNodes[i].creepName;
                break;
            }
        }
    }

    private UpdateNodeData(nodeInfo: { creepID?: string, sourceID: string, containerID?: string, constructionSiteID?: string }, source?: Source) {
        if (!source) {
            source = Game.getObjectById(nodeInfo.sourceID) as Source;
        }
        let foundStructures = this.Hive.lookForAtArea(LOOK_STRUCTURES, source.pos.y - 1, source.pos.x - 1, source.pos.y + 1, source.pos.x + 1, true);
        if (foundStructures.length > 0) {
            for (let i in foundStructures) {
                if ((foundStructures[i].structure as Structure).structureType == STRUCTURE_CONTAINER) {
                    nodeInfo.containerID = (foundStructures[i].structure as Structure).id;
                }
            }
        }
        if (!nodeInfo.containerID) {
            let foundCSites = this.Hive.lookForAtArea(LOOK_CONSTRUCTION_SITES, source.pos.y - 1, source.pos.x - 1, source.pos.y + 1, source.pos.x + 1, true);
            if (foundCSites.length > 0) {
                for (let i in foundCSites) {
                    if ((foundCSites[i].constructionSite as ConstructionSite).structureType == STRUCTURE_CONTAINER) {
                        nodeInfo.constructionSiteID = (foundCSites[i].constructionSite as ConstructionSite).id;
                    }
                }
            }
        }

        return nodeInfo;
    }
}