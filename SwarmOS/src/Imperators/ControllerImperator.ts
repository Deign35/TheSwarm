import * as SwarmCodes from "Consts/SwarmCodes"
import { ImperatorBase } from "Imperators/ImperatorBase";
import { ControllerConsul } from "Consuls/ControllerConsul";
import { ActionBase } from "Actions/ActionBase";
import { UpgradeAction } from "Actions/UpgradeAction";
import { MoveToPositionAction } from "Actions/MoveToPositionAction";

export class ControllerImperator extends ImperatorBase {
    Consul!: ControllerConsul;
    InitImperator(memoryHandle: string): void {
        this.Consul = new ControllerConsul(memoryHandle, this.Queen);
    }
    ImperatorComplete(): void {
        this.Consul.Save();
    }
    ActivateImperator(): SwarmCodes.SwarmErrors {
        let creeps = this.Consul.UpgraderCreeps;
        let target = this.Consul.Controller;
        for(let i = 0, length = creeps.length; i < length; i++) {
            let creep = creeps[i];
            if(creep.spawning) { continue; }
            let upgradeAction: ActionBase = new UpgradeAction(creep, target);
            let upgradeResult = upgradeAction.ValidateAction();
            switch(upgradeResult) {
                case(SwarmCodes.C_NONE): break;
                case(SwarmCodes.C_MOVE):
                    new MoveToPositionAction(creep, target.pos).Run(true);
                    break;
                case(SwarmCodes.E_REQUIRES_ENERGY): break;
            }

            if(upgradeResult != SwarmCodes.C_MOVE) {
                upgradeAction.Run();
            }
        }

        return SwarmCodes.C_NONE;
    }
}