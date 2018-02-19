import * as SwarmCodes from "consts/SwarmCodes"
import { ChildMemory } from "Tools/SwarmMemory";
import { NestQueenBase } from "Queens/NestQueenBase";

const REQUESTED_CREEP = 'R_Creep';
export abstract class ConsulBase extends ChildMemory implements IConsul {
    Nest!: Room;
    constructor(id: string, public Parent: NestQueenBase) {
        super(id, Parent);
    }
    Load() {
        if (!super.Load()) { return false; }
        this.Nest = Game.rooms[this.Parent.id];

        return true;
    }
    InitMemory() {
        super.InitMemory();
        this.Nest = Game.rooms[this.Parent.id];
    }
    abstract get consulType(): string;
    static get ConsulType(): string { return 'SwarmCodes.E_NOT_IMPLEMENTED'; }
}

export abstract class CreepConsul extends ConsulBase {
    CreepRequested?: string;
    Save() {
        if (this.CreepRequested) {
            this.SetData(REQUESTED_CREEP, this.CreepRequested);
        }
        super.Save();
    }
    Load() {
        if (!super.Load()) { return false; }
        this.CreepRequested = this.GetData(REQUESTED_CREEP);
        return true;
    }
    AssignCreep(creepData: SpawnConsul_SpawnArgs): void {
        if (creepData.creepName != this.CreepRequested) {
            console.log('CREEP NAME NO MATCH');
        }
        delete this.CreepRequested;
        this.RemoveData(REQUESTED_CREEP);
        this._assignCreep(creepData);
    }

    abstract ReleaseCreep(creepName: string): void;
    abstract GetSpawnDefinition(): SpawnConsul_SpawnArgs;
    abstract RequiresSpawn(): boolean;
    abstract HasIdleCreeps(): boolean;
    protected abstract _assignCreep(creepData: SpawnConsul_SpawnArgs): void;
}