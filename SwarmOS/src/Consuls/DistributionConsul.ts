import { CreepConsul } from "Consuls/ConsulBase";

const REFILLER_DATA = 'R_DATA';
const CONSUL_TYPE = 'Distribution';
export class DistributionConsul extends CreepConsul {
    static get ConsulType(): string { return CONSUL_TYPE; }
    get consulType(): string { return CONSUL_TYPE }


    SpawnRefiller?: Creep;
    RefillerData!: SpawnConsul_RefillerData;
    Save() {
        this.SetData(REFILLER_DATA, this.RefillerData);
        super.Save();
    }
    Load() {
        if (!super.Load()) { return false }


        return true;
    }
    InitMemory() {
        super.InitMemory();

        this.ScanRoom();
    }
    ScanRoom(): void {
        let structures = this.Nest.find(FIND_STRUCTURES, {
            filter: function (struct) {
                return struct.structureType == STRUCTURE_CONTAINER ||
                    struct.structureType == STRUCTURE_EXTENSION ||
                    struct.structureType == STRUCTURE_LINK ||
                    struct.structureType == STRUCTURE_SPAWN ||
                    struct.structureType == STRUCTURE_STORAGE ||
                    struct.structureType == STRUCTURE_TERMINAL ||
                    struct.structureType == STRUCTURE_TOWER;
            }
        });

        for (let i = 0, length = structures.length; i < length; i++) {

        }
    }
    ReleaseCreep(creepName: string): void {
        throw new Error("Method not implemented.");
    }
    GetSpawnDefinition(): SpawnConsul_SpawnArgs {
        throw new Error("Method not implemented.");
    }
    RequiresSpawn(): boolean {
        throw new Error("Method not implemented.");
    }
    protected _assignCreep(creepName: string): void {
        throw new Error("Method not implemented.");
    }
}

declare type SpawnConsul_RefillerData = {
    creepName: string,
    extensionList: string[],
    curTarget: number,
    fetching: boolean,
    idleTime: number,
}