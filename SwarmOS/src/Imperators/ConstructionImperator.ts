import * as SwarmCodes from "Consts/SwarmCodes"
import { ImperatorBase } from "Imperators/ImperatorBase";
import { ConstructionConsul } from "Consuls/ConstructionConsul";
import { BuildAction } from "Actions/BuildAction";
import { MoveToPositionAction } from "Actions/MoveToPositionAction";

const CONSUL_TYPE = 'Builder';
export class ConstructionImperator extends ImperatorBase {
    static get ConsulType(): string { return CONSUL_TYPE; }
    get consulType(): string { return CONSUL_TYPE }
    protected Consul!: ConstructionConsul;
    InitImperator(): void {
        this.Consul = new ConstructionConsul(this.consulType, this.Queen);
    }
    ImperatorComplete(): void {
        this.Consul.Save();
    }

    protected ActivateCreep(creepData: ConstructorData) {
        if (creepData.fetching || creepData.target == '') { return; }
        let creep = Game.creeps[creepData.creepName];
        this.Queen.Nest.visual.text('C', creep.pos);
        let site = Game.constructionSites[creepData.target];
        if (!site) { return; }
        let buildAction = new BuildAction(creep, site);
        let buildResult = buildAction.ValidateAction();
        if(buildResult == SwarmCodes.C_MOVE) {
            new MoveToPositionAction(creep, site.pos).Run(true);
        } else {
            buildAction.Run();
        }
    }
}