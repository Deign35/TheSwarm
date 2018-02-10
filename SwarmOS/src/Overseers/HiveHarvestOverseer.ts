import { OverseerBase } from "Overseers/OverseerBase";
import { HiveQueen } from "Managers/HiveQueen";
import * as SwarmEnums from "SwarmEnums";
import { HarvestAction } from "Actions/HarvestAction";
import { MoveToPositionAction } from "Actions/MoveToPositionAction";
import { ActionBase } from "Actions/ActionBase";
import { BuildAction } from "Actions/BuildAction";
import { RepairAction } from "Actions/RepairAction";
import { DropAction } from "Actions/DropAction";

const NODE_DATA = 'ND';
export class HiveHarvestOverseer extends OverseerBase {
    Hive: Room;
    protected SourceNodes: { creepID: string, sourceID: string, containerID?: string, constructionSiteID?: string }[];
    protected NodeObjects: { creep?: Creep, source: Source, container?: StructureContainer, constructionSite?: ConstructionSite }[];
    constructor(id: string, parent: HiveQueen) {
        super(id, parent);
        if (this.SourceNodes.length == 0) {
            // Probably better to put this where the overseer is created instead of the constructor;
            let foundSources = this.Hive.find(FIND_SOURCES);
            for (let index in foundSources) {
                let foundSource = foundSources[index];
                let newNode = { creepID: '', sourceID: foundSource.id, containerID: undefined as string | undefined, constructionSiteID: undefined as string | undefined };
                this.SourceNodes.push(this.UpdateNodeData(newNode, foundSource));
            }
        }
    }

    Save() {
        this.SetData(NODE_DATA, this.SourceNodes);
        super.Save();
    }
    Load() {
        super.Load();
        this.Hive = Game.rooms[this.ParentMemoryID];
        this.SourceNodes = this.GetData(NODE_DATA) || [];
    }

    InitOverseerRegistry() {
        let registry = OverseerBase.CreateEmptyOverseerRegistry();
        for (let i = 0, length = this.NodeObjects.length; i < length; i++) {
            if (!this.NodeObjects[i].creep) {
                registry.Requirements.Creeps.push({
                    time: 0,
                    creepBody: {
                        min: [WORK, CARRY, MOVE],
                        mid: [WORK, CARRY, MOVE, WORK, MOVE],
                        best: this.NodeObjects[i].container ?
                            [WORK, WORK, WORK, WORK, WORK, WORK, MOVE] :
                            [WORK, WORK, WORK, WORK, WORK, WORK, CARRY, MOVE]
                    }
                });
            }
            if (this.NodeObjects[i].container != undefined) {
                registry.Available.Resources.push({ location: (this.NodeObjects[i].container as StructureContainer), amount: (this.NodeObjects[i].container as StructureContainer).store.energy })
            }
        }

        return registry;
    }
    HasResources(): boolean { return true; } // It's just easier for now...

    HasRequirements(): boolean {
        for (let i = 0, length = this.NodeObjects.length; i < length; i++) {
            if (!this.NodeObjects[i].creep) {
                return true;
            }
        }

        return false;
    }

