import { CreepConsul } from "Consuls/ConsulBase";
import * as SwarmConsts from 'Consts/SwarmConsts';
import * as SwarmCodes from 'Consts/SwarmCodes';
import * as _ from "lodash";

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
    8: {
        numUpgraders: 1,
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
    protected upgradeCreepData!: string[];
    Save() {
        this.SetData(UPGRADER_IDS, this.upgradeCreepData);
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
        this.upgradeCreepData = this.GetData(UPGRADER_IDS) || [];
        for (let i = 0, length = this.upgradeCreepData.length; i < length; i++) {
            if (!Game.creeps[this.upgradeCreepData[i]]) {
                this.upgradeCreepData.splice(i--, 1);
                continue;
            }
            this.UpgraderCreeps.push(Game.creeps[this.upgradeCreepData[i]]);
        }

        return true;
    }
    InitMemory() {
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
    protected _assignCreep(creepName: string) {
        this.upgradeCreepData.push(creepName);
    }
    ReleaseCreep(creepName: string): void {
        for (let i = 0, length = this.upgradeCreepData.length; i < length; i++) {
            if (this.upgradeCreepData[i]) {
                this.upgradeCreepData.splice(i, 1);
                return;
            }
        }
    }
}