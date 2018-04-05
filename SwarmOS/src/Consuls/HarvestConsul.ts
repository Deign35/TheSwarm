import { SwarmConsul } from "./ConsulBase";
import { BasicMemory } from "SwarmMemory/SwarmMemory";
import { SwarmLoader } from "SwarmTypes/SwarmLoader";
import { ActionBase } from "Actions/ActionBase";
import { HarvestAction } from "Actions/HarvestAction";
import { HarvestMemory } from "SwarmMemory/ConsulMemory";
import { NotImplementedException } from "Tools/SwarmExceptions";

export class HarvestConsul extends SwarmConsul<HarvestMemory> {
    get IsActive() { return this.memory.isActive; }
    get prototype() { throw new NotImplementedException('OtherObjects do not have prototypes'); }
    protected OnActivate() {
        /*if (this.sourceData.hasHarvester) {
            let creep = SwarmLoader.TheSwarm.creeps[this.memory.creepID!];
            if (!creep.spawning) {
                let action: ActionBase = new HarvestAction(creep, this._instance);
                let validation = action.ValidateAction();
                switch (validation) {
                    case (C_NONE):
                        break;
                    case (C_MOVE):
                        let targetPos = this.pos;
                        if (this.sourceData.hasContainer) {
                            let container: SwarmRoomObjectTypes | SwarmStructureTypes = SwarmLoader.TheSwarm.structures[this.memory.containerID!] as SwarmStructureTypes;
                            if (!container) {
                                container = SwarmLoader.TheSwarm.roomObjects[this.memory.containerID!] as SwarmRoomObjectTypes;
                            }
                            if (container) {
                                targetPos = container.pos;
                            }
                        }
                        action = new MoveToPositionAction(creep, targetPos);
                        break;
                    case (E_TARGET_INELLIGIBLE):
                        action = new NoOpAction(creep);
                        break;
                    case (E_ACTION_UNNECESSARY):
                        if (this.sourceData.constructionSite && creep.carry.energy > 0) {
                            action = new BuildAction(creep,
                                Game.getObjectById(this.sourceData.constructionSite) as ConstructionSite);
                        }
                        break;
                }

                action.Run();
            }
        }*/
    }
    protected OnPrepObject() {
        /*let hasLink = this.memory.linkID && SwarmLoader.TheSwarm.structures[this.memory.linkID];
        if (hasLink) {
            this.sourceData.hasLink = true;
        } else {
            if (this.memory.linkID) {
                if (!SwarmLoader.TheSwarm.roomObjects[this.memory.linkID]) {
                    // Has a linkID, but no structure or constructionsite to match.
                    this.memory.RemoveData("linkID");
                    // This can happen because the structure was destroyed, the construction site was destroyed
                    // OR it could be because the link was completed.  So, let's look for a link nearby
                    let links = SwarmLoader.SwarmRoomIDs[this.room.name].structures[STRUCTURE_LINK];
                    for (let i = 0; i < links.length; i++) {
                        if (this.pos.getRangeTo(SwarmLoader.TheSwarm.structures[links[i]].pos) <= 2) {
                            this.memory.SetData("linkID", links[i]);
                            this.sourceData.hasLink = true;

                            if (this.memory.containerID) {
                                if (SwarmLoader.TheSwarm.structures[this.memory.containerID]) {
                                    SwarmLoader.TheSwarm.structures[this.memory.containerID].destroy();
                                } else if (SwarmLoader.TheSwarm.roomObjects[this.memory.containerID]) {
                                    (SwarmLoader.TheSwarm.roomObjects[this.memory.containerID] as SwarmSite).remove();
                                }

                                this.memory.RemoveData("containerID");
                            }
                            break;
                        }
                    }
                } else {
                    this.sourceData.constructionSite = this.memory.linkID!;
                }
            }
        }

        if (!this.sourceData.hasLink) {
            if (Game.time % 53 == 0) {
                let cSites = this.pos.findInRange(FIND_CONSTRUCTION_SITES, 1, {
                    filter: function (cSite: ConstructionSite) {
                        return cSite.structureType == STRUCTURE_LINK ||
                            cSite.structureType == STRUCTURE_CONTAINER;
                    }
                });

                if (cSites.length > 0) {
                    this.sourceData.constructionSite = cSites[0].id;
                    if (cSites[0].structureType == STRUCTURE_CONTAINER) {
                        this.memory.SetData('containerID', cSites[0].id);
                    } else {
                        this.memory.SetData('linkID', cSites[0].id);
                    }
                }
            }
            // (TODO): Check to see if I can add a link nearby
            let hasContainer = this.memory.containerID && SwarmLoader.TheSwarm.structures[this.memory.containerID];
            if (hasContainer) {
                this.sourceData.hasContainer = true;
            } else {
                if (this.memory.containerID) {
                    if (!SwarmLoader.TheSwarm.roomObjects[this.memory.containerID]) {
                        // Has a linkID, but no structure or constructionsite to match.
                        this.memory.RemoveData("containerID");
                        // This can happen because the structure was destroyed, the construction site was destroyed
                        // OR it could be because the link was completed.  So, let's look for a link nearby
                        let containers = SwarmLoader.SwarmRoomIDs[this.room.name].structures[STRUCTURE_CONTAINER];
                        for (let i = 0; i < containers.length; i++) {
                            if (this.pos.getRangeTo(SwarmLoader.TheSwarm.structures[containers[i]].pos) <= 1) {
                                this.memory.SetData("containerID", containers[i]);
                                this.sourceData.hasContainer = true;
                                break;
                            }
                        }
                    } else {
                        this.sourceData.constructionSite = this.memory.containerID;
                    }
                }
            }
        }

        let needsSpawn = !this.memory.creepID;
        if (this.memory.creepID && !SwarmLoader.TheSwarm.creeps[this.memory.creepID]) {
            needsSpawn = true;
            this.memory.RemoveData(CREEP_ID);
        }

        if (needsSpawn) {
            let creepName = 'sHarv_' + Math.ceil(Math.random() * 1000) + this.room.name;
            let creepBody: BodyPartConstant[] = [WORK, WORK, CARRY, MOVE];
            if (this.room.energyCapacityAvailable >= 800) {
                creepBody = ConstructBodyArray([[WORK, 6], [CARRY, 1], [MOVE, 3]]);
            } else if (this.room.energyCapacityAvailable > 550) {
                creepBody = ConstructBodyArray([[WORK, 5], [MOVE, 1]]);
            }
            if (SwarmLoader.TheSwarm.rooms[this.room.name].TrySpawn(creepBody, creepName) == OK) {
                this.memory.SetData(CREEP_ID, creepName);
            }
        } else {
            this.sourceData.hasHarvester = true;
        }

        let hasPile = this.memory.pileID && SwarmLoader.TheSwarm.roomObjects[this.memory.pileID];
        if (hasPile) {
            this.sourceData.hasResourcePile = true;
        } else if (Game.time % 23 == 0) {
            if (this.memory.pileID) {
                this.memory.RemoveData('pileID');
            }
            if (this.sourceData.hasContainer) {
                let container = SwarmLoader.TheSwarm.structures[this.memory.containerID!];
                let foundObjs = container.pos.lookFor(LOOK_ENERGY);
                if (foundObjs.length > 0) {
                    this.memory.SetData('pileID', foundObjs[0]!.id);
                    this.sourceData.hasResourcePile = true;
                }
            } else {
                let nearbyResources = this.pos.findInRange(FIND_DROPPED_RESOURCES, 1);
                if (nearbyResources.length > 0) {
                    this.memory.SetData('pileID', nearbyResources[0].id)
                    this.sourceData.hasResourcePile = true;
                }
            }
        }*/
    }
}