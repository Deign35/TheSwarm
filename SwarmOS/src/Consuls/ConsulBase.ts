import * as SwarmCodes from "consts/SwarmCodes"
import { ChildMemory } from "Tools/SwarmMemory";
import { NestQueenBase } from "Queens/NestQueenBase";
import { ImperatorBase } from "Imperators/ImperatorBase";

const REQUESTED_CREEP = 'R_Creep';
export abstract class ConsulBase extends ChildMemory implements IConsul {
    get Queen() { return this.Parent; }
    constructor(id: string, public Parent: NestQueenBase) {
        super(id, Parent);
    }
    Load() {
        if (!super.Load()) { return false; }
        this.Queen.Nest = Game.rooms[this.Queen.id];

        return true;
    }
    InitMemory() {
        super.InitMemory();
        this.Queen.Nest = Game.rooms[this.Queen.id];
    }
    abstract ActivateConsul(): void;
    abstract get consulType(): string;
    static get ConsulType(): string { return 'SwarmCodes.E_NOT_IMPLEMENTED'; }
}

export abstract class CreepConsul extends ConsulBase implements ICreepConsul {
    CreepRequested?: string;
    abstract Imperator: ImperatorBase;
    abstract CreepData: CreepConsul_Data[];
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
    ActivateConsul(): void {
        for (let i = 0, length = this.CreepData.length; i < length; i++) {
            this.Imperator.ActivateCreep(this.CreepData[i]);
        }
    }
    AssignSpawn(creepName: string): void {
        this.ForgetSpawn(creepName);
        this._assignCreep(creepName);
    }
    AssignCreep(creep: Creep): void {
        this._assignCreep(creep.name);
    }

    ForgetSpawn(creepName?: string): void {
        if (creepName && creepName != this.CreepRequested) {
            console.log('CREEP NAME NO MATCH');
            throw 'Assignment bad!!!!';
        }
        delete this.CreepRequested;
        this.RemoveData(REQUESTED_CREEP);
    }

    abstract ReleaseCreep(creepName: string): void;
    abstract GetSpawnDefinition(): SpawnConsul_SpawnArgs;
    abstract GetNextSpawn(): boolean;
    protected abstract _assignCreep(creepName: string): void;
}