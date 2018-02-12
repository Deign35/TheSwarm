import * as SwarmEnums from "SwarmEnums";
import { OverseerBase } from "Overseers/OverseerBase";
import { ActionBase } from "Actions/ActionBase";
import { TransferAction } from "Actions/TransferAction";
import { WithdrawAction } from "Actions/WithdrawAction";
import * as _ from "lodash";

const CURRENT_ORDERS = 'CO';
const CREEP_DATA = 'CD';

const ORDER_STATE_WAIT = 'WAIT';
const ORDER_STATE_WITHDRAW = 'OSW';
const ORDER_STATE_DELIVER = 'OSD';

export class DistributionOverseer extends OverseerBase {
    AssignOrder(orderID: string): boolean {
        throw new Error("Method not implemented.");
    }
    Hive!: Room;
    protected CurrentOrders!: { [orderID: string]: DistributionOrder };
    protected AssignedCreeps!: { [creepName: string]: { orderID?: string, fromTarget?: string } }
    protected _orderData!: { [orderID: string]: { toTarget: Structure | Creep, fromTarget?: StructureContainer, creep?: Creep } };
    private readonly MaxDeliverers = 3;

    CreateNewDistributionOrder(requestor: Structure | Creep, resourceType: ResourceConstant, amount: number) {
        let orderID = ('' + Game.time).slice(-4) + '_' + ('' + Math.random() * 1000).slice(-3);
        console.log(orderID);
        if (this.CurrentOrders[orderID]) {
            console.log('what are the odds...');
            orderID = Game.time + '' + Math.random;
        }
        let newOrder = { toTarget: requestor.id, resourceType: resourceType, amount: amount, distributionStatus: ORDER_STATE_WAIT }
        this.CurrentOrders[orderID] = newOrder;
        return orderID;
    }

    Save() {
        this.SetData(CURRENT_ORDERS, this.CurrentOrders);
        this.SetData(CREEP_DATA, this.AssignedCreeps);
        super.Save();
    }

    Load() {
        super.Load();
        this.Hive = Game.rooms[this.ParentMemoryID];
        this.CurrentOrders = this.GetData(CURRENT_ORDERS) || {};
        this.AssignedCreeps = this.GetData(CREEP_DATA) || {};
        this._orderData = {};
    }

    HasResources(): boolean { return false; } // It's just easier for now...

