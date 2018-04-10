import { SwarmConsulBase } from "Consuls/ConsulBase";
import { MemoryBase } from "SwarmMemory/SwarmMemory";
import { SwarmLoader } from "SwarmTypes/SwarmLoader";
import { SwarmContainer, SwarmLink } from "SwarmTypes/SwarmStructures/SwarmStructure";
import { SwarmCreep } from "SwarmTypes/SwarmCreep";
import { SwarmRoom } from "SwarmTypes/SwarmRoom";
import { SwarmSource, SwarmRoomObjectType } from "SwarmTypes/SwarmRoomObjects";

import { ActionBase, NoOpAction } from "Actions/ActionBase";
import { HarvestAction } from "Actions/HarvestAction";
import { MoveToPositionAction } from "Actions/MoveToPositionAction";
import { BuildAction } from "Actions/BuildAction";

declare type SOURCE_IDS = 'sourceIDs';
const SOURCE_IDS = 'sourceIDs';
declare interface HarvestConsulData {
    [SOURCE_IDS]: string[];
}

export class HarvestConsul extends SwarmConsulBase<ConsulType.Harvest>
    implements HarvestConsulData {
    get sourceIDs(): HarvestConsulData[SOURCE_IDS] {
        return this.memory.GetData(SOURCE_IDS);
    }
    private SourceObjects: IDictionary<SwarmSource> = {};
    PrepObject() {
        let ids = this.sourceIDs;
        for (let i = 0; i < ids.length; i++) {
            if (!this.SourceObjects[ids[i]]) {
                let source = SwarmLoader.GetObject<SwarmSource>(ids[i], MASTER_ROOMOBJECT_MEMORY_ID);
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
            // (TODO) Convert this to use GetSUID();
            // (TODO) Move this decision somewhere else?
            let creepBody: BodyPartConstant[] = [WORK, WORK, CARRY, MOVE];
            if (source.room.energyCapacityAvailable >= 800) {
                creepBody = ConstructBodyArray([[WORK, 6], [CARRY, 1], [MOVE, 3]]);
            } else if (source.room.energyCapacityAvailable > 550) {
                creepBody = ConstructBodyArray([[WORK, 5], [MOVE, 1]]);
            } else if (source.room.energyCapacityAvailable > 350) {
                creepBody = ConstructBodyArray([[WORK, 2], [CARRY, 2], [MOVE, 1]])
            }

            let room = SwarmLoader.GetObject<SwarmRoom>(source.room.name, MASTER_ROOM_MEMORY_ID);
            room.TrySpawn(creepBody, {
                priority: Priority.High,
                requestorID: source.id,
                requestorType: MASTER_ROOMOBJECT_MEMORY_ID,
            })
        }
    }

    Activate() {
        let ids = this.sourceIDs;
        for (let i = 0; i < ids.length; i++) {
            let source = SwarmLoader.GetObject<SwarmSource>(ids[i], MASTER_ROOMOBJECT_MEMORY_ID);

            if (this.SourceObjects[ids[i]]) {
                if (this.SourceObjects[source.id].creepID) {
                    this.ActivateHarvest(source);
                }
            }

            SwarmLoader.SaveObject(this.SourceObjects[ids[i]]);
        }
    }
    protected ActivateHarvest(source: SwarmSource) {
        let creep = SwarmLoader.GetObject<SwarmCreep>(source.creepID!, MASTER_CREEP_MEMORY_ID)
        if (creep && !creep.spawning) {
            let action: ActionBase = new HarvestAction(creep, source.prototype);
            let validation = action.ValidateAction();
            switch (validation) {
                case (C_NONE):
                    break;
                case (C_MOVE):
                    let targetPos = source.pos;
                    if (source.containerID) {
                        targetPos = SwarmLoader.GetObject<SwarmRoomObjectType>(source.containerID, MASTER_STRUCTURE_MEMORY_ID).pos;
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