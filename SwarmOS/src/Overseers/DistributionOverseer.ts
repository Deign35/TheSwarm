import * as SwarmEnums from "SwarmEnums";
import { OverseerBase } from "Overseers/OverseerBase";
import { ActionBase } from "Actions/ActionBase";
import { TransferAction } from "Actions/TransferAction";
import { WithdrawAction } from "Actions/WithdrawAction";
import { HiveQueen } from "Managers/HiveQueen";

const CURRENT_ORDERS = 'CO';
const IDLE_CREEPS = 'IC';
export class DistributionOverseer extends OverseerBase {
    AssignOrder(order: DistributionOrder): boolean {
        throw new Error("Method not implemented.");
    }
    Hive: Room;
    protected CurrentOrders: DistributionOrder[];
    protected idleCreeps: string[];
    private readonly MaxDeliverers = 3;

    CreateNewDistributionOrder(requestor: Structure | Creep, resourceType: ResourceConstant, amount: number) {
        let orderID = ('' + Game.time).slice(-4) + '_' + ('' + Math.random() * 1000).slice(-3);
        let newOrder = { orderID: orderID, toTarget: requestor.id, resourceType: resourceType, amount: amount }
        this.CurrentOrders.push(newOrder);

        return newOrder;
    }

    Save() {
        this.SetData(CURRENT_ORDERS, this.CurrentOrders);
        this.SetData(IDLE_CREEPS, this.idleCreeps);
        super.Save();
    }

    Load() {
        super.Load();
        this.Hive = Game.rooms[this.ParentMemoryID];
        this.CurrentOrders = this.GetData(CURRENT_ORDERS) || [];
        this.idleCreeps = this.GetData(IDLE_CREEPS) || [];
    }

    HasResources(): boolean { return false; } // It's just easier for now...

    ValidateOverseer() {
        let registry = OverseerBase.CreateEmptyOverseerRegistry();
        let creepCount = 0;
        for (let i = 0, length = this.CurrentOrders.length; i < length; i++) {
            if (!this.CurrentOrders[i].creepName || !(Game.creeps[this.CurrentOrders[i].creepName as string]) && i >= creepCount * 3) {
                if(this.CurrentOrders[i].creepName) {delete this.CurrentOrders[i].creepName; }
                if(this.idleCreeps.length > 0) {
                    this.CurrentOrders[i].creepName = this.idleCreeps.splice(0, 1)[0];
                } else {
                    registry.Requirements.Creeps.push({
                        time: 0,
                        creepBody: [CARRY, MOVE, CARRY, MOVE]
                    });
                }
                continue;
            }
            if(!Game.getObjectById(this.CurrentOrders[i].toTarget)) {
                // Delivery Target is gone, end
                this.CancelOrder(this.CurrentOrders[i--].orderID);
                continue;
            }
            if (!this.CurrentOrders[i].fromTarget) {
                let toTarget = Game.getObjectById(this.CurrentOrders[i].toTarget as string) as Structure | Creep;
                let possibleTargets = (this.Parent as HiveQueen).hivelord.FindTargets<STRUCTURE_CONTAINER>(FIND_STRUCTURES, STRUCTURE_CONTAINER);
                if(possibleTargets.length > 0) {
                    (possibleTargets as StructureContainer[]).sort((a: StructureContainer, b: StructureContainer) => {
                        if (!a.store[this.CurrentOrders[i].resourceType] || a.store[this.CurrentOrders[i].resourceType] < this.CurrentOrders[i].amount) {
                            return -1;
                        }
                        if (!b.store[this.CurrentOrders[i].resourceType] || b.store[this.CurrentOrders[i].resourceType] < this.CurrentOrders[i].amount) {
                            return 1;
                        }
                        var distA = toTarget.pos.findPathTo(a).length;
                        var distB = toTarget.pos.findPathTo(b).length;
                        if (distA == 0) {
                            return 1;
                        }
                        if (distB == 0) {
                            return -1;
                        }
                        return distA < distB ? -1 : (distA > distB ? 1 : 0);
                    });
                    let unverifiedTarget = possibleTargets[0] as StructureContainer;
                    if(unverifiedTarget.store && unverifiedTarget.store[this.CurrentOrders[i].resourceType] &&
                        unverifiedTarget.store[this.CurrentOrders[i].resourceType] > this.CurrentOrders[i].amount) {

                            this.CurrentOrders[i].fromTarget = unverifiedTarget.id;
                    }
                }
            }
            if (++creepCount >= this.MaxDeliverers) {
                //registry = OverseerBase.CreateEmptyOverseerRegistry();
                break;
            }
        }

        this.Registry = registry;
    }