    ValidateOverseer() {
        let registry = OverseerBase.CreateEmptyOverseerRegistry();
        let orderCount = 0;
        for (let orderID in this.CurrentOrders) { // Cancel expired orders.
            let order = this.CurrentOrders[orderID];
            this._orderData[orderID] = {
                toTarget: Game.getObjectById(order.toTarget) as Structure | Creep
            };
            if (!this._orderData[orderID].toTarget) {
                console.log('could not find the order target: ' + order.toTarget);
                // Delivery Target is gone, end
                this.CancelOrder(orderID);
                continue;
            }
            this.CurrentOrders[orderID].distributionStatus = ORDER_STATE_WAIT;
            orderCount++;
        }

        let unassignedCreeps: Creep[] = [];
        let unassignedOrders = JSON.parse(JSON.stringify(this.CurrentOrders)) as { [orderID: string]: DistributionOrder };
        for (let name in this.AssignedCreeps) {
            if (!Game.creeps[name]) {
                // Creep is gone.
                console.log('assigned creep died');
                delete this.AssignedCreeps[name];
                continue;
            }
            let creep = Game.creeps[name];

            let orderID = (this.AssignedCreeps[name].orderID && this.AssignedCreeps[name].orderID) as string || undefined;
            let validOrder = orderID && this.CheckOrderIDIsValid(orderID);
            if (!validOrder) {
                console.log('creep[' + creep.name + '] has no assignment');
                this.AssignedCreeps[name] = {};
                unassignedCreeps.push(creep);
                continue;
            }
            orderID = orderID as string;
            let order = this.CurrentOrders[orderID];
            console.log('creep[' + creep.name + '] has order[' + orderID + ']');

            delete unassignedOrders[orderID];
            this._orderData[orderID].creep = creep;

            if (creep.carry[order.resourceType] >= order.amount || _.sum(creep.carry) == creep.carryCapacity) {
                this.CurrentOrders[orderID].distributionStatus = ORDER_STATE_DELIVER
            } else {
                let fromContainer = this.AssignedCreeps[name].fromTarget && Game.getObjectById(this.AssignedCreeps[name].fromTarget) as StructureContainer;
                if (!fromContainer) {
                    fromContainer = this.FindContainerForCreep(creep.pos, order.resourceType, order.amount);
                }
                if (fromContainer) {
                    this.AssignedCreeps[creep.name].fromTarget = fromContainer.id;
                    this.CurrentOrders[orderID].distributionStatus = ORDER_STATE_WITHDRAW
                    this._orderData[orderID].fromTarget = fromContainer;
                } else {
                    console.log('Could not find a container');
                }
            }
        }

        while (unassignedCreeps.length > 0 && Object.keys(unassignedOrders).length > 0) {
            let orderID = Object.keys(unassignedOrders)[0];
            console.log('looking for a creep for order: ' + orderID);
            let order = this.CurrentOrders[orderID];
            if (order.distributionStatus != ORDER_STATE_WAIT) {
                console.log('THIS IS NOT POSSIBLE { DistributionOverseer.unassignedCreeps } -- Didnt remove order thats ready');
            }
            unassignedCreeps.sort((creepA: Creep, creepB: Creep) => {
                let aHasEnough = creepA.carry[order.resourceType] && creepA.carry[order.resourceType] > order.amount;
                let bHasEnough = creepB.carry[order.resourceType] && creepB.carry[order.resourceType] > order.amount;

                if (aHasEnough && !bHasEnough) {
                    return -1;
                } else if (bHasEnough && !aHasEnough) {
                    return 1;
                } else if (!aHasEnough && !bHasEnough) {
                    if (creepA.carryCapacity >= order.amount && creepB.carryCapacity < order.amount) {
                        return -1;
                    }
                    if (creepB.carryCapacity >= order.amount && creepA.carryCapacity < order.amount) {
                        return 1;
                    }
                }

                // Yes or no on both, so check for an available path and the distance along that path.
                var distA = creepA.pos.findPathTo(Game.getObjectById(order.toTarget) as RoomObject).length;
                var distB = creepB.pos.findPathTo(Game.getObjectById(order.toTarget) as RoomObject).length; // little repeat on getObj here.
                // REALLY WANT TO CACHE THIS!!!!!!!
                if (distA == 0) {
                    return 1;
                }
                if (distB == 0) {
                    return -1;
                }

                // Path found to both locations, check distance
                if (distA < distB) {
                    return -1;
                }
                if (distB < distA) {
                    return 1;
                }
                // No more ways to compare at this time.
                return 0;
            });

            this.AssignedCreeps[unassignedCreeps[0].name].orderID = orderID;
            delete unassignedOrders[orderID];
        }
        let orderRatio = (Object.keys(unassignedOrders).length) > (Object.keys(this.AssignedCreeps).length) * 3; // meaning 3 unassigned orders per creep or 1 creep per for 4orders
        if (unassignedCreeps.length == 0 && orderRatio) {
            registry.Requirements.Creeps.push({ time: 0, creepBody: [CARRY, MOVE] });
        }
        this.Registry = registry;
    }

