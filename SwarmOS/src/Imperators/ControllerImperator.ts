import * as SwarmCodes from "Consts/SwarmCodes"
import { ImperatorBase } from "Imperators/ImperatorBase";
import { ControllerConsul } from "Consuls/ControllerConsul";
import { ActionBase } from "Actions/ActionBase";
import { UpgradeAction } from "Actions/UpgradeAction";
import { MoveToPositionAction } from "Actions/MoveToPositionAction";

const CONSUL_TYPE = 'Controller';
export class ControllerImperator extends ImperatorBase {
    static get ConsulType(): string { return CONSUL_TYPE; }
    get consulType(): string { return CONSUL_TYPE }
    protected Consul!: ControllerConsul;
    InitImperator(): void {
        this.Consul = new ControllerConsul(this.consulType, this.Queen);
    }
    ImperatorComplete(): void {
        this.Consul.Save();
    }
    ActivateImperator(): SwarmCodes.SwarmErrors {
        let creeps = this.Consul.CreepData;
        for (let i = 0, length = creeps.length; i < length; i++) {
            this.ActivateCreep(creeps[i]);
        }

        return SwarmCodes.C_NONE;
    }
    protected ActivateCreep(creepData: ControllerConsul_CreepData): void {
        let creep = Game.creeps[creepData.creepName];
        this.Queen.Nest.visual.text('' + creep.carry[RESOURCE_ENERGY], creep.pos);
        if (creep.spawning || creepData.fetching) { return; }
        let upgradeAction: ActionBase = new UpgradeAction(creep, this.Consul.Controller);
        let upgradeResult = upgradeAction.ValidateAction();

        if (upgradeResult == SwarmCodes.C_MOVE) {
            new MoveToPositionAction(creep, this.Consul.Controller.pos).Run(true);
        } else {
            upgradeAction.Run();
        }
    }
}