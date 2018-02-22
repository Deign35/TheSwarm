import * as SwarmCodes from "Consts/SwarmCodes"
import { ImperatorBase } from "Imperators/ImperatorBase";
import { DistributionConsul } from "Consuls/DistributionConsul";
import { MoveToPositionAction } from "Actions/MoveToPositionAction";
import { HiveQueenBase } from "Queens/HiveQueenBase";
import { TransferAction } from "Actions/TransferAction";

export class DistributionImperator extends ImperatorBase {
    Consul!: DistributionConsul;
    InitImperator(memoryHandle: string): void {
        this.Consul = new DistributionConsul(memoryHandle, this.Queen);
    }
    ImperatorComplete(): void {
        this.Consul.Save();
    }
    ActivateImperator(): SwarmCodes.SwarmErrors {
        let refiller = this.Consul.SpawnRefiller;
        if (!refiller) {
            return SwarmCodes.C_NONE;
        }

        if (!this.Consul.SpawnRefillerData.fetching) {
            let target = this.Consul.GetSpawnRefillerTarget() as StructureExtension | StructureSpawn | StructureTower;
            if (!target) { return SwarmCodes.E_ACTION_UNNECESSARY; } // This should not return from here.

            let action = new TransferAction(refiller, target);
            let actionResult = action.ValidateAction();
            switch (actionResult) {
                case (SwarmCodes.C_NONE): break;
                case (SwarmCodes.E_INVALID): break;
                case (SwarmCodes.E_TARGET_INELLIGIBLE): break;
                case (SwarmCodes.C_MOVE):
                    new MoveToPositionAction(refiller, target.pos).Run(true);
                    break;
            }
            if (actionResult != SwarmCodes.C_MOVE) {
                let transferResult = action.Run();
                switch (transferResult) {
                    case (SwarmCodes.C_NONE):
                    case (SwarmCodes.E_TARGET_INELLIGIBLE):
                    case (SwarmCodes.E_ACTION_UNNECESSARY):
                        console.log('DistributionResult: ' + transferResult); // What happens i wonder?
                        break;
                }
            }
        }

        return SwarmCodes.C_NONE;
    }
}