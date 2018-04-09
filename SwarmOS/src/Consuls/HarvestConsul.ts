import { SwarmConsulBase, ConsulObject } from "Consuls/ConsulBase";
import { SwarmSource, SwarmSite, SwarmRoomObject } from "SwarmTypes/SwarmRoomObjects";
import { MemoryBase } from "SwarmMemory/SwarmMemory";
import { SwarmLoader } from "SwarmTypes/SwarmLoader";
import { SwarmContainer, SwarmLink } from "SwarmTypes/SwarmStructures/SwarmStructure";
import { SwarmCreep } from "SwarmTypes/SwarmCreep";
import { SwarmRoom } from "SwarmTypes/SwarmRoom";
import { ActionBase, NoOpAction } from "Actions/ActionBase";
import { HarvestAction } from "Actions/HarvestAction";
import { MoveToPositionAction } from "Actions/MoveToPositionAction";
import { BuildAction } from "Actions/BuildAction";

declare type SOURCE_IDS = 'sourceIDs';
const SOURCE_IDS = 'sourceIDs';
declare interface HarvestConsulData {
    [SOURCE_IDS]: string[];
}

/*
declare type FLASH_SOURCE_DATA = 'SourceData';
const FLASH_SOURCE_DATA = 'SourceData';
declare interface SourceData {
    hasCreep: boolean;
    hasContainer: boolean;
    hasLink: boolean;
    hasPile: boolean;
    hasSite: boolean;
}
declare type FLASH_SOURCE_OBJECTS = 'SourceObjects';
const FLASH_SOURCE_OBJECTS = 'SourceObjects';
declare interface SourceObjectsData {
    container?: string
    creep?: string
    link?: string
    pile?: string
    site?: string
    source: SwarmSource
}

declare interface HarvestConsulFlashMemory {
    [FLASH_SOURCE_DATA]: IDictionary<SourceData>
    [FLASH_SOURCE_OBJECTS]: IDictionary<SourceObjectsData>
}*/