    ActivateOverseer() {
        let completedOrders: number[] = [];
        for (let index = 0, length = this.CurrentOrders.length; index < length; index++) {
            if (!this.CurrentOrders[index].creepName || !this.CurrentOrders[index].fromTarget) { continue; }
            let creep = Game.creeps[this.CurrentOrders[index].creepName as string];
            if (!creep || creep.spawning) {
                continue;
            }

            let resourceType = this.CurrentOrders[index].resourceType;
            let amount = this.CurrentOrders[index].amount;

            let action: ActionBase | undefined;
            let target;
            if (creep.carry.energy >= amount) {
                // Then we are delivering
                target = Game.getObjectById(this.CurrentOrders[index].toTarget) as Structure | Creep;
                if (!target) {
                    // This job is complete, end it.
                    this.ReassignCreep(creep.name);
                    continue;
                }
                action = new TransferAction(creep, target, resourceType, amount)
            } else {
                // Then we are withdrawing
                target = Game.getObjectById(this.CurrentOrders[index].fromTarget) as Structure;
                if (!target) {
                    // The withdraw target has been destroyed.  Need to find a new one.
                    delete this.CurrentOrders[index].fromTarget;
                    delete this.CurrentOrders[index].creepName;
                    this.ReassignCreep(creep.name);
                    continue;
                }
                action = new WithdrawAction(creep, target, resourceType, amount);
            }

            let actionValidation = action.ValidateAction();
            if (actionValidation != SwarmEnums.CRT_None) {
                // NewTarget and Next
                console.log('THIS IS NOT POSSIBLE { DistributionOverseer.actionValidation }');
            }

            let actionResponse = action.Run();
            switch (actionResponse) {
                case (SwarmEnums.CRT_None): console.log('THIS IS NOT POSSIBLE { DistributionOverseer.CRT_None }'); break;
                case (SwarmEnums.CRT_Condition_Empty):
                    this.ReassignCreep(creep.name);
                    completedOrders.push(index);
                    break; //Means we successfully Delivered.
                case (SwarmEnums.CRT_Condition_Full):
                    break; // Means we successfully Withdrew
                case (SwarmEnums.CRT_Next): console.log('THIS IS NOT POSSIBLE { DistributionOverseer.CRT_Next }'); break;
                case (SwarmEnums.CRT_NewTarget):
                    console.log('THIS IS NOT POSSIBLE { DistributionOverseer.CRT_NewTarget }');
                    // This appears to occur when the creep is unable to give over the resources.
                    // There also appears to be an issue with trying to push x resources to something with space for less.
                    break;

            }
        }
        for (let i = completedOrders.length; i > 0; i--) {
            let cutOrder = this.CurrentOrders.splice(completedOrders[i], 1);
            this.ReassignCreep(cutOrder[0].creepName as string);
        }
    }

    CheckOrderIDIsValid(id: string): boolean {
        for (let i = 0, length = this.CurrentOrders.length; i < length; i++) {
            if (id == this.CurrentOrders[i].orderID) {
                return true;
            }
        }
        return false;
    }

    CancelOrder(id: string) {
        for (let i = 0, length = this.CurrentOrders.length; i < length; i++) {
            if (id == this.CurrentOrders[i].orderID) {
                let cancelledOrder = this.CurrentOrders.splice(i, 1)[0];
                if (cancelledOrder.creepName) {
                    this.ReassignCreep(cancelledOrder.creepName)
                }
                return;
            }
        }
    }

    AssignCreep(creepName: string): void {
        let orderFound = false;
        // Make sure the creep can carry enough for the job before assigning it an order.
        for (let i = 0, length = this.CurrentOrders.length; i < length; i++) {
            if (!this.CurrentOrders[i].creepName) {
                this.CurrentOrders[i].creepName = creepName;
                orderFound = true;
                break;
            }
        }

        if (!orderFound) {
            this.idleCreeps.push(creepName);
        }
    }

    ReleaseCreep(creepName: string, releaseReason: string) {
        for (let i = 0, length = this.CurrentOrders.length; i < length; i++) {
            if (this.CurrentOrders[i].creepName == creepName) {
                delete this.CurrentOrders[i].creepName;
                break;
            }
        }
    }

    protected ReassignCreep(creepName: string): void {
        this.ReleaseCreep(creepName, 'Reassignment');
        this.AssignCreep(creepName);
    }
}