    ValidateOverseer() {
        if (!this.Hive.controller || !this.Hive.controller.my || !(this.Hive.controller.level >= 3)) {
            // do boot strapper instead.
        } else {
            for (let index in this.SourceNodes) {
                let newNodeObj: { creep?: Creep, source: Source, container?: StructureContainer, constructionSite?: ConstructionSite };
                newNodeObj = { creep: undefined, source: Game.getObjectById(this.SourceNodes[index].sourceID) as Source, container: undefined, constructionSite: undefined }

                if (this.SourceNodes[index].creepID) {
                    newNodeObj.creep = Game.getObjectById(this.SourceNodes[index].creepID) as Creep;
                }
                if (!newNodeObj.creep) {
                    this.ReleaseCreep(this.SourceNodes[index].creepID, 'Dead creep');
                }
                if (!this.SourceNodes[index].containerID) {
                    this.SourceNodes[index] = this.UpdateNodeData(this.SourceNodes[index]);
                }
                if (this.SourceNodes[index].constructionSiteID) {
                    newNodeObj.constructionSite = Game.getObjectById(this.SourceNodes[index].constructionSiteID) as ConstructionSite;
                    if (!newNodeObj.constructionSite) { delete this.SourceNodes[index].constructionSiteID; }
                }
                if (this.SourceNodes[index].containerID) {
                    newNodeObj.container = Game.getObjectById(this.SourceNodes[index].containerID) as StructureContainer;
                    if (!newNodeObj.container) { delete this.SourceNodes[index].containerID; }
                }

                /*if(this.SourceNodes[index].containerID && !newNodeObj.container) {
                    // The container disappeared.
                }*/

                this.NodeObjects.push(newNodeObj);
            }
        }
    }
    ActivateOverseer() {
        for (let index in this.SourceNodes) {
            if (!this.NodeObjects[index].creep) {
                continue;
            }
            let creep = this.NodeObjects[index].creep as Creep;
            let constructionSite = this.NodeObjects[index].constructionSite as ConstructionSite;
            let container = this.NodeObjects[index].container as StructureContainer;

            let action: ActionBase | undefined;
            if (creep.carry.energy > 0) {
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
                primaryResponse = action.Run();
            }

            if (primaryResponse == SwarmEnums.CRT_Next || primaryResponse == SwarmEnums.CRT_None) {
                action = new HarvestAction(this.NodeObjects[index].creep as Creep, this.NodeObjects[index].source);
            } else {
                // Means we had to do some other action, and it was not a completed task.
                return;
            }
            let validation = action.ValidateAction();
            let harvestResult = SwarmEnums.CRT_None;
            switch (validation) {
                case (SwarmEnums.CRT_Next): break; // We're full
                case (SwarmEnums.CRT_NewTarget): break; // Source is empty
                case (SwarmEnums.CRT_None): // Good to harvest.
                    harvestResult = action.Run(false);
            }
            // Check if harvest worked
            switch (harvestResult) {
                case (SwarmEnums.CRT_None): console.log("THIS IS NOT POSSIBLE"); break; // Unless we haven't fixed Next/NewTarget above.
                case (SwarmEnums.CRT_Condition_Full):
                    if (creep) {

                    };
                    break; //Means we successfully harvested.
                case (SwarmEnums.CRT_NewTarget): break; // The source is empty.  Just wait.
                case (SwarmEnums.CRT_Move):
                    let targetPos = this.NodeObjects[index].source.pos;
                    if (container) {
                        targetPos = container.pos;
                    }
                    if (constructionSite) {
                        targetPos = constructionSite.pos;
                    }
                    let moveAction = new MoveToPositionAction(creep, targetPos);
                    if (moveAction.Run() == SwarmEnums.CRT_Next) {
                        // we've made it to the desired position.  Won't happen unless there's a container
                    }
                    break; // Did not harvest, needed to move.
            }

            // Do something with primaryResponse?
        }
    }
    ReleaseCreep(name: string, releaseReason: string) { }

    private UpdateNodeData(nodeInfo: { creepID: string, sourceID: string, containerID?: string, constructionSiteID?: string }, source?: Source) {
        if (!source) {
            source = Game.getObjectById(nodeInfo.sourceID) as Source;
        }
        let foundStructures = this.Hive.lookForAtArea(LOOK_STRUCTURES, source.pos.x - 1, source.pos.y - 1, source.pos.x + 1, source.pos.y + 1, true);
        if (foundStructures.length > 0) {
            for (let i in foundStructures) {
                if ((foundStructures[i].structure as Structure).structureType == STRUCTURE_CONTAINER) {
                    nodeInfo.containerID = (foundStructures[i].structure as Structure).id;
                }
            }
        } else {
            let foundCSites = this.Hive.lookForAtArea(LOOK_CONSTRUCTION_SITES, source.pos.x - 1, source.pos.y - 1, source.pos.x + 1, source.pos.y + 1, true);
            if (foundCSites.length > 0) {
                for (let i in foundCSites) {
                    if ((foundCSites[i].constructionSite as ConstructionSite).structureType == STRUCTURE_CONTAINER) {
                        nodeInfo.constructionSiteID = (foundCSites[i].constructionSite as ConstructionSite).id;
                    }
                }
            } else {
                //Look for a flag or build it myself?
            }
        }

        return nodeInfo;
    }
}