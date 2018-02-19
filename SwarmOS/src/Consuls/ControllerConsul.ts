import { CreepConsul } from "Consuls/ConsulBase";
import * as SwarmConsts from 'Consts/SwarmConsts';
import * as SwarmCodes from 'Consts/SwarmCodes';

const CONSUL_TYPE = 'Controller';
const UPGRADER_IDS = 'U_IDs'

const RCL_UPGRADER_RATIO: { [index: number]: { numUpgraders: number, body: BodyPartConstant[] } } = {
    1: { numUpgraders: 1, body: [WORK, CARRY, MOVE] },
    2: { numUpgraders: 4, body: [WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE] },
    3: { numUpgraders: 4, body: [WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE] },
    4: { numUpgraders: 4, body: [WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE] },
    5: { numUpgraders: 4, body: [WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE] },
    6: { numUpgraders: 4, body: [WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE] },
    7: { numUpgraders: 4, body: [WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE] },
    8: { numUpgraders: 1,
        body: [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK,
            WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY,
            CARRY, MOVE, MOVE, MOVE, MOVE, MOVE]
    },
}
export class ControllerConsul extends CreepConsul {
    static get ConsulType(): string { return CONSUL_TYPE; }
    get consulType(): string { return CONSUL_TYPE }
    UpgraderCreeps!: Creep[];
    Controller!: StructureController;
    protected newCreepName?: string;
    Save() {
        let creepIds = [];
        for (let i = 0, length = this.UpgraderCreeps.length; i < length; i++) {
            creepIds.push(this.UpgraderCreeps[i].name);
        }
        if (this.newCreepName) {
            creepIds.push(this.newCreepName);

            this.newCreepName = undefined;
        }
        this.SetData(UPGRADER_IDS, creepIds);
        super.Save();
    }
    Load() {
        if (!super.Load()) { return false }
        this.Controller = this.Nest.controller as StructureController;

        if (!this.Controller.my && // I dont control it
            (!this.Controller.reservation ||
                this.Controller.reservation.username != SwarmConsts.MY_USERNAME)) { // I dont have it reserved
            console.log('Lost control of this nest');
            // Need to update the NestQueen and on up.
        }

        this.UpgraderCreeps = [];
        let creepIds = this.GetData(UPGRADER_IDS);
        for (let i = 0, length = creepIds.length; i < length; i++) {
            if (!Game.creeps[creepIds[i]]) continue;
            this.UpgraderCreeps.push(Game.creeps[creepIds[i]]);
        }

        return true;
    }
    InitMemory() {
        debugger;
        super.InitMemory();
        if (!this.Nest.controller) {
            throw 'ATTEMPTING TO ADD CONTROLLERCONSUL TO A ROOM WITH NO CONTROLLER'
        }
        this.UpgraderCreeps = [];
        this.SetData(UPGRADER_IDS, this.UpgraderCreeps);
    }
    RequiresSpawn(): boolean {
        if (!this.CreepRequested) {
            if (this.UpgraderCreeps.length < RCL_UPGRADER_RATIO[this.Controller.level].numUpgraders) {
                return true;
            }
        }

        return false;
    }
    GetSpawnDefinition(): SpawnConsul_SpawnArgs {
        let spawnArgs = {} as SpawnConsul_SpawnArgs;
        spawnArgs.creepName = 'Upg_' + ('' + Game.time).slice(-3);
        spawnArgs.requestorID = this.consulType;
        spawnArgs.body = RCL_UPGRADER_RATIO[this.Controller.level].body;
        spawnArgs.targetTime = Game.time;

        return spawnArgs;
    }
    AssignCreep(creepData: SpawnConsul_SpawnArgs): SwarmCodes.SwarmlingResponse {
        super.AssignCreep(creepData);
        this.newCreepName = creepData.creepName;
        return SwarmCodes.C_NONE;
    }
    ReleaseCreep(creepName: string): void {
        for (let i = 0, length = this.UpgraderCreeps.length; i < length; i++) {
            if (this.UpgraderCreeps[i]) {
                this.UpgraderCreeps.splice(i, 1);
                return;
            }
        }
    }
}