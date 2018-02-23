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
        let buildData = this.Consul.CreepData;
        for (let i = 0, length = buildData.length; i < length; i++) {
            if (buildData[i].fetching || buildData[i].target == '') { continue; }
            let creep = Game.creeps[buildData[i].creepName];
            this.Queen.Nest.visual.text('Cons', creep.pos);
            let site = Game.constructionSites[buildData[i].target];
            if (!site) { continue; }
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