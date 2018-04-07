import { SwarmConsul, ConsulObject } from "Consuls/ConsulBase";
import { HarvestMemory, ControlMemory } from "SwarmMemory/ConsulMemory";
import { SwarmSource } from "SwarmTypes/SwarmRoomObjects";



export class HarvestConsul extends SwarmConsul<ConsulType.Harvest> {
    Activate(mem: HarvestMemory, obj: ConsulObject<ConsulType.Harvest>): HarvestMemory {
        throw new Error("Method not implemented.");
    }
    InitAsNew(obj: ConsulObject<ConsulType.Harvest>): HarvestMemory {
        throw new Error("Method not implemented.");
    }
    PrepObject(mem: HarvestMemory, obj: ConsulObject<ConsulType.Harvest>): HarvestMemory {
        throw new Error("Method not implemented.");
    }
    SourceData!: {
        [id: string]: {
            hasCreep: boolean;
            hasContainer: boolean;
            hasLink: boolean;
            hasPile: boolean;
            hasSite: boolean;
        }
    }
    protected OnActivate() {
        /*for (let i = 0; i < this.memory.sourceIDs.length; i++) {
            let source = SwarmLoader.TheSwarm.roomObjects[this.memory.sourceIDs[i]] as SwarmSource;
            if (this.SourceData[source.id].hasCreep) {
                this.ActivateHarvest(source);
            }
        }*/
    }

    protected ActivateHarvest(source: SwarmSource) {
        /*let creep = SwarmLoader.TheSwarm.creeps[source.memory.creepID!];
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
        this.SourceData = {};
        for (let i = 0; i < this.memory.sourceIDs.length; i++) {
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
        }*/
    }
}