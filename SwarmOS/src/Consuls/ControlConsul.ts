import { SwarmConsulBase } from "Consuls/ConsulBase";
import { SwarmController } from "SwarmTypes/SwarmStructures/SwarmController";
import { SwarmLoader } from "SwarmTypes/SwarmLoader";

declare type CONTROLLER_IDS = 'controllerIDs';
const CONTROLLER_IDS = 'controllerIDs';
declare interface ControlerConsulData {
    [CONTROLLER_IDS]: string[];
}
export class ControlConsul extends SwarmConsulBase<ConsulType.Control> {
    get sourceIDs(): ControlerConsulData[CONTROLLER_IDS] {
        return this.memory.GetData(CONTROLLER_IDS);
    }
    private ControllerObjects: IDictionary<SwarmController> = {};
    PrepObject() {
        let ids = this.sourceIDs;
        for (let i = 0; i < ids.length; i++) {
            if (!this.ControllerObjects[ids[i]]) {
                let controller = SwarmLoader.GetObject<SwarmController>(ids[i], MASTER_STRUCTURE_MEMORY_ID);
                this.ControllerObjects[ids[i]] = controller;
            }

            this.ControllerObjects[ids[i]].memory.ReserveMemory();
            this.ControllerObjects[ids[i]].PrepObject();
            //this.PrepSource(this.ControllerObjects[ids[i]]);
        }
    }

    protected PrepController(controller: SwarmController) {
        if (controller.my) {
            // My controller
            
            switch (controller.level) {
                // Do level specific changes here.
            }
        } else if (controller.reservation && controller.reservation.username == MY_USERNAME) {
            // I have it reserved
        } else {
            // Unowned or enemy.
        }
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
            let creepName = 'sHarv_' + Math.floor(Math.random() * 100000);
            let creepBody: BodyPartConstant[] = [WORK, CARRY, MOVE];
            if (source.room.energyCapacityAvailable >= 800) {
                creepBody = ConstructBodyArray([[WORK, 6], [CARRY, 1], [MOVE, 3]]);
            } else if (source.room.energyCapacityAvailable > 550) {
                creepBody = ConstructBodyArray([[WORK, 5], [MOVE, 1]]);
            } else if (source.room.energyCapacityAvailable > 350) {
                creepBody = ConstructBodyArray([[WORK, 2], [CARRY, 2], [MOVE, 1]])
            }

            if (SwarmLoader.GetObject<SwarmRoom>(source.room.name,
                MASTER_ROOM_MEMORY_ID).TrySpawn(creepBody, creepName) == OK) {
                source.memory.SetData('creepID', creepName, true);
            }
        }
    }

    Activate() {
        let ids = this.sourceIDs;
        for (let i = 0; i < ids.length; i++) {
            let source = SwarmLoader.GetObject<SwarmSource>(ids[i], MASTER_ROOMOBJECT_MEMORY_ID);

            if (this.ControllerObjects[ids[i]]) {
                if (this.ControllerObjects[source.id].creepID) {
                    this.ActivateHarvest(source);
                }
            }

            SwarmLoader.SaveObject(this.ControllerObjects[ids[i]]);
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