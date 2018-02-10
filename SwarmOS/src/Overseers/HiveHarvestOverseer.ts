import { OverseerBase } from "Overseers/OverseerBase";
import { HiveQueen } from "Managers/HiveQueen";
import * as SwarmEnums from "SwarmEnums";
import { HarvestAction } from "Actions/HarvestAction";

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

            let harvestAction = new HarvestAction(this.NodeObjects[index].creep as Creep, this.NodeObjects[index].source);
            harvestAction.ValidateAction();
        }
        return SwarmEnums.CRT_None;
    }
    GetRequirements() {
        throw new Error("Method not implemented.");
    }
    GetAvailable() {
        throw new Error("Method not implemented.");
    }
    GetRequestedSpawnBody() {
        throw new Error("Method not implemented.");
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