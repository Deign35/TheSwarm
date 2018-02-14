import * as SwarmEnums from "SwarmEnums";
import * as _ from "lodash";
import * as SwarmConsts from "SwarmConsts";
import { OverseerBase } from "Overseers/OverseerBase";
import { ActionBase } from "Actions/ActionBase";
import { BuildAction } from "Actions/BuildAction";
import { RepairAction } from "Actions/RepairAction";
import { DropAction } from "Actions/DropAction";
import { HarvestAction } from "Actions/HarvestAction";
import { MoveToPositionAction } from "Actions/MoveToPositionAction";

const NODE_DATA = 'ND';
export class HiveHarvestOverseer extends OverseerBase {
    AssignOrder(orderID: string): boolean {
        throw new Error("Method not implemented.");
    }
    Hive!: Room;
    protected SourceNodes!: { creepName?: string, sourceID: string, containerID?: string, constructionSiteID?: string }[];
    protected NodeObjects!: { creep?: Creep, source: Source, container?: StructureContainer, constructionSite?: ConstructionSite }[];

    Save() {
        this.SetData(NODE_DATA, this.SourceNodes);
        super.Save();
    }

    Load() {
        super.Load();
        this.SourceNodes = this.GetData(NODE_DATA) || [];
        this.NodeObjects = [];
    }

    HasResources(): boolean { return true; } // It's just easier for now...

    ValidateOverseer() {
        let registry = OverseerBase.CreateEmptyOverseerRegistry();
        if (this.SourceNodes.length == 0) {
            // Probably better to put this where the overseer is created instead of the constructor;
            let foundSources = this.Hive.find(FIND_SOURCES);
            for (let index in foundSources) {
                let foundSource = foundSources[index];
                let newNode = { creepID: undefined as string | undefined, sourceID: foundSource.id, containerID: undefined as string | undefined, constructionSiteID: undefined as string | undefined };
                this.SourceNodes.push(this.UpdateNodeData(newNode, foundSource));
            }
        }

        for (let i = 0, length = this.SourceNodes.length; i < length; i++) {
            let newNodeObj: { creep?: Creep, source: Source, container?: StructureContainer, constructionSite?: ConstructionSite };
            newNodeObj = { source: Game.getObjectById(this.SourceNodes[i].sourceID) as Source }

            if (!this.SourceNodes[i].containerID) {
                this.SourceNodes[i] = this.UpdateNodeData(this.SourceNodes[i]);
            }

            if (this.SourceNodes[i].containerID) {
                newNodeObj.container = Game.getObjectById(this.SourceNodes[i].containerID as string) as StructureContainer;
                if (!newNodeObj.container) {
                    delete this.SourceNodes[i].containerID;
                } else {
                    registry.Available.Resources.push({ amount: newNodeObj.container.store.energy, type: RESOURCE_ENERGY, location: newNodeObj.container.pos });
                }
            }

            if (this.SourceNodes[i].creepName) {
                newNodeObj.creep = Game.creeps[this.SourceNodes[i].creepName as string];
                if (!newNodeObj.creep) {
                    // creep has died.
                    this.ReleaseCreep((this.SourceNodes[i].creepName as string), 'Dead creep');
                }
            }

            if (!newNodeObj.creep) { // || newNodeObj.creep.ticksToLive < SomeCalculatedValue) { // 100 to start with?
                registry.Requirements.Creeps.push({
                    time: 0, // Use this to request ahead of time.
                    creepBody: newNodeObj.container ? SwarmConsts.PRIME_HARVESTER : [WORK, WORK, WORK, WORK, CARRY, MOVE], // Check if bootstrapping?
                });
            }
            if (this.SourceNodes[i].constructionSiteID) {
                newNodeObj.constructionSite = Game.constructionSites[this.SourceNodes[i].constructionSiteID as string];
                if (!newNodeObj.constructionSite) {
                    delete this.SourceNodes[i].constructionSiteID;
                }
            }
            this.NodeObjects.push(newNodeObj);
        }

        this.Registry = registry;
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
            if (creep.carry.energy > creep.carryCapacity / 2) {
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
            }

            let primaryResponse: SwarmEnums.CommandResponseType = SwarmEnums.CRT_None;
            if (action && action.ValidateAction() == SwarmEnums.CRT_None) {
                primaryResponse = action.Run(false);
            }
            if (primaryResponse == SwarmEnums.CRT_Next || primaryResponse == SwarmEnums.CRT_None) {
                let targetPos = this.NodeObjects[index].source.pos;
                if (container) {
                    targetPos = container.pos;
                } else if (constructionSite) {
                    targetPos = constructionSite.pos;
                }

                if ((container && creep.pos.isEqualTo(targetPos)) ||
                    (!container && creep.pos.getRangeTo(targetPos) <= 1)) {
                    action = new HarvestAction(
                        this.NodeObjects[index].creep as Creep, this.NodeObjects[index].source);
                } else {
                    action = new MoveToPositionAction(creep, targetPos);
                }
            } else {
                // Means we had to do some other action, and it was not a completed task.
                return;
            }

            action.ValidateAction();
            let harvestResult = action.Run(true);
            // Check if harvest worked
            switch (harvestResult) {
                case (SwarmEnums.CRT_None): console.log("THIS IS NOT POSSIBLE"); break; // Unless we haven't fixed Next/NewTarget above.
                case (SwarmEnums.CRT_Condition_Full):
                    if (!constructionSite && !container) {
                        if (creep.pos.lookFor(LOOK_CONSTRUCTION_SITES).length == 0) {
                            //creep.room.createConstructionSite(creep.pos, STRUCTURE_CONTAINER);
                            this.Queen.ConstructionOverseer.CreateNewStructure(STRUCTURE_CONTAINER, creep.pos, 8);
                        }
                    }
                    break; //Means we successfully harvested.
                case (SwarmEnums.CRT_NewTarget): break; // The source is empty.  Just wait.
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