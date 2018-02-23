import * as SwarmCodes from "Consts/SwarmCodes"
import { NestQueenBase } from "Queens/NestQueenBase";
import { CreepConsul } from "Consuls/ConsulBase";

export abstract class ImperatorBase implements IImperator {
    constructor(protected Queen: NestQueenBase) { this.InitImperator(); }
    protected abstract get Consul(): CreepConsul;
    abstract InitImperator(): void;
    abstract ImperatorComplete(): void;
    ActivateImperator(): SwarmCodes.SwarmErrors {
        let creepData = this.Consul.CreepData;
        for (let i = 0, length = creepData.length; i < length; i++) {
            this.ActivateCreep(creepData[i]);
        }

        return SwarmCodes.C_NONE;
    }
    AssignSpawn(creepName: string): void {
        this.Consul.AssignSpawn(creepName);
    }
    ForgetSpawn(creepName?: string): void { this.Consul.ForgetSpawn(creepName); }
    AssignCreep(creep: Creep): void {
        this.Consul.AssignCreep(creep);
    }
    IsCreepAssigned(creepName: string): boolean {
        for(let i = 0, length = this.Consul.CreepData.length; i < length; i++) {
            if(this.Consul.CreepData[i].creepName == creepName) {
                return true;
            }
        }

        return false;
    }
    GetSpawnDefinition() : SpawnConsul_SpawnArgs {
        return this.Consul.GetSpawnDefinition();
    }
    RequiresSpawn(): boolean {
        return this.Consul.RequiresSpawn();
    }

    get CreepRequested(): string | undefined { return this.Consul.CreepRequested; }
    set CreepRequested(creepName: string | undefined) { this.Consul.CreepRequested = creepName; }
    protected abstract ActivateCreep(creep: CreepConsul_Data): void;
}