import * as SwarmCodes from "Consts/SwarmCodes"
import { ImperatorBase } from "Imperators/ImperatorBase";
import { ConstructionConsul } from "Consuls/ConstructionConsul";
import { BuildAction } from "Actions/BuildAction";
import { MoveToPositionAction } from "Actions/MoveToPositionAction";

export class ConstructionImperator extends ImperatorBase {
    Consul!: ConstructionConsul;
    InitImperator(memoryHandle: string): void {
        this.Consul = new ConstructionConsul(memoryHandle, this.Queen);
    }
    ImperatorComplete(): void {
        this.Consul.Save();
    }
    ActivateImperator(): SwarmCodes.SwarmErrors {
        let buildData = this.Consul.BuilderData;
        for (let i = 0, length = buildData.length; i < length; i++) {
            let creep = Game.creeps[buildData[i].creepName];
            let site = Game.constructionSites[buildData[i].target];
            let buildAction = new BuildAction(creep, site);
            let buildResult = buildAction.ValidateAction();
            switch (buildResult) {
                case (SwarmCodes.C_MOVE):
                    new MoveToPositionAction(creep, site.pos).Run(true);
                    break;
                case (SwarmCodes.C_NONE): break;
                case (SwarmCodes.E_REQUIRES_ENERGY): break; // Release it?
            }
            if (buildResult != SwarmCodes.C_MOVE) {
                buildAction.Run();
            }
        }

        return SwarmCodes.C_NONE;
    }
}