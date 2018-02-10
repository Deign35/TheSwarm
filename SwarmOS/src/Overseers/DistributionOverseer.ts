import { OverseerBase } from "Overseers/OverseerBase";
import { HiveQueen } from "Managers/HiveQueen";
import * as SwarmEnums from "SwarmEnums";
import { HarvestAction } from "Actions/HarvestAction";
import { MoveToPositionAction } from "Actions/MoveToPositionAction";
import { ActionBase } from "Actions/ActionBase";
import { BuildAction } from "Actions/BuildAction";
import { RepairAction } from "Actions/RepairAction";
import { DropAction } from "Actions/DropAction";
import * as _ from "lodash";
import { WithdrawAction } from "Actions/WithdrawAction";
import { TransferAction } from "Actions/TransferAction";

const CURRENT_ORDERS = 'CO';
export class DistributionOverseer extends OverseerBase {
    Hive: Room;
    protected CurrentOrders: [{
        creepID?: string,
        fromTarget?: string,
        toTarget: string,
        resourceType: ResourceConstant,
        amount: number
    }]; // Add resourceType
    private readonly MaxDeliverers = 3;

    Save() {
        this.SetData(CURRENT_ORDERS, this.CurrentOrders);
        super.Save();
    }

    Load() {
        super.Load();
        this.Hive = Game.rooms[this.ParentMemoryID];
        this.CurrentOrders = this.GetData(CURRENT_ORDERS) || {};
    }

    InitOverseerRegistry() {
        let registry = OverseerBase.CreateEmptyOverseerRegistry();
        // Find a way to calculate by needs.

        return registry;
    }

    HasResources(): boolean { return true; } // It's just easier for now...
    HasRequirements(): boolean {
        // Find a way to calculate by needs.

        return false;
    }

    ValidateOverseer() {
        for (let index in this.CurrentOrders) {
            // Try to find a place to withdraw from that has enough shtuff.
        }
    }

    ActivateOverseer() {
        let completedOrders: number[] = [];
        for (let index = 0, length = this.CurrentOrders.length; index < length; index++) {
            if (!this.CurrentOrders[index].creepID) {
                continue;
            }

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

            // Check if harvest worked
            switch (actionResponse) {
                case (SwarmEnums.CRT_None): console.log('THIS IS NOT POSSIBLE { DistributionOverseer.CRT_None }'); break;
                case (SwarmEnums.CRT_Condition_Empty):
                    this.ReassignCreep(creep);
                    completedOrders.push(index);
                    break; //Means we successfully Delivered.
                case (SwarmEnums.CRT_Condition_Full):
                    break; // Means we successfully Withdrew
                case (SwarmEnums.CRT_Next): console.log('THIS IS NOT POSSIBLE { DistributionOverseer.CRT_Next }'); break;
                case (SwarmEnums.CRT_NewTarget): break; // Did not harvest, needed to move.
            }
        }
        for (let i = completedOrders.length; i > 1; i--) {
            this.CurrentOrders.splice(completedOrders[i], 1);
        }
    }

    AssignCreep(creepName: string): void {
        // Make sure the creep can carry enough for the job before assigning it an order.
        for (let i = 0, length = this.CurrentOrders.length; i < length; i++) {
            if (!this.CurrentOrders[i].creepID) {
                this.CurrentOrders[i].creepID = creepName;
                break;
            }
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