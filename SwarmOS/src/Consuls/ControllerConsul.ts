import { CreepConsul } from "Consuls/ConsulBase";
import * as SwarmConsts from 'Consts/SwarmConsts';
import * as SwarmCodes from 'Consts/SwarmCodes';
import * as _ from "lodash";
import { HiveQueenBase } from "Queens/HiveQueenBase";

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
    UpgradeCreepData!: ControllerConsul_CreepData[];
    Save() {
        this.SetData(UPGRADER_IDS, this.UpgradeCreepData);
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
        this.UpgradeCreepData = this.GetData(UPGRADER_IDS) || [];
        for (let i = 0, length = this.UpgradeCreepData.length; i < length; i++) {
            let creep = Game.creeps[this.UpgradeCreepData[i].creepName];
            if (!creep) {
                this.UpgradeCreepData.splice(i--, 1);
                continue;
            }
            if (this.UpgradeCreepData[i].fetching) {
                if (creep.carry[RESOURCE_ENERGY] == creep.carryCapacity) {
                    (this.Parent as HiveQueenBase).Collector.Consul.ReleaseManagedCreep(creep.name);
                    this.UpgradeCreepData[i].fetching = false;
                }
            } else if (creep.carry[RESOURCE_ENERGY] == 0) {
                (this.Parent as HiveQueenBase).Collector.Consul.AssignManagedCreep(creep);
                this.UpgradeCreepData[i].fetching = true;
            }
            this.UpgraderCreeps.push(creep);
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
        this.UpgradeCreepData.push({ creepName: creepName, fetching: false });
    }
    ReleaseCreep(creepName: string): void {
        for (let i = 0, length = this.UpgradeCreepData.length; i < length; i++) {
            if (this.UpgradeCreepData[i]) {
                this.UpgradeCreepData.splice(i, 1);
                return;
            }
        }
    }
}

declare type ControllerConsul_CreepData = {
    creepName: string,
    fetching: boolean,
}