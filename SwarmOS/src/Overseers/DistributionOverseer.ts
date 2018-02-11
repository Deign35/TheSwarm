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
                registry.Requirements.Creeps.push({
                    time: 0,
                    creepBody: [CARRY, MOVE, CARRY, MOVE]
                });
                continue;
            }
            if (!this.CurrentOrders[i].fromTarget) {
                let toTarget = Game.getObjectById(this.CurrentOrders[i].toTarget as string) as Structure | Creep;
                let possibleTargets = (this.Parent as HiveQueen).hivelord.FindTargets<STRUCTURE_CONTAINER>(FIND_STRUCTURES, STRUCTURE_CONTAINER);
                (possibleTargets as StructureContainer[]).sort((a: StructureContainer, b: StructureContainer) => {
                    if (!a.store[this.CurrentOrders[i].resourceType] || a.store[this.CurrentOrders[i].resourceType] < this.CurrentOrders[i].amount) {
                        return -1;
                    }
                    if (!b.store[this.CurrentOrders[i].resourceType] || b.store[this.CurrentOrders[i].resourceType] < this.CurrentOrders[i].amount) {
                        return 1;
                    }


                    return 0;
                })
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
            let creep = Game.getObjectById(this.CurrentOrders[index].creepName) as Creep;
            if (creep.spawning) {
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
                case (SwarmEnums.CRT_NewTarget): console.log('THIS IS NOT POSSIBLE { DistributionOverseer.CRT_NewTarget }'); break;
            }
        }
        for (let i = completedOrders.length; i > 1; i--) {
            this.CurrentOrders.splice(completedOrders[i], 1);
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
        console.log('Assign to DO');
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