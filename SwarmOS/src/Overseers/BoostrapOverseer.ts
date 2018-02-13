import { OverseerBase } from "./OverseerBase";
import * as SwarmEnums from "SwarmEnums";
import * as _ from "lodash";
import { ActionBase } from "Actions/ActionBase";
import { BuildAction } from "Actions/BuildAction";
import { HarvestAction } from "Actions/HarvestAction";
import { TransferAction } from "Actions/TransferAction";
import { UpgradeAction } from "Actions/UpgradeAction";
import { MoveToPositionAction } from "Actions/MoveToPositionAction";
import { HiveQueen } from "Managers/HiveQueen";

const CREEP_NAMES = 'CN';
const CREEP_DATA = 'CD';
const SOURCE_DATA = 'SD';

// BootRoles
const ROLE_NONE = 'NN';
const ROLE_GENERAL = 'Ge';
const GENERAL_BODY = [WORK, CARRY, CARRY, CARRY, MOVE];
const ROLE_DELIVERY = 'De';
const DELIVERY_BODY = [CARRY, CARRY, CARRY, CARRY, MOVE, MOVE]
const ROLE_UPGRADE = 'Up';
const UPGRADE_BODY = [WORK, WORK, CARRY, MOVE];

// This should just be a HiveLarva or something (small HiveQueen).
// This is only needed until we have at least one container next to a source.  Once that is complete,
// and all 5 extensions are built, we can afford normal 5w + 1m harvesters.
export class BootstrapOverseer extends OverseerBase {
    BootCreeps!: string[];
    protected CreepData!: {[creepName: string]: { role: string, action?: SwarmEnums.CreepActionType, targetID?: string}};
    protected SourceData!:  {id: string, harvesters: number}[];
    protected _creepData!: {[creepName: string]: { creep: Creep, carryAmount: number, target?: RoomObject, hasDelivery: boolean }};
    protected _overrides!: {[creepName: string]: Creep};
    Save() {
        this.BootCreeps = [];
        for(let creepName in this.CreepData) {
            this.BootCreeps.push(creepName);
        }
        this.SetData(CREEP_NAMES, this.BootCreeps);
        this.SetData(CREEP_DATA, this.CreepData);
        this.SetData(SOURCE_DATA, this.SourceData);
        super.Save();
    }
    Load() {
        super.Load();
        this.BootCreeps = this.GetData(CREEP_NAMES) || [];
        this.CreepData = this.GetData(CREEP_DATA) || {};
        this.SourceData = this.GetData(SOURCE_DATA) || [];
        this._overrides = {};
        this._creepData = {};

        if(this.SourceData.length == 0) {
            let roomSources = (this.Parent as HiveQueen).Hive.find(FIND_SOURCES);
            for(let index in roomSources) {
                this.SourceData.push( { id: roomSources[index].id, harvesters: 0})
            }
        }
    }

