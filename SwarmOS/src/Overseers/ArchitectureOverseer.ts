import * as _ from "lodash";
import { OverseerBase } from "Overseers/OverseerBase";
import { HiveQueen } from "Managers/HiveQueen";
import { MoveToPositionAction } from "Actions/MoveToPositionAction";
import * as SwarmConsts from "SwarmConsts";
import * as SwarmEnums from "SwarmEnums";
import { SwarmQueen } from "Managers/SwarmQueen";
import { UpgradeAction } from "Actions/UpgradeAction";

const RCL_DATA = 'RCL';
export class ArchitectureOverseer extends OverseerBase {
    Hive: Room;
    protected ControllerData: {
        upgradeCreeps: { creepName: string, carryCapacity: number, orderID?: string }[],
        level: number,
    };

    Save() {
        this.SetData(RCL_DATA, this.ControllerData);
        super.Save();
    }

    Load() {
        super.Load();
        this.Hive = Game.rooms[this.ParentMemoryID];
        this.ControllerData = this.GetData(RCL_DATA) || { upgradeCreeps: [], level: (this.Hive.controller as StructureController).level };
    }

    HasResources(): boolean { return false; } // It's just easier for now...

    ValidateOverseer() {
        let registry = OverseerBase.CreateEmptyOverseerRegistry();
        let upgradeData = this.ControllerData;
        upgradeData.level = (this.Hive.controller as StructureController).level;
        let numUpgraders = 1;
        switch (upgradeData.level) {
            case (8): break;
            default: numUpgraders = 3;
        }

        for (let i = 0; i < numUpgraders; i++) {
            let creep = upgradeData.upgradeCreeps[i] ? Game.creeps[upgradeData.upgradeCreeps[i].creepName] : undefined;
            if (!creep) {
                if (upgradeData.upgradeCreeps[i]) { upgradeData.upgradeCreeps.splice(i--, 1); }
                registry.Requirements.Creeps.push({ time: 0, creepBody: [WORK, WORK, CARRY, MOVE] });
            } else {
                if (creep.carry.energy < creep.carryCapacity / 2 && !upgradeData.upgradeCreeps[i].orderID) {
                    registry.Requirements.Resources.push({ amount: creep.carryCapacity, location: creep, type: RESOURCE_ENERGY })
                }
            }
        }

        let spawns = this.Hive.find(FIND_MY_SPAWNS);
        for(let index in spawns) {
            if(spawns[index].energy < spawns[index].energyCapacity) {

            }
        }
        this.ControllerData = upgradeData;
        this.Registry = registry;
    }

    ActivateOverseer() {
        for (let i = 0, length = this.ControllerData.upgradeCreeps.length; i < length; i++) {
            let creepData = this.ControllerData.upgradeCreeps[i];
            let creep = Game.creeps[creepData.creepName];
            if (creep.spawning) { continue; }
            if(!this.ControllerData.upgradeCreeps[i].carryCapacity) {
                this.ControllerData.upgradeCreeps[i].carryCapacity = creep.getActiveBodyparts(CARRY) * 50;
            }
            let action;
            if (i == 0 && (!((this.Hive.controller as StructureController).sign) ||
                ((this.Hive.controller as StructureController).sign as SignDefinition).username != SwarmConsts.MY_USERNAME)) {

                if (creep.pos.getRangeTo(this.Hive.controller as StructureController) > 1) {
                    action = new MoveToPositionAction(creep, (this.Hive.controller as StructureController).pos);
                } else {
                    creep.signController(this.Hive.controller as StructureController, SwarmConsts.MY_SIGNATURE);
                }
            }

            if (!action) {
                if (creep.carry.energy == 0) {
                    // Check on my order
                    //(this.Parent as HiveQueen).Distribution.CreateNewDistributionOrder(creep, RESOURCE_ENERGY, creep.carryCapacity);
                    if (this.ControllerData.upgradeCreeps[i].orderID) {
                        if (!(this.Parent as HiveQueen).Distribution.CheckOrderIDIsValid(this.ControllerData.upgradeCreeps[i].orderID as string)) {
                            delete this.ControllerData.upgradeCreeps[i].orderID;
                        }
                    } else {
                        // No resources, but has yet to receive an orderID for more.
                        console.log('Upgrader unable to request resources');
                    }
                } else {
                    // Just upgrade the controller.
                    action = new UpgradeAction(creep, this.Hive.controller as StructureController);
                }
            } else {
                // got a moveto
            }

            let actionResponse = action ? action.Run() : SwarmEnums.CRT_None;
            // I actually basically don't care what the result is
            // For now I will continue to check as a verification tool
            switch (actionResponse) {
                case (SwarmEnums.CRT_None):
                case (SwarmEnums.CRT_Condition_Empty):
                case (SwarmEnums.CRT_Next):
                case (SwarmEnums.CRT_Move): break; // Did not harvest, needed to move.
                default:
                    console.log('THIS IS NOT POSSIBLE [' + actionResponse + ']{ ArchitectureOverseer.actionResponse }');
            }
        }
    }

    AssignCreep(creepName: string): void {
        console.log('Assign to AO');
        // Make sure the creep can carry enough for the job before assigning it an order.
        for (let i = 0, length = this.ControllerData.upgradeCreeps.length; i < length; i++) {
            if (!this.ControllerData.upgradeCreeps[i].creepName) {
                this.ControllerData.upgradeCreeps[i].creepName = creepName;
                console.log('THIS IS NOT POSSIBLE { ArchitectureOverseer.AssignCreep }');
                return;
            }
        }

        this.ControllerData.upgradeCreeps.push({ creepName: creepName, carryCapacity: 0 });
    }

    ReleaseCreep(creepName: string, releaseReason: string) {
        for (let i = 0, length = this.ControllerData.upgradeCreeps.length; i < length; i++) {
            if (this.ControllerData.upgradeCreeps[i].creepName == creepName) {
                this.ControllerData.upgradeCreeps.splice(i, 1);
                break;
            }
        }
    }

    AssignOrder(order: DistributionOrder) {
        for (let i = 0, length = this.ControllerData.upgradeCreeps.length; i < length; i++) {
            if (!this.ControllerData.upgradeCreeps[i].orderID) {
                if (this.ControllerData.upgradeCreeps[i].carryCapacity >= order.amount) {
                    this.ControllerData.upgradeCreeps[i].orderID = order.orderID;
                    return true;
                }
            }
        }

        return false;
    }
}