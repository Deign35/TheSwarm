import * as _ from "lodash";
import { OverseerBase } from "Overseers/OverseerBase";

const RCL_DATA = 'RCL';
export class ArchitectureOverseer extends OverseerBase {
    Hive: Room;
    protected ControllerData: {
        upgradeCreeps: { creepName: string, jobRequest: string}[],
        level: number,
    };

    Save() {
        this.SetData(RCL_DATA, this.ControllerData);
        super.Save();
    }

    Load() {
        super.Load();
        this.Hive = Game.rooms[this.ParentMemoryID];
        this.ControllerData = this.GetData(RCL_DATA) || {};
    }

    InitOverseerRegistry() {
        let registry = OverseerBase.CreateEmptyOverseerRegistry();

        return registry;
    }

    HasResources(): boolean { return false; } // It's just easier for now...

    ValidateOverseer() {
        let registry = OverseerBase.CreateEmptyOverseerRegistry();
        let upgradeData = this.ControllerData;
        let numUpgraders = 1;
        switch(upgradeData.level) {
            case(8): break;
            default: numUpgraders = 5;
        }
        if(upgradeData.upgradeCreeps.length < numUpgraders) {
            for(let i = 0, end = numUpgraders - upgradeData.upgradeCreeps.length; i < end; i++) {
                registry.Requirements.Creeps.push({time: 0, creepBody: [WORK, WORK, CARRY, MOVE] });
            }
        }

        for(let i = 0, length = upgradeData.upgradeCreeps.length; i < length; i++) {

        }

        this.Registry = registry;
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