export class HarvestConsul extends SwarmConsulBase<ConsulType.Harvest>
    implements HarvestConsulData {
    get sourceIDs(): HarvestConsulData[SOURCE_IDS] {
        return this.memory.GetData(SOURCE_IDS);
    }/*
    get SourceData(): HarvestConsulFlashMemory[FLASH_SOURCE_DATA] {
        if (!this.memory.HasData(FLASH_SOURCE_DATA)) {
            this.memory.SetData(FLASH_SOURCE_DATA, {}, false);
        }
        return this.memory.GetData(FLASH_SOURCE_DATA);
    }
    get SourceObjects(): IDictionary<SwarmSource> {
        if (!this.memory.HasData(FLASH_SOURCE_OBJECTS)) {
            this.memory.SetData(FLASH_SOURCE_OBJECTS, {}, false);
        }
        return this.memory.GetData(FLASH_SOURCE_OBJECTS);
    }*/
    private SourceObjects: IDictionary<SwarmSource> = {};
    PrepObject() {
        let ids = this.sourceIDs;
        for (let i = 0; i < ids.length; i++) {
            if (!this.SourceObjects[ids[i]]) {
                let source = SwarmLoader.GetObject(ids[i], MASTER_ROOMOBJECT_MEMORY_ID) as SwarmSource;
                this.SourceObjects[ids[i]] = source;
            }

            this.SourceObjects[ids[i]].memory.ReserveMemory();
            this.SourceObjects[ids[i]].PrepObject();
            this.PrepSource(this.SourceObjects[ids[i]]);
        }
    }

    protected PrepSource(source: SwarmSource) {
        let canHaveLink = source.room.controller && source.room.controller.owner.username == MY_USERNAME && source.room.controller.level >= 5;
        let needsCSite = (canHaveLink && !source.linkID) || (!canHaveLink && !source.containerID);
        if (needsCSite && !source.constructionID && Game.time % 53 == 0) {
            // Check to see if there's no site, because it was finished building.
            let structures = source.pos.findInRange(FIND_STRUCTURES, canHaveLink ? 2 : 1, {
                filter: function (struct: Structure) {
                    return struct.structureType == STRUCTURE_LINK ||
                        (!source.containerID && struct.structureType == STRUCTURE_CONTAINER);
                }
            });
            if (structures.length > 0) {
                if (structures[0].structureType == STRUCTURE_CONTAINER) {
                    source.memory.SetData('containerID', structures[0].id, true);
                } else {
                    source.memory.SetData('linkID', structures[0].id, true);
                }
            }
            let cSites = source.pos.findInRange(FIND_CONSTRUCTION_SITES, canHaveLink ? 2 : 1, {
                filter: function (cSite: ConstructionSite) {
                    return cSite.structureType == STRUCTURE_LINK ||
                        (!source.containerID && cSite.structureType == STRUCTURE_CONTAINER);
                }
            });

            if (cSites.length > 0) {
                source.memory.SetData('constructionID', cSites[0].id, true);
            }
        }
        if (!source.pileID && Game.time % 23 == 0) {
            let nearbyResources = source.pos.findInRange(FIND_DROPPED_RESOURCES, 1);
            if (nearbyResources.length > 0) {
                source.memory.SetData('pileID', _.max(nearbyResources, (resource) => {
                    return resource.resourceType == RESOURCE_ENERGY && resource.amount;
                }).id, true);
            }
        }

        if (!source.creepID) {
            let creepName = 'sHarv_' + Math.floor(Math.random() * 100000);
            let creepBody: BodyPartConstant[] = [WORK, WORK, CARRY, MOVE];
            if (source.room.energyCapacityAvailable >= 800) {
                creepBody = ConstructBodyArray([[WORK, 6], [CARRY, 1], [MOVE, 3]]);
            } else if (source.room.energyCapacityAvailable > 550) {
                creepBody = ConstructBodyArray([[WORK, 5], [MOVE, 1]]);
            }


            if ((SwarmLoader.GetObject(source.room.name, MASTER_ROOM_MEMORY_ID) as SwarmRoom).TrySpawn(creepBody, creepName) == OK) {
                source.memory.SetData('creepID', creepName, true);
            }
        }
    }

    Activate() {
        let ids = this.sourceIDs;
        for (let i = 0; i < ids.length; i++) {
            let source = SwarmLoader.GetObject(ids[i], MASTER_ROOMOBJECT_MEMORY_ID) as SwarmSource;

            if (this.SourceObjects[ids[i]]) {
                if (this.SourceObjects[source.id].creepID) {
                    this.ActivateHarvest(source);
                }
            }

            SwarmLoader.SaveObject(this.SourceObjects[ids[i]]);
        }
    }
    protected ActivateHarvest(source: SwarmSource) {
        let creep = SwarmLoader.GetObject(source.creepID!, MASTER_CREEP_MEMORY_ID) as SwarmCreep
        if (!creep.spawning) {
            let action: ActionBase = new HarvestAction(creep, source);
            let validation = action.ValidateAction();
            switch (validation) {
                case (C_NONE):
                    break;
                case (C_MOVE):
                    let targetPos = source.pos;
                    if (source.containerID) {
                        targetPos = (SwarmLoader.GetObject(source.containerID, MASTER_STRUCTURE_MEMORY_ID) as SwarmRoomObject).pos;
                    }
                    action = new MoveToPositionAction(creep, targetPos);
                    break;
                case (E_TARGET_INELLIGIBLE):
                    action = new NoOpAction(creep);
                    break;
                case (E_ACTION_UNNECESSARY):
                    if (source.constructionID && creep.carry.energy > 0) {
                        action = new BuildAction(creep,
                            Game.getObjectById(source.constructionID) as ConstructionSite);
                    }
                    break;
            }

            action.Run();
        }
    }
}
/*
    protected ActivateHarvest(source: SwarmSource) {
        let creep = SwarmLoader.TheSwarm.creeps[source.memory.creepID!];
        if (!creep.spawning) {
            let action: ActionBase = new HarvestAction(creep, source.GetObjectInstance());
            let validation = action.ValidateAction();
            switch (validation) {
                case (C_NONE):
                    break;
                case (C_MOVE):
                    let targetPos = source.pos;
                    if (this.SourceData[source.id].hasContainer) {
                        targetPos = SwarmLoader.TheSwarm.structures[source.memory.containerID!].pos;
                    }
                    action = new MoveToPositionAction(creep, targetPos);
                    break;
                case (E_TARGET_INELLIGIBLE):
                    action = new NoOpAction(creep);
                    break;
                case (E_ACTION_UNNECESSARY):
                    if (this.SourceData[source.id].hasSite && creep.carry.energy > 0) {
                        action = new BuildAction(creep,
                            Game.getObjectById(source.memory.constructionID) as ConstructionSite);
                    }
                    break;
            }

            action.Run();
        }
    }
    protected OnPrepObject() {
        for (let i = 0; i < this.sourceIDs.length; i++) {
            let source = SwarmLoader.TheSwarm.roomObjects[this.memory.sourceIDs[i]] as SwarmSource;
            let sourceObjects = {
                constructionSite: source.memory.constructionID && SwarmLoader.TheSwarm.roomObjects[source.memory.constructionID],
                container: source.memory.containerID && SwarmLoader.TheSwarm.structures[source.memory.containerID],
                creep: source.memory.creepID && SwarmLoader.TheSwarm.creeps[source.memory.creepID],
                link: source.memory.linkID && SwarmLoader.TheSwarm.structures[source.memory.linkID],
                pile: source.memory.pileID && SwarmLoader.TheSwarm.roomObjects[source.memory.pileID]
            }
            let newData = {
                hasCreep: !!sourceObjects.creep,
                hasContainer: !!sourceObjects.container,
                hasLink: !!sourceObjects.link,
                hasPile: !!sourceObjects.pile,
                hasSite: !!sourceObjects.constructionSite
            };

            if (!newData.hasCreep && source.memory.creepID) {
                source.memory.RemoveData('creepID');
            }
            if (!newData.hasContainer && source.memory.containerID) {
                source.memory.RemoveData('containerID');
            }
            if (!newData.hasLink && source.memory.linkID) {
                source.memory.RemoveData('linkID');
            }
            if (!newData.hasPile && source.memory.pileID) {
                source.memory.RemoveData('pileID');
            }
            if (!newData.hasSite && source.memory.constructionID) {
                source.memory.RemoveData('constructionID');
            }

            let canHaveLink = source.room.controller && source.room.controller.owner.username == MY_USERNAME && source.room.controller.level >= 5;
            let needsCSite = (canHaveLink && !newData.hasLink) || (!canHaveLink && !newData.hasContainer);
            if (needsCSite && !newData.hasSite && Game.time % 53 == 0) {
                // Check to see if there's no site, because it was finished building.
                let structures = source.pos.findInRange(FIND_STRUCTURES, canHaveLink ? 2 : 1, {
                    filter: function (struct: Structure) {
                        return struct.structureType == STRUCTURE_LINK ||
                            (!newData.hasContainer && struct.structureType == STRUCTURE_CONTAINER);
                    }
                });
                if (structures.length > 0) {
                    if (structures[0].structureType == STRUCTURE_CONTAINER) {
                        source.memory.SetData('containerID', structures[0].id);
                        newData.hasContainer = true;
                    } else {
                        source.memory.SetData('linkID', structures[0].id);
                        newData.hasLink = true;
                    }
                }
                let cSites = source.pos.findInRange(FIND_CONSTRUCTION_SITES, canHaveLink ? 2 : 1, {
                    filter: function (cSite: ConstructionSite) {
                        return cSite.structureType == STRUCTURE_LINK ||
                            (!newData.hasContainer && cSite.structureType == STRUCTURE_CONTAINER);
                    }
                });

                if (cSites.length > 0) {
                    source.memory.SetData('constructionID', cSites[0].id);
                    newData.hasSite = true;
                }
            }
            if (!newData.hasPile && Game.time % 23 == 0) {
                let nearbyResources = source.pos.findInRange(FIND_DROPPED_RESOURCES, 1);
                if (nearbyResources.length > 0) {
                    source.memory.SetData('pileID', _.max(nearbyResources, (resource) => {
                        return resource.resourceType == RESOURCE_ENERGY && resource.amount;
                    }).id);
                    newData.hasPile = true;
                }
            }

            if (!newData.hasCreep) {
                let creepName = 'sHarv_' + Math.floor(Math.random() * 100000);
                let creepBody: BodyPartConstant[] = [WORK, WORK, CARRY, MOVE];
                if (source.room.energyCapacityAvailable >= 800) {
                    creepBody = ConstructBodyArray([[WORK, 6], [CARRY, 1], [MOVE, 3]]);
                } else if (source.room.energyCapacityAvailable > 550) {
                    creepBody = ConstructBodyArray([[WORK, 5], [MOVE, 1]]);
                }
                debugger;
                if (SwarmLoader.TheSwarm.rooms[source.room.name].TrySpawn(creepBody, creepName) == OK) {
                    source.memory.SetData('creepID', creepName);
                }
            }

            this.SourceData[source.id] = newData;
        }
    }
}*/