    ValidateOverseer(): void {
        debugger;
        /*let flags = this.Queen.Hive.find(FIND_FLAGS);
        for(let name in flags) {
            if()
        }*/
        let HasIncreased = (this.Queen.Hive.controller as StructureController).level > 1;
        let registry = OverseerBase.CreateEmptyOverseerRegistry();
        let creepJobs: {[role: string]: string[]} = {};
        creepJobs[ROLE_DELIVERY] = [];
        creepJobs[ROLE_UPGRADE] = [];
        creepJobs[ROLE_GENERAL] = [];

        let spawner = this.Queen.Hive.find(FIND_MY_SPAWNS)[0];
        if(!spawner) {
            // No spawner yet, nothing to do.
            this._creepData = {}; // Just in case.
            this.Registry = registry;
            return;
        }

        for(let i = 0, length = this.BootCreeps.length; i < length; i++) {
            let creepName = this.BootCreeps[i];
            if(!Game.creeps[creepName]) {
                if(this.CreepData[creepName] && this.CreepData[creepName].targetID) {
                    let obj = Game.getObjectById(this.CreepData[creepName].targetID);
                    if(obj && (obj as Source).ticksToRegeneration) {
                        let sourceIndex = 0;
                        if(this.SourceData.length > 1 && this.SourceData[1].id == (obj as Source).id) {
                            sourceIndex = 1;
                        }
                        this.SourceData[sourceIndex].harvesters--;
                    }
                }
                delete this.CreepData[creepName];
            } else {
                let creep = Game.creeps[creepName];
                this._creepData[creepName] = {creep: creep, carryAmount: _.sum(Game.creeps[creepName].carry), hasDelivery: false};
                if(this.CreepData[creepName].role == ROLE_NONE) {
                    this.CreepData[creepName].role = BootstrapOverseer.DetermineRoleFromBody(creep);
                }
                creepJobs[this.CreepData[creepName].role].push(creepName);
            }
        }

        for(let creepName in this._creepData) {
            let creep = this._creepData[creepName].creep;
            let role = this.CreepData[creepName].role;
            if(this.CreepData[creepName].action) {
                if(this.CreepData[creepName].action == SwarmEnums.C_Upgrade && HasIncreased) {
                    delete this.CreepData[creepName].action;
                    delete this.CreepData[creepName].targetID;
                }
            }

            if(!this.CreepData[creepName].action) {
                // Decide what to do with this creep.
                switch(role) {
                    case(ROLE_DELIVERY):
                        if(this._creepData[creep.name].carryAmount != creep.carryCapacity ) {
                            this.CreepData[creep.name].action = SwarmEnums.C_Withdraw;
                        } else {
                            this.CreepData[creep.name].action = SwarmEnums.C_Transfer;
                        }
                    break;
                    case(ROLE_UPGRADE):
                        if(HasIncreased) {
                            this.CreepData[creep.name].action = SwarmEnums.C_Build;
                        } else {
                            this.CreepData[creep.name].action = SwarmEnums.C_Upgrade;
                        }
                    break;
                    case(ROLE_GENERAL):
                    default:
                        if(_.sum(creep.carry) != creep.carryCapacity) {
                            this.CreepData[creep.name].action = SwarmEnums.C_Harvest;
                        } else {
                            if(creep.room.find(FIND_CONSTRUCTION_SITES).length > 0 && this.BootCreeps.length > 1) {
                                this.CreepData[creep.name].action = SwarmEnums.C_Build;
                            } else {
                                this.CreepData[creep.name].action = SwarmEnums.C_Transfer;
                            }
                        }
                    break;
                }
            }
            let actionTarget = this.CreepData[creep.name].targetID && Game.getObjectById(this.CreepData[creep.name].targetID) as Creep | Structure | Source | ConstructionSite | undefined;
            if(actionTarget && (this.CreepData[creep.name].action as string) == ROLE_DELIVERY) {
                // Check that the target isn't already full.
                if((actionTarget as StructureSpawn).energyCapacity && (actionTarget as StructureSpawn).energy == (actionTarget as StructureSpawn).energyCapacity) {
                    delete this.CreepData[creep.name].targetID;
                    actionTarget = undefined;
                }
                if((actionTarget as Creep).carryCapacity && this._creepData[creep.name].carryAmount == (actionTarget as Creep).carryCapacity) {
                    delete this.CreepData[creep.name].targetID;
                    actionTarget = undefined;
                }
            }
            if(!actionTarget) {
                // Find a new target per my role and action.
                switch(this.CreepData[creep.name].action) {
                    case(SwarmEnums.C_Withdraw):
                        // Need to actual get a transfer request to a general.
                        // Create an override that the general will follow.
                        let newTarget = this.FindWithdrawTarget(creep, creepJobs[ROLE_GENERAL]);
                        if(newTarget) {
                            actionTarget = Game.creeps[newTarget];
                        }
                        break;
                    case(SwarmEnums.C_Transfer):
                        let structureTargets = this.Queen.Hive.find(FIND_MY_STRUCTURES, {
                            filter: function(structure) {
                                return (structure.structureType == STRUCTURE_EXTENSION ||
                                        structure.structureType == STRUCTURE_SPAWN) &&
                                            structure.energy < structure.energyCapacity;
                            }
                        });
                        if(structureTargets.length > 0) {
                            actionTarget = structureTargets[0]; // Fill up spawner first.
                        } else {
                            //Check for the extensions here
                            let newTarget: string | undefined;
                            if(!newTarget && this.CreepData[creep.name].role == ROLE_GENERAL) {
                                newTarget = this.FindDeliveryTarget(creep, creepJobs[ROLE_DELIVERY]);
                            }
                            if(!newTarget) {
                                newTarget = this.FindDeliveryTarget(creep, creepJobs[ROLE_UPGRADE]);
                            }

                            if(!newTarget) {
                                /* We have an issue ... */
                                delete this._creepData[creep.name];
                                console.log('THIS IS POSSIBLE, BUT I WISH IT WERENT { BootstrapOverseer.NoTransferTarget }');
                                continue;
                            }
                            actionTarget = Game.creeps[newTarget];
                            this._creepData[newTarget as string].hasDelivery = true;
                        }
                        break;
                    case(SwarmEnums.C_Upgrade):
                        actionTarget = (creep.room.controller as StructureController);
                        break;
                    case(SwarmEnums.C_Harvest):
                        let selectedSource = 0;
                        if(this.SourceData.length > 1 && this.SourceData[0].harvesters > this.SourceData[1].harvesters) {
                            selectedSource = 1;
                        }
                        actionTarget = Game.getObjectById(this.SourceData[selectedSource].id) as Source;
                        this.SourceData[selectedSource].harvesters++;
                        break;
                    case(SwarmEnums.C_Build):
                        actionTarget = creep.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES) as ConstructionSite; // Find the closest?
                        break;
                }

                if(!actionTarget) {
                    console.log('THIS IS POSSIBLE, BUT I WISH IT WERENT { BootstrapOverseer.NoTargetAtAll1 }');
                    delete this._creepData[creep.name];
                    continue;
                }
                this.CreepData[creep.name].targetID = actionTarget && actionTarget.id;
            }
            this._creepData[creep.name].target = actionTarget;
            if(!this._creepData[creep.name].target) {
                console.log('THIS IS POSSIBLE, BUT I WISH IT WERENT { BootstrapOverseer.NoTargetAtAll2 }');
                delete this._creepData[creep.name];
                continue;
            }

            if(this.CreepData[creepName].action == SwarmEnums.C_Withdraw) {
                if(creep.pos.getRangeTo(this._creepData[creepName].target as Creep) <= 1) {
                    this._overrides[(this._creepData[creepName].target as Creep).name] = this._creepData[creepName].creep;
                    delete this._creepData[creepName];
                }
            }

        }

