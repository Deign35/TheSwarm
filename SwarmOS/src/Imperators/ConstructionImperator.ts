import * as SwarmCodes from "Consts/SwarmCodes"
import { ImperatorBase } from "Imperators/ImperatorBase";
import { ConstructionConsul } from "Consuls/ConstructionConsul";
import { BuildAction } from "Actions/BuildAction";
import { MoveToPositionAction } from "Actions/MoveToPositionAction";

export class ConstructionImperator extends ImperatorBase {
    ActivateCreep(creepData: ConstructorData): SwarmCodes.SwarmlingResponse {
        if (creepData.fetching || creepData.target == '') { return SwarmCodes.C_NONE; }
        let creep = Game.creeps[creepData.creepName];
        let site = Game.constructionSites[creepData.target];
        if (!site) { return SwarmCodes.C_NONE; }
        let buildAction = new BuildAction(creep, site);
        let buildResult = buildAction.ValidateAction();
        if (buildResult == SwarmCodes.C_MOVE) {
            new MoveToPositionAction(creep, site.pos).Run(true);
        } else {
            buildAction.Run();
        }

        return SwarmCodes.C_NONE;
    }
}