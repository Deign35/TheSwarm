import * as SwarmCodes from "Consts/SwarmCodes"
import { ImperatorBase } from "Imperators/ImperatorBase";
import { MoveToPositionAction } from "Actions/MoveToPositionAction";
import { SpawnConsul } from "Consuls/SpawnConsul";
import { HiveQueenBase } from "Queens/HiveQueenBase";
import { TransferAction } from "Actions/TransferAction";

export class SpawnImperator extends ImperatorBase {
    Consul!: SpawnConsul;
    InitImperator(memoryHandle: string): void {
        this.Consul = new SpawnConsul(memoryHandle, this.Queen);
        if(Game.time % 100 == 38) {
            this.Consul.ScanRoom();
        }
    }
    ImperatorComplete(): void {
        this.Consul.Save();
    }
    ActivateImperator(): SwarmCodes.SwarmErrors {
        let refiller = this.Consul.SpawnRefiller;
        // transfer energy from container or harvester
        // deliver to an extension or spawner.
        if (!refiller) {
            return SwarmCodes.C_NONE;
        }

        if(!this.Consul.RefillerData.fetching) {
            let targetId = this.Consul.RefillerData.extensionList[this.Consul.RefillerData.curTarget];
            let target = Game.getObjectById(targetId) as StructureExtension | StructureSpawn | StructureTower;
            if(!target) { return SwarmCodes.E_ACTION_UNNECESSARY; }

            let action = new TransferAction(refiller, target);
            let actionResult = action.ValidateAction();
            switch(actionResult) {
                case(SwarmCodes.C_NONE): break;
                case(SwarmCodes.E_INVALID): break;
                case(SwarmCodes.E_TARGET_INELLIGIBLE): break;
                case(SwarmCodes.C_MOVE):
                    new MoveToPositionAction(refiller, target.pos).Run(true);
                    break;
            }
            if(actionResult != SwarmCodes.C_MOVE) {
                let transferResult = action.Run();
                switch(transferResult) {
                    case(SwarmCodes.C_NONE):
                    case(SwarmCodes.E_TARGET_INELLIGIBLE):
                    case(SwarmCodes.E_ACTION_UNNECESSARY):
                        //get new target.
                        if(this.Queen.Nest.energyAvailable < this.Queen.Nest.energyCapacityAvailable) {
                            // We still have more to fill.
                            let cycleProtection = 0;
                            do {
                                if(cycleProtection++ > this.Consul.RefillerData.extensionList.length) {
                                    break;
                                }
                                this.Consul.RefillerData.curTarget++;
                                if(this.Consul.RefillerData.curTarget >= this.Consul.RefillerData.extensionList.length) {
                                    this.Consul.RefillerData.curTarget = 0;
                                }

                                let target = Game.getObjectById(this.Consul.RefillerData.extensionList[this.Consul.RefillerData.curTarget]) as StructureSpawn | StructureExtension;
                                if(target && target.energy != target.energyCapacity) {
                                    break;
                                }
                            } while(true);
                        }
                        break;
                }
            }
        }

        return SwarmCodes.C_NONE;
    }
}