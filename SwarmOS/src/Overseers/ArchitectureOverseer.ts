import * as _ from "lodash";
import { OverseerBase } from "Overseers/OverseerBase";
import { MoveToPositionAction } from "Actions/MoveToPositionAction";
import * as SwarmConsts from "SwarmConsts";
import * as SwarmEnums from "SwarmEnums";
import { SwarmQueen } from "Managers/SwarmQueen";
import { UpgradeAction } from "Actions/UpgradeAction";

const LAST_UPDATE = 'LD';
const ORDER_IDS = 'OI';
const RCL_DATA = 'RCL';
export class ArchitectureOverseer extends OverseerBase {
    Hive!: Room;
    protected _lastUpdate!: number;
    protected ControllerData!: {
        upgradeCreeps: { creepName: string, carryCapacity: number }[],
        spawnStorage: string[],
        level: number,
    };

    protected OrderIDs!: { [requestorID: string]: string };

    Save() {
        this.SetData(LAST_UPDATE, this._lastUpdate);
        this.SetData(ORDER_IDS, this.OrderIDs);
        this.SetData(RCL_DATA, this.ControllerData);
        super.Save();
    }

    Load() {
        super.Load();
        this.Hive = Game.rooms[this.ParentMemoryID];
        this._lastUpdate = this.GetData(LAST_UPDATE) || 0;
        this.OrderIDs = this.GetData(ORDER_IDS) || {};
        this.ControllerData = this.GetData(RCL_DATA) || { upgradeCreeps: [], level: (this.Hive.controller as StructureController).level };
    }

    HasResources(): boolean { return false; } // It's just easier for now...

    ValidateOverseer() {
        let registry = OverseerBase.CreateEmptyOverseerRegistry();
        let upgradeData = this.ControllerData;
        upgradeData.level = (this.Hive.controller as StructureController).level;

        for (let name in this.OrderIDs) {
            if (!this.Queen.Distribution.CheckOrderIDIsValid(this.OrderIDs[name])) {
                delete this.OrderIDs[name];
            }
        }

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
                if (creep.carry.energy < creep.carryCapacity / 4) {
                    if (!this.OrderIDs[creep.id]) {
                        registry.Requirements.Resources.push({ amount: creep.carryCapacity, location: creep, type: RESOURCE_ENERGY })
                    }
                }
            }
        }

        if (this._lastUpdate - Game.time < 100) {
            this._lastUpdate = Game.time;
            this.ControllerData.spawnStorage = [];
            let spawns = this.Queen.hivelord.FindTargets(FIND_MY_SPAWNS) as StructureSpawn[];
            for (let index in spawns) {
                this.ControllerData.spawnStorage.push(spawns[index].id);
            }
            let extensions = this.Queen.hivelord.FindTargets<STRUCTURE_EXTENSION>(FIND_STRUCTURES, STRUCTURE_EXTENSION) as StructureExtension[];
            for (let index in extensions) {
                this.ControllerData.spawnStorage.push(extensions[index].id);
            }
        }

        for (let i = 0, length = this.ControllerData.spawnStorage.length; i < length; i++) {
            let spawnStorageObj = Game.getObjectById(this.ControllerData.spawnStorage[i]) as StructureSpawn | StructureExtension;
            if (spawnStorageObj.energy < spawnStorageObj.energyCapacity) {
                debugger;
                if (!this.OrderIDs[spawnStorageObj.id] || !this.Queen.Distribution.CheckOrderIDIsValid(this.OrderIDs[spawnStorageObj.id])) {
                    registry.Requirements.Resources.push({ amount: spawnStorageObj.energyCapacity - spawnStorageObj.energy, location: spawnStorageObj, type: RESOURCE_ENERGY });
                }
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
            if (!this.ControllerData.upgradeCreeps[i].carryCapacity) {
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
                    // Check to make sure I have an order
                    if (!this.OrderIDs[creep.id]) {
                        console.log('Awaiting acceptance of resource request.');
                    } else if (!this.Queen.Distribution.CheckOrderIDIsValid(this.OrderIDs[creep.id])) {
                        this.Queen.Distribution.CancelOrder(this.OrderIDs[creep.id]);
                        delete this.OrderIDs[creep.id];
                    }
                } else {
                    action = new UpgradeAction(creep, this.Hive.controller as StructureController);
                    if (creep.carry.energy > creep.carryCapacity * 0.75 && this.OrderIDs[creep.id]) {
                        //console.log('THIS IS NOT POSSIBLE { ArchitectureOverseer.CreepCarry }');
                        this.Queen.Distribution.CancelOrder(this.OrderIDs[creep.id]);
                    }
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

    AssignOrder(orderID: string): boolean {
        let orderDetails = this.Queen.Distribution.RetreiveOrderDetails(orderID);
        this.OrderIDs[orderDetails.toTarget]
        if (this.OrderIDs[orderDetails.toTarget] && this.Queen.Distribution.CheckOrderIDIsValid(this.OrderIDs[orderDetails.toTarget])) {
            console.log('THIS IS NOT POSSIBLE { ArchitectureOverseer.AssignOrder } -- Multiple order requests');
            return false;
        }
        this.OrderIDs[orderDetails.toTarget] = orderID;
        return true;
    }
}