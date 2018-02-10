import * as SwarmEnums from "SwarmEnums";
import { OverseerBase } from "Overseers/OverseerBase";
import { ActionBase } from "Actions/ActionBase";
import { TransferAction } from "Actions/TransferAction";
import { WithdrawAction } from "Actions/WithdrawAction";

const CURRENT_ORDERS = 'CO';
const IDLE_CREEPS = 'IC';
export class DistributionOverseer extends OverseerBase {
    Hive: Room;
    protected CurrentOrders: {
        creepID?: string,
        fromTarget?: string,
        toTarget: string,
        resourceType: ResourceConstant,
        amount: number
    }[];
    protected idleCreeps: string[];
    private readonly MaxDeliverers = 3;

    CreateNewDistributionOrder(requestor: Structure | Creep, resourceType: ResourceConstant, amount: number) {
        this.CurrentOrders.push({toTarget: requestor.id, resourceType: resourceType, amount: amount});
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
            if (!this.CurrentOrders[i].creepID || !(Game.creeps[this.CurrentOrders[i].creepID as string]) && i >= creepCount * 3) {
                registry.Requirements.Creeps.push({
                    time: 0,
                    creepBody: [CARRY, MOVE, CARRY, MOVE]
                });
                continue;
            }
            if(!this.CurrentOrders[i].fromTarget) {
                let toTarget: RoomObject = Game.getObjectById(this.CurrentOrders[i].toTarget) as RoomObject;
                registry.Requirements.Resources.push({ location: toTarget, amount: this.CurrentOrders[i].amount, type: this.CurrentOrders[i].resourceType})
            }
            if(++creepCount >= this.MaxDeliverers) {
                //registry = OverseerBase.CreateEmptyOverseerRegistry();
                break;
            }
        }

        this.Registry = registry;
    }

    ActivateOverseer() {
        let completedOrders: number[] = [];
        for (let index = 0, length = this.CurrentOrders.length; index < length; index++) {
            if(!this.CurrentOrders[index].creepID || !this.CurrentOrders[index].fromTarget) { continue; }
            let creep = Game.getObjectById(this.CurrentOrders[index].creepID) as Creep;
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
                    this.ReassignCreep(creep);
                    continue;
                }
                action = new TransferAction(creep, target, resourceType, amount)
            } else {
                // Then we are withdrawing
                target = Game.getObjectById(this.CurrentOrders[index].fromTarget) as Structure;
                if (!target) {
                    // The withdraw target has been destroyed.  Need to find a new one.
                    delete this.CurrentOrders[index].fromTarget;
                    delete this.CurrentOrders[index].creepID;
                    this.ReassignCreep(creep);
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
                    this.ReassignCreep(creep);
                    completedOrders.push(index);
                    break; //Means we successfully Delivered.
                case (SwarmEnums.CRT_Condition_Full):
                    break; // Means we successfully Withdrew
                case (SwarmEnums.CRT_Next): console.log('THIS IS NOT POSSIBLE { DistributionOverseer.CRT_Next }'); break;
                case (SwarmEnums.CRT_NewTarget):  console.log('THIS IS NOT POSSIBLE { DistributionOverseer.CRT_NewTarget }'); break;
            }
        }
        for (let i = completedOrders.length; i > 1; i--) {
            this.CurrentOrders.splice(completedOrders[i], 1);
        }
    }

    AssignCreep(creepName: string): void {
        let orderFound = false;
        // Make sure the creep can carry enough for the job before assigning it an order.
        for (let i = 0, length = this.CurrentOrders.length; i < length; i++) {
            if (!this.CurrentOrders[i].creepID) {
                this.CurrentOrders[i].creepID = creepName;
                orderFound = true;
                break;
            }
        }

        if(!orderFound) {
            this.idleCreeps.push(creepName);
        }
    }

    ReleaseCreep(creepName: string, releaseReason: string) {
        for (let i = 0, length = this.CurrentOrders.length; i < length; i++) {
            if (this.CurrentOrders[i].creepID == creepName) {
                delete this.CurrentOrders[i].creepID;
                break;
            }
        }
    }

    protected ReassignCreep(creep: Creep): void {
        this.ReleaseCreep(creep.name, 'Reassignment');
        this.AssignCreep(creep.name);
    }
}