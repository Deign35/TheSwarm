/*import * as SwarmEnums from "SwarmEnums";
import * as SwarmConsts from "SwarmConsts";
import { OverseerBase } from "Overseers/OverseerBase";
import { ActionBase } from "Actions/ActionBase";
import { TransferAction } from "Actions/TransferAction";
import { WithdrawAction } from "Actions/WithdrawAction";
import * as _ from "lodash";
import { SayAction } from "Actions/SayAction";

const CURRENT_ORDERS = 'CO';
const CREEP_DATA = 'CD';

const ORDER_STATE_WAIT = 'WAIT';
const ORDER_STATE_WITHDRAW = 'OSW';
const ORDER_STATE_DELIVER = 'OSD';

export class DistributionOverseer extends OverseerBase {
    // ISSUE: Distribution appears to go by the reverse order of creation or something.  It stays deterministic, but it means some things don't get filled up.
    AssignOrder(orderID: string): boolean {
        throw new Error("Method not implemented.");
    }
    protected CurrentOrders!: { [orderID: string]: DistributionOrder };
    protected AssignedCreeps!: { [creepName: string]: { orderID?: string, fromTarget?: string } }
    protected _orderData!: { [orderID: string]: { toTarget: Structure | Creep, fromTarget?: StructureContainer, creep?: Creep } };
    private readonly MaxDeliverers = 3;

    CreateNewDistributionOrder(requestor: Structure | Creep, resourceType: ResourceConstant, amount: number) {
        let orderID = ('' + Game.time).slice(-4) + '_' + ('' + Math.random() * 1000).slice(-3);
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
                this.AssignedCreeps[name] = {};
                unassignedCreeps.push(creep);
                continue;
            }
            orderID = orderID as string;
            let order = this.CurrentOrders[orderID];

            delete unassignedOrders[orderID];
            this._orderData[orderID].creep = creep;

            if (creep.carry[order.resourceType as string] >= order.amount || _.sum(creep.carry) == creep.carryCapacity) {
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
            let creep = unassignedCreeps.pop() as Creep;
            let order = this.FindOrderForCreep(creep);
            if (order) {
                this.AssignedCreeps[creep.name].orderID = order;
                delete unassignedOrders[order];
            } else {
                // Couldn't find a delivery order.
                break;
            }
        }
        let orderRatio = (Object.keys(unassignedOrders).length) >= (Object.keys(this.AssignedCreeps).length) * 3; // meaning 3 unassigned orders per creep or 1 creep per for 4orders
        if (unassignedCreeps.length == 0 && orderRatio) {
            registry.Requirements.Creeps.push({ time: 0, creepBody: SwarmConsts.BIG_DELIVERY });
        }
        this.Registry = registry;
    }

    ActivateOverseer() {
        let completedOrders: number[] = [];
        for (let orderID in this._orderData) {
            if (this.CurrentOrders[orderID].distributionStatus == ORDER_STATE_WAIT) {
                continue;
            }
            let resourceType = this.CurrentOrders[orderID].resourceType;
            let creep = this._orderData[orderID].creep as Creep;
            if (creep.spawning) continue;
            let amount;
            let target;
            let action: ActionBase;
            if (this.CurrentOrders[orderID].distributionStatus == ORDER_STATE_DELIVER) {
                target = this._orderData[orderID].toTarget as Structure | Creep;
                action = new TransferAction(creep, target, resourceType, amount)
            } else {
                target = this._orderData[orderID].fromTarget as StructureContainer;
                action = new WithdrawAction(creep, target, resourceType, amount);
            }
            let actionValidation = action.ValidateAction();
            if (actionValidation == SwarmEnums.CRT_NewTarget) {
                this.CancelOrder(orderID);
                continue;
            } else if (actionValidation != SwarmEnums.CRT_None && actionValidation != SwarmEnums.CRT_Next) {
                console.log('THIS IS NOT POSSIBLE { DistributionOverseer.actionValidation }' + actionValidation);
            }

            let actionResponse = action.Run();
            switch (actionResponse) {
                case (SwarmEnums.CRT_None): break;//?? break;
                case (SwarmEnums.CRT_Condition_Empty):
                    this.CancelOrder(orderID);
                    break; //Means we successfully Delivered.
                case (SwarmEnums.CRT_Condition_Full):
                    break; // Means we successfully Withdrew
                case (SwarmEnums.CRT_Next): console.log('THIS IS NOT POSSIBLE { DistributionOverseer.CRT_Next }'); break;
                case (SwarmEnums.CRT_NewTarget):
                    console.log(this.CurrentOrders[orderID].distributionStatus);
                    console.log('THIS IS NOT POSSIBLE { DistributionOverseer.CRT_NewTarget }');
                    break;

            }
        }

        for (let name in this.AssignedCreeps) {
            let creepIsBored = !this.AssignedCreeps[name].orderID ||
                this.CurrentOrders[this.AssignedCreeps[name].orderID as string].distributionStatus == ORDER_STATE_WAIT;
            if (creepIsBored) {
                let sayAction = new SayAction(Game.creeps[name], 'Im bored');
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

    protected FindOrderForCreep(creep: Creep) {
        let orderKeys = Object.keys(this.CurrentOrders);
        orderKeys.sort((a: string, b: string) => {
            if (this._orderData[a].creep) { return 1; } // already assigned.
            if (this._orderData[b].creep) { return -1; }
            let orderA = this.CurrentOrders[a];
            let needA = creep.carry[orderA.resourceType as string] > orderA.amount;
            let orderB = this.CurrentOrders[b];
            let needB = creep.carry[orderB.resourceType as string] > orderB.amount;

            if (needA != needB) {
                return needA ? -1 : 1;
            }

            let distA = creep.pos.findPathTo(this._orderData[a].toTarget).length;
            let distB = creep.pos.findPathTo(this._orderData[b].toTarget).length;
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

        return orderKeys[0];
    }

    protected FindContainerForCreep(fromPos: RoomPosition, resourceType: ResourceConstant, amount: number): StructureContainer | undefined {
        let containers = this.Queen.hivelord.FindTargets<STRUCTURE_CONTAINER>(FIND_STRUCTURES, 250, STRUCTURE_CONTAINER) as StructureContainer[];
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
            if (a.store[resourceType as string] >= amount && b.store[resourceType as string] < amount) {
                return -1;
            }
            if (b.store[resourceType as string] >= amount && a.store[resourceType as string] < amount) {
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
}*/