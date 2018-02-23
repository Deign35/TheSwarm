import { CreepConsul } from "Consuls/ConsulBase";
import { HiveQueenBase } from "Queens/HiveQueenBase";

const REFILLER_DATA = 'R_DATA';
const CONSUL_TYPE = 'Distribution';
const SCAN_COOLDOWN = 'SCAN_CD';
const SCAN_LIMIT = 10;
export class DistributionConsul extends CreepConsul {
    CreepData!: CreepConsul_Data[];
    static get ConsulType(): string { return CONSUL_TYPE; }
    get consulType(): string { return CONSUL_TYPE }

    SpawnRefiller?: Creep;
    SpawnRefillerData!: DistributionConsul_RefillerData;
    protected ScanCooldown?: number;
    Save() {
        if (this.ScanCooldown) {
            this.ScanCooldown--;
            if (this.ScanCooldown <= 0) {
                this.RemoveData(SCAN_COOLDOWN);
            } else {
                this.SetData(SCAN_COOLDOWN, this.ScanCooldown);
            }
        }
        this.SetData(REFILLER_DATA, this.SpawnRefillerData);
        super.Save();
    }
    Load() {
        if (!super.Load()) { return false }

        this.SpawnRefillerData = this.GetData(REFILLER_DATA);
        this.SpawnRefiller = Game.creeps[this.SpawnRefillerData.creepName];
        if (!this.SpawnRefiller) {
            this.SpawnRefillerData.creepName = '';
        } else {
            this.CreepData = [];
            this.CreepData.push(this.SpawnRefillerData);
            if (this.SpawnRefillerData.fetching) {
                if (this.SpawnRefiller.carry[RESOURCE_ENERGY] == this.SpawnRefiller.carryCapacity) {
                    (this.Parent as HiveQueenBase).Collector.Consul.ReleaseManagedCreep(this.SpawnRefillerData.creepName);
                    this.SpawnRefillerData.fetching = false;
                }
            } else if (!this.SpawnRefillerData.fetching && this.SpawnRefiller.carry[RESOURCE_ENERGY] == 0) {
                (this.Parent as HiveQueenBase).Collector.Consul.AssignManagedCreep(this.SpawnRefiller);
                this.SpawnRefillerData.fetching = true;
            }
        }
        this.ScanCooldown = this.GetData(SCAN_COOLDOWN);
        if (this.SpawnRefillerData.curTarget >= this.SpawnRefillerData.refillList.length &&
            !this.ScanCooldown && this.SpawnRefillerData.creepName) {
            this.ScanRoom();
        }

        return true;
    }
    InitMemory() {
        super.InitMemory();
        this.SpawnRefillerData = { creepName: '', fetching: false, refillList: [], curTarget: 0, idleTime: 0 };
    }
    ScanRoom(): void {
        if (!this.SpawnRefiller) { return };
        let structures = this.Nest.find(FIND_STRUCTURES, {
            filter: function (struct) {
                return (struct.structureType == STRUCTURE_EXTENSION ||
                    struct.structureType == STRUCTURE_SPAWN ||
                    struct.structureType == STRUCTURE_TOWER) &&
                    struct.energy < struct.energyCapacity;
                //struct.structureType == STRUCTURE_STORAGE ||
                //struct.structureType == STRUCTURE_TERMINAL ||
                //struct.structureType == STRUCTURE_CONTAINER ||
                //struct.structureType == STRUCTURE_LINK ||
            }
        }) as SpawnRefillTarget[];
        structures.sort((a, b) => {
            // Left to right scan will be more efficient than a simple distance check, but
            // this is still a bad solution for a difficult problem.
            return a.pos.x < b.pos.x ? -1 : 1;
        });

        let refillIDs = [];
        for (let i = 0, length = structures.length; i < length; i++) {
            refillIDs.push(structures[i].id);
        }

        this.SpawnRefillerData.refillList = refillIDs;
        this.SpawnRefillerData.curTarget = 0;
    }
    ReleaseCreep(creepName: string): void {
        this.SpawnRefillerData.creepName = '';
    }
    GetSpawnDefinition(): SpawnConsul_SpawnArgs {
        return {
            body: [CARRY, MOVE, CARRY, MOVE],
            creepName: (Game.time + '_DIST').slice(-8),
            requestorID: this.consulType,
            targetTime: Game.time,
        }
    }
    RequiresSpawn(): boolean {
        if (!this.CreepRequested && !this.SpawnRefillerData.creepName) {
            return true;
        }

        return false;
    }
    protected _assignCreep(creepName: string): void {
        if (this.SpawnRefillerData.creepName != '') {
            let oldCreep = this.SpawnRefiller;
            this.ReleaseCreep(this.SpawnRefillerData.creepName);
            this.SpawnRefillerData.creepName = creepName;
            // Set it here because otherwise releasecontrol could end up in an infinite loop;
            if (oldCreep) {
                (this.Parent as HiveQueenBase).ReleaseControl(oldCreep);
            }
        } else {
            this.SpawnRefillerData.creepName = creepName;
        }
    }

    GetSpawnRefillerTarget(): SpawnRefillTarget | undefined {
        while (this.SpawnRefillerData.refillList.length > 0 && this.SpawnRefillerData.curTarget < this.SpawnRefillerData.refillList.length) {
            let targetID = this.SpawnRefillerData.refillList[this.SpawnRefillerData.curTarget];
            let target = Game.getObjectById(targetID) as SpawnRefillTarget;
            if (target.energy < target.energyCapacity) {
                return target;
            } else {
                this.SpawnRefillerData.curTarget++;
            }
        }

        return;
    }
}

declare type SpawnRefillTarget = StructureSpawn | StructureExtension | StructureTower; // For now...

declare type DistributionConsul_RefillerData = CreepConsul_Data & {
    refillList: string[],
    curTarget: number,
    fetching: boolean,
    idleTime: number,
}