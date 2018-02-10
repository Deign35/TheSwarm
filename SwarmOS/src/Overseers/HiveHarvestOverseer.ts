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
    SourceNodes: { creepID: string, sourceID: string, containerID?: string, constructionSiteID?: string }[];
    protected NodeObjects: { creep?: Creep, source: Source, container?: StructureContainer, constructionSite?: ConstructionSite }[];

    constructor(id: string, parent: HiveQueen) {
        super(id, parent);
        if(this.SourceNodes.length == 0) { // Probably better to put this where the overseer is created instead of the constructor;
            let foundSources = this.Hive.find(FIND_SOURCES);
            for(let index in foundSources) {
                let foundSource = foundSources[index];
                let newNode = { creepID: '', sourceID: foundSource.id, containerID: undefined as string | undefined, constructionSiteID: undefined as string | undefined};
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
    // This overseer will focus on harvesting the sources
    // of the hive at 100% efficiency.
    ValidateOverseer(): SwarmEnums.CommandResponseType {
        let result: SwarmEnums.CommandResponseType = SwarmEnums.CRT_None;
        if(!this.Hive.controller || !this.Hive.controller.my || !(this.Hive.controller.level >= 3)) {
            result = SwarmEnums.CRT_None; // Do not engage!
        } else {
            for(let index in this.SourceNodes) {
                let newNodeObj: { creep?: Creep, source:Source, container?: StructureContainer, constructionSite?: ConstructionSite };
                newNodeObj = {creep: undefined, source: Game.getObjectById(this.SourceNodes[index].sourceID) as Source, container: undefined, constructionSite: undefined}

                if(this.SourceNodes[index].creepID) {
                    newNodeObj.creep = Game.getObjectById(this.SourceNodes[index].creepID) as Creep;
                }
                if(!newNodeObj.creep) {
                    result = SwarmEnums.CRT_Requires_Creep;
                }
                if(!this.SourceNodes[index].containerID) { // Frequency check here?
                    this.SourceNodes[index] = this.UpdateNodeData(this.SourceNodes[index]);
                }
                if(this.SourceNodes[index].constructionSiteID) {
                    newNodeObj.constructionSite = Game.getObjectById(this.SourceNodes[index].constructionSiteID) as ConstructionSite;
                }
                if(this.SourceNodes[index].containerID) {
                    newNodeObj.container = Game.getObjectById(this.SourceNodes[index].containerID) as StructureContainer;
                }

                /*if(this.SourceNodes[index].containerID && !newNodeObj.container) {
                    // The container disappeared.
                }*/

                this.NodeObjects.push(newNodeObj);
            }
        }

        return result;
    }
    ActivateOverseer(): SwarmEnums.CommandResponseType {
        for(let index in this.SourceNodes) {
            if(!this.NodeObjects[index].creep) {
                continue;
            }

            let primaryAction: ActionBase | undefined;
            if((this.NodeObjects[index].creep as Creep).carry.energy > 0) {
                if(this.NodeObjects[index].constructionSite) {
                    // Build it
                    primaryAction = new BuildAction(this.NodeObjects[index].creep as Creep, this.NodeObjects[index].constructionSite as ConstructionSite);
                } else if(this.NodeObjects[index].container) {
                    if((this.NodeObjects[index].container as StructureContainer).hits < (this.NodeObjects[index].container as StructureContainer).hitsMax) {
                        // Repair it
                        primaryAction = new RepairAction(this.NodeObjects[index].creep as Creep, this.NodeObjects[index].container as StructureContainer);
                    } else {
                        primaryAction = new DropAction(this.NodeObjects[index].creep as Creep, (this.NodeObjects[index].container as StructureContainer).pos, RESOURCE_ENERGY);
                    }
                }
            }

            let primaryResponse: SwarmEnums.CommandResponseType = SwarmEnums.CRT_None;
            if(primaryAction && primaryAction.ValidateAction() == SwarmEnums.CRT_None) {
                primaryResponse = primaryAction.Run();
            }

            if(primaryResponse == SwarmEnums.CRT_Next || primaryResponse == SwarmEnums.CRT_None) {
                primaryAction = new HarvestAction(this.NodeObjects[index].creep as Creep, this.NodeObjects[index].source);
            } else {
                // Means we had to do some other action, and it was not a completed task.
                return primaryResponse;
            }
            let validation = primaryAction.ValidateAction();
            primaryResponse = SwarmEnums.CRT_None;
            switch(validation) {
                case(SwarmEnums.CRT_Next): break; // We're full
                case(SwarmEnums.CRT_NewTarget): break; // Source is empty
                case(SwarmEnums.CRT_None): // Good to harvest.
                    primaryResponse = primaryAction.Run(false);
            }
            // Check if harvest worked
            switch(primaryResponse) {
                case(SwarmEnums.CRT_None): console.log("THIS IS NOT POSSIBLE"); break; // Unless we haven't fixed Next/NewTarget above.
                case(SwarmEnums.CRT_Condition_Full): break; //Means we successfully harvested.
                case(SwarmEnums.CRT_NewTarget): break; // The source is empty.  Just wait.
                case(SwarmEnums.CRT_Move):
                    let targetPos = this.NodeObjects[index].container ? (this.NodeObjects[index].container as Structure).pos : this.NodeObjects[index].source.pos;
                    let moveAction = new MoveToPositionAction(this.NodeObjects[index].creep as Creep, targetPos);
                    if(moveAction.Run() == SwarmEnums.CRT_Next) {
                        // we've made it to the desired position.
                    }
                    break; // Did not harvest, needed to move.
            }

            // Do something with primaryResponse?
        }
        return SwarmEnums.CRT_None;
    }
    GetRequirements() {
        // Informs of the need for replacement creeps or more deliverers to drain the container faster.
        throw new Error("Method not implemented.");
    }
    GetAvailable() {
        let availableResources = { energy: 0 };
        for(let i = 0, length = this.NodeObjects.length; i< length; i++) {
            if(this.NodeObjects[i].container && (this.NodeObjects[i].container as StructureContainer).store.energy) {
                availableResources.energy += (this.NodeObjects[i].container as StructureContainer).store.energy;
            }
            if(this.NodeObjects[i].creep) {
                availableResources.energy += (this.NodeObjects[i].creep as Creep).carry.energy;
            }
        }

        return availableResources;
    }
    GetRequestedSpawnBody() {
        for(let i = 0, length = this.SourceNodes.length; i < length; i++) {
            if(this.NodeObjects[i].creep) {
                continue;
            }

            if(this.NodeObjects[i].container) {
                // has a container;
                return [MOVE, WORK, WORK, WORK, WORK, WORK, WORK];
            }

            // No container, must carry.
            return [MOVE, CARRY, WORK, WORK, WORK, WORK, WORK, WORK];
        }

        return [];
    }

    private UpdateNodeData(nodeInfo: { creepID: string, sourceID: string, containerID?: string, constructionSiteID?: string }, source?: Source ) {
        if(!source) {
            source = Game.getObjectById(nodeInfo.sourceID) as Source;
        }
        let foundStructures = this.Hive.lookForAtArea(LOOK_STRUCTURES, source.pos.x - 1, source.pos.y - 1, source.pos.x + 1, source.pos.y + 1, true);
        if(foundStructures.length > 0) {
            for(let i in foundStructures) {
                if((foundStructures[i].structure as Structure).structureType == STRUCTURE_CONTAINER) {
                    nodeInfo.containerID = (foundStructures[i].structure as Structure).id;
                }
            }
        } else {
            let foundCSites = this.Hive.lookForAtArea(LOOK_CONSTRUCTION_SITES, source.pos.x - 1, source.pos.y - 1, source.pos.x + 1, source.pos.y + 1, true);
            if(foundCSites.length > 0) {
                for(let i in foundCSites) {
                    if((foundCSites[i].constructionSite as ConstructionSite).structureType == STRUCTURE_CONTAINER) {
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