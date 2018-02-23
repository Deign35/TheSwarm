import * as SwarmCodes from "Consts/SwarmCodes"
import { ImperatorBase } from "Imperators/ImperatorBase";
import { DistributionConsul } from "Consuls/DistributionConsul";
import { MoveToPositionAction } from "Actions/MoveToPositionAction";
import { HiveQueenBase } from "Queens/HiveQueenBase";
import { TransferAction } from "Actions/TransferAction";

const CONSUL_TYPE = 'Distribution';
export class DistributionImperator extends ImperatorBase {
    static get ConsulType(): string { return CONSUL_TYPE; }
    get consulType(): string { return CONSUL_TYPE }
    protected Consul!: DistributionConsul;
    InitImperator(): void {
        this.Consul = new DistributionConsul(this.consulType, this.Queen);
    }
    ImperatorComplete(): void {
        this.Consul.Save();
    }
    ActivateImperator(): SwarmCodes.SwarmErrors {
        let refiller = this.Consul.SpawnRefiller;
        if (!refiller) {
            return SwarmCodes.C_NONE;
        }
        this.ActivateCreep(this.Consul.CreepData[0]);

        return SwarmCodes.C_NONE;
    }
    GetDistributionIdleTime() {
        return this.Consul.GetIdleTime();
    }
    protected ActivateCreep(creepData: DistributionConsul_RefillerData): void {
        let creep = Game.creeps[creepData.creepName];
        if (!this.Consul.SpawnRefillerData.fetching) {
            let target = this.Consul.GetSpawnRefillerTarget() as SpawnRefillTarget;
            if (!target) { return; } // This should not return from here.

            let action = new TransferAction(creep, target);
            let actionResult = action.ValidateAction();
            switch (actionResult) {
                case (SwarmCodes.C_NONE): break;
                case (SwarmCodes.E_INVALID): break;
                case (SwarmCodes.E_TARGET_INELLIGIBLE): break;
                case (SwarmCodes.C_MOVE):
                    new MoveToPositionAction(creep, target.pos).Run(true);
                    break;
            }
            if (actionResult != SwarmCodes.C_MOVE) {
                let transferResult = action.Run();
                switch (transferResult) {
                    case (SwarmCodes.C_NONE): break;
                    case (SwarmCodes.E_TARGET_INELLIGIBLE):
                    case (SwarmCodes.E_ACTION_UNNECESSARY):
                        console.log('DistributionResult: ' + transferResult); // What happens i wonder?
                        break;
                }
            }
        }
    }
}