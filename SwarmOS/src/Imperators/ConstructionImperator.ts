import { ImperatorBase } from "Imperators/ImperatorBase";
import { BuildAction } from "Actions/BuildAction";
import { MoveToPositionAction } from "Actions/MoveToPositionAction";

export class ConstructionImperator extends ImperatorBase {
    ActivateCreep(creepData: ConstructorData): SwarmlingResponse {
        if (creepData.fetching || creepData.target == '') { return C_NONE; }
        let creep = Game.creeps[creepData.creepName];
        let site = Game.constructionSites[creepData.target];
        if (!site) { return C_NONE; }
        let buildAction = new BuildAction(creep, site);
        let buildResult = buildAction.ValidateAction();
        if (buildResult == C_MOVE) {
            new MoveToPositionAction(creep, site.pos).Run(true);
        } else {
            buildAction.Run();
        }

        return C_NONE;
    }
}