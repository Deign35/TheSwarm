import * as SwarmConsts from 'Consts/SwarmConsts';
import * as SwarmCodes from 'Consts/SwarmCodes';
import * as _ from "lodash";
import { CreepConsul } from "Consuls/ConsulBase";
import { ControllerImperator } from "Imperators/ControllerImperator";

const CONSUL_TYPE = 'Controller';
const LAST_UPDATE = 'LAST_RCL';
const CREEP_SUFFIX = 'Upg';
export class ControllerConsul extends CreepConsul {
    static get ConsulType(): string { return CONSUL_TYPE; }
    get consulType(): string { return CONSUL_TYPE }

    get _Imperator() {
        return new ControllerImperator();
    }
    Controller!: StructureController;
    protected CreepData!: CreepConsul_Data[];

    Load() {
        if (!super.Load()) { return false }
        this.Controller = this.Queen.Nest.controller!;

        if(this.Controller.progress < 1000 && this.GetData(LAST_UPDATE) != this.Controller.level) {
            this.InitJobRequirements();
            this.SetData(LAST_UPDATE, this.Controller.level);
        }
        return true;
    }

    ValidateConsulState(): void { // spawn data managed from in here.
        if(!this.Controller) { return; }
        if (!this.Controller.my && // I dont control it
            (!this.Controller.reservation ||
                this.Controller.reservation.username != SwarmConsts.MY_USERNAME)) { // I dont have it reserved
            console.log('Lost control of this nest');
            // Need to update the NestQueen and on up.
        }
    }

    InitMemory() {
        super.InitMemory();
        if (!this.Queen.Nest.controller) {
            throw 'ATTEMPTING TO ADD CONTROLLERCONSUL TO A ROOM WITH NO CONTROLLER'
        }
    }

    GetBodyTemplate(): BodyPartConstant[] {
        if(!this.Controller) { return []; }
        switch(this.Controller.level) {
            case(1): return [WORK, MOVE, CARRY];
            case(2): return [WORK, MOVE, CARRY];
            case(3): return [WORK, MOVE, CARRY];
            case(4): return [WORK, MOVE, CARRY];
            case(5): return [WORK, MOVE, CARRY];
            case(6): return [WORK, MOVE, CARRY];
            case(7): return [WORK, MOVE, CARRY];
            case(8): return [WORK, MOVE, CARRY];
            default: return [WORK, MOVE, CARRY];
        }
    }
    GetSuperUpgraderBody(): BodyPartConstant[] {
        if(!this.Controller) { return []; }
        switch(this.Controller.level) {
            case(1): return [WORK, MOVE, CARRY];
            case(2): return [WORK, MOVE, CARRY];
            case(3): return [WORK, MOVE, CARRY];
            case(4): return [WORK, MOVE, CARRY];
            case(5): return [WORK, MOVE, CARRY];
            case(6): return [WORK, MOVE, CARRY];
            case(7): return [WORK, MOVE, CARRY];
            case(8): return [WORK, MOVE, CARRY];
            default: return [WORK, MOVE, CARRY];
        }
    }
    GetCreepSuffix(): string {
        return CREEP_SUFFIX;
    }
    GetDefaultSpawnPriority(): SwarmConsts.SpawnPriority {
        return SwarmConsts.SpawnPriority.Lowest;
    }
    GetDefaultTerminationType(): SwarmConsts.SpawnRequest_TerminationType {
        return SwarmConsts.SpawnRequest_TerminationType.OneOff;
    }
    GetDefaultJobCount(): number {
        return 0;
    }
}