    ActivateOverseer() {
        debugger;
        let completedOrders: number[] = [];
        for (let orderID in this._orderData) {
            if (this.CurrentOrders[orderID].distributionStatus == ORDER_STATE_WAIT) {
                continue;
            }
            let resourceType = this.CurrentOrders[orderID].resourceType;
            let creep = this._orderData[orderID].creep as Creep;
            //let amount = this.CurrentOrders[orderID].amount;
            // This could be changed to just withdraw the full amount and deliver them back when no orders or 
            // what about depositing anything on this creep before withdrawing.
            let amount = Math.min(creep.carryCapacity - _.sum(creep.carry), this.CurrentOrders[orderID].amount)
            let target = this.CurrentOrders[orderID].distributionStatus == ORDER_STATE_DELIVER ?
                this._orderData[orderID].toTarget as Structure | Creep :
                this._orderData[orderID].fromTarget as StructureContainer;
            let action: ActionBase = this.CurrentOrders[orderID].distributionStatus == ORDER_STATE_DELIVER ?
                new TransferAction(creep, target, resourceType, amount) :
                new WithdrawAction(creep, target as StructureContainer, resourceType, amount);

            let actionValidation = action.ValidateAction();
            if (actionValidation != SwarmEnums.CRT_None) {
                // NewTarget and Next
                console.log('THIS IS NOT POSSIBLE { DistributionOverseer.actionValidation } -- Couldnt find a delivery target');
            }

            debugger;
            let actionResponse = action.Run(true);
            switch (actionResponse) {
                case (SwarmEnums.CRT_None): console.log('THIS IS NOT POSSIBLE { DistributionOverseer.CRT_None }'); break;
                case (SwarmEnums.CRT_Condition_Empty):
                    console.log('order canceled because it was successful?')
                    this.CancelOrder(orderID);
                    break; //Means we successfully Delivered.
                case (SwarmEnums.CRT_Condition_Full):
                    break; // Means we successfully Withdrew
                case (SwarmEnums.CRT_Next): console.log('THIS IS NOT POSSIBLE { DistributionOverseer.CRT_Next }'); break;
                case (SwarmEnums.CRT_NewTarget):
                    console.log('THIS IS NOT POSSIBLE { DistributionOverseer.CRT_NewTarget }');
                    break;

            }
        }
    }
    RetreiveOrderDetails(id: string): DistributionOrder {
        return this.CurrentOrders[id];
    }

    CheckOrderIDIsValid(id: string): boolean {
        return this.CurrentOrders[id] ? true : false;
    }

    CancelOrder(id: string) {
        debugger;
        delete this.CurrentOrders[id];
        delete this._orderData[id];
        for (let creepName in this.AssignedCreeps) {
            if (this.AssignedCreeps[creepName].orderID == id) {
                this.AssignCreep(creepName);
            }
        }
    }

    AssignCreep(creepName: string): void {
        this.AssignedCreeps[creepName] = {};
    }

    ReleaseCreep(creepName: string, releaseReason: string) {
        delete this.AssignedCreeps[creepName];
    }

    protected FindContainerForCreep(fromPos: RoomPosition, resourceType: ResourceConstant, amount: number): StructureContainer | undefined {
        let containers = this.Queen.hivelord.FindTargets<STRUCTURE_CONTAINER>(FIND_STRUCTURES, STRUCTURE_CONTAINER) as StructureContainer[];
        if (containers.length == 0) { return; }
        containers.sort((a: StructureContainer, b: StructureContainer) => {
            // Contains the resource?
            if (!a.store[resourceType]) {
                return 1;
            }
            if (!b.store[resourceType]) {
                return -1;
            }

            // Yes, do they have enough?
            if (a.store[resourceType] >= amount && b.store[resourceType] < amount) {
                return -1;
            }
            if (b.store[resourceType] >= amount && a.store[resourceType] < amount) {
                return 1;
            }

            // Yes or no on both, so check for an available path and the distance along that path.
            var distA = fromPos.findPathTo(a).length;
            var distB = fromPos.findPathTo(b).length;
            // REALLY WANT TO CACHE THIS!!!!!!!
            if (distA == 0) {
                return 1;
            }
            if (distB == 0) {
                return -1;
            }

            // Path found to both locations, check distance
            if (distA < distB) {
                return -1;
            }
            if (distB < distA) {
                return 1;
            }
            // No more ways to compare at this time.
            return 0;
        });
        return containers[0];
    }
}