        let creepToBuild: BodyPartConstant[] = [];
        if(creepJobs[ROLE_GENERAL].length < 1) {
            creepToBuild = GENERAL_BODY;
        } else if(creepJobs[ROLE_DELIVERY].length < 1) {
            creepToBuild = DELIVERY_BODY;
        } else if(creepJobs[ROLE_GENERAL].length < 4) {
            creepToBuild = GENERAL_BODY;
        } else if(creepJobs[ROLE_DELIVERY].length < 2) {
            creepToBuild = DELIVERY_BODY;
        } else if(creepJobs[ROLE_GENERAL].length < 6) {
            creepToBuild = GENERAL_BODY;
        } else if(creepJobs[ROLE_UPGRADE].length < 2) {
            creepToBuild = UPGRADE_BODY;
        } else if(creepJobs[ROLE_GENERAL].length < 8) {
            creepToBuild = GENERAL_BODY;
        }

        if(creepToBuild.length > 0) {
            registry.Requirements.Creeps.push({time: 0, creepBody: creepToBuild})
        }

        this.Registry = registry;
    }
    HasResources(): boolean { return false; }
    ActivateOverseer(): void {
        debugger;
        for(let creepName in this._creepData) {
            // Choose the creeps job and targets if it doesn't already have them.
            let creep = this._creepData[creepName].creep;
            let action: ActionBase | undefined;
            if(this._overrides[creepName] && creep.carry[RESOURCE_ENERGY] > 0) {
                action = new TransferAction(creep, this._overrides[creepName] as Creep, RESOURCE_ENERGY);
                if(action.Run(false) == SwarmEnums.CRT_Condition_Empty) {
                    // Withdraw successful.
                    this.CreepData[this._overrides[creepName].name].action = SwarmEnums.C_Transfer;
                    delete this.CreepData[this._overrides[creepName].name].targetID;
                }
                continue;
            } else {
                let target = this._creepData[creepName].target;
                switch(this.CreepData[creepName].action) {
                    case(SwarmEnums.C_Build):
                        action = new BuildAction(creep, target as ConstructionSite);
                        break;
                    case(SwarmEnums.C_Harvest):
                        action = new HarvestAction(creep, target as Source);
                        break;
                    case(SwarmEnums.C_Transfer):
                        action = new TransferAction(creep, target as Creep | Structure, RESOURCE_ENERGY);
                        break;
                    case(SwarmEnums.C_Upgrade):
                        if(creep.carry[RESOURCE_ENERGY])
                        action = new UpgradeAction(creep, target as StructureController);
                        break;
                    case(SwarmEnums.C_Withdraw):
                        // No Action actually... except move to.
                        action = new MoveToPositionAction(creep, (target as Creep).pos);
                        break;
                }
            }
            if(!action) {
                console.log('THIS IS NOT POSSIBLE { BootstrapOverseer.NoAction }');
                continue;
            }
            let validation = action.ValidateAction(); // Ignoring result

            let actionResponse = action.Run(true);
            switch(actionResponse) {
                case(SwarmEnums.CRT_Condition_Full):
                    if(this._creepData[creepName].carryAmount == creep.carryCapacity) {
                        let index = 0;
                        if(this.SourceData.length > 0) {
                            if(this.SourceData[1].id == this.CreepData[creepName].targetID) {
                                index = 1;
                            }
                        }
                        this.SourceData[index].harvesters--;
                        delete this.CreepData[creepName].action;
                        delete this.CreepData[creepName].targetID;
                    }
                    break; // Harvest Complete
                case(SwarmEnums.CRT_Condition_Empty):
                    if(this.CreepData[creepName].action == SwarmEnums.C_Transfer) {
                        delete this.CreepData[creepName].action;
                        delete this.CreepData[creepName].targetID;
                    }
                    break; // Transfer Successful -- Upgrade successful -- Build successful
                case(SwarmEnums.CRT_NewTarget):
                    if(this.CreepData[creepName].action == SwarmEnums.C_Harvest) {
                        let index = 0;
                        if(this.SourceData.length > 0) {
                            if(this.SourceData[1].id == this.CreepData[creepName].targetID) {
                                index = 1;
                            }
                        }
                        this.SourceData[index].harvesters--;
                    }
                    delete this.CreepData[creepName].action;
                    delete this.CreepData[creepName].targetID;
                    break; // Harvest failed - Source empty -- Transfer failed - Target full
                case(SwarmEnums.CRT_Next):
                    delete this.CreepData[creepName].action;
                    delete this.CreepData[creepName].targetID;
                break; // Transfer Empty -- Upgrade Empty -- Build Empty
                case(SwarmEnums.CRT_Move): break; // Expected from all
            }
        }
    }
    ReleaseCreep(creepName: string, releaseReason: string): void {
        if(Game.creeps[creepName]) {
            delete Game.creeps[creepName].memory.Assigned;
        }
        delete this.CreepData[creepName];
        delete this._creepData[creepName];
    }
    AssignCreep(creepName: string): void {
        this.CreepData[creepName] = { role: ROLE_NONE };
    }
    AssignOrder(orderID: string): boolean {
        throw new Error("Method not implemented.");
    }

    EndBootstrap() {
        for(let name in this.CreepData) {
            this.ReleaseCreep(name, 'Done Bootstrapping');
        }
        this.CreepData = {};
        this.BootCreeps = [];
    }

    protected static DetermineRoleFromBody(creep: Creep) {
        switch(creep.getActiveBodyparts(WORK)) {
            case(0):
                return ROLE_DELIVERY;
            case(1):
                return ROLE_GENERAL;
        }

        return ROLE_UPGRADE;
    }

    protected FindWithdrawTarget(creep: Creep, potentialTargets: string[]) {if(potentialTargets.length == 0) { return;}
    potentialTargets.sort((a: string, b:string) => {
        if(!this._creepData[a] || this._creepData[a].hasDelivery) {
            return 1;
        }
        if(!this._creepData[b] || this._creepData[b].hasDelivery) {
            return -1;
        }
        let creepA = this._creepData[a].creep;
        let aHasEnough = creepA.carryCapacity < this._creepData[a].carryAmount * 2;
        let creepB = this._creepData[b].creep;
        let bHasEnough = creepB.carryCapacity < this._creepData[b].carryAmount * 2;
        if(aHasEnough != bHasEnough) {
            return aHasEnough ? -1 : 1;
        }

        let distA = creep.pos.findPathTo(creepA).length;
        let distB = creep.pos.findPathTo(creepB).length;
        if (distA == 0) {
            return 1;
        }
        if (distB == 0) {
            return -1;
        }
        if (distA < distB) {
            return -1;
        }
        if (distB < distA) {
            return 1;
        }
        return 0;
    });

    return potentialTargets[0];
    }

    protected FindDeliveryTarget(creep:Creep, potentialTargets: string[]) {
        if(potentialTargets.length == 0) { return;}
        potentialTargets.sort((a: string, b:string) => {
            if(this._overrides[a]) {
                return 1;
            }
            if(this._overrides[b]) {
                return -1;
            }

            let creepA = this._creepData[a].creep;
            if(creepA.carryCapacity < this._creepData[a].carryAmount * 2) {
                return 1;
            }
            let creepB = this._creepData[b].creep;
            if(creepB.carryCapacity < this._creepData[b].carryAmount * 2) {
                return -1;
            }// Both have need.

            let distA = creep.pos.findPathTo(creepA).length;
            let distB = creep.pos.findPathTo(creepB).length;
            if (distA == 0) {
                return 1;
            }
            if (distB == 0) {
                return -1;
            }
            if (distA < distB) {
                return -1;
            }
            if (distB < distA) {
                return 1;
            }
            return 0;
        });

        return potentialTargets[0];
    }
}