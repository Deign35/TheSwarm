import { SwarmMemory } from "Memory/SwarmMemory";
import * as SwarmEnums from "SwarmEnums";
import * as _ from "lodash";
/**
        this.ValidateOverseer(); */
const ASSIGNED_CREEPS = 'AC';
export abstract class OverseerBase extends SwarmMemory implements IOverseer {
    protected AssignedCreeps: string[]
    protected _registry: IOverseer_Registry;
    protected get Registry(): IOverseer_Registry {
        if (!this.registryInit) {
            this.registryInit = true;
            this._registry = this.InitOverseerRegistry();
        }
        return this._registry;
    }
    private registryInit = false;

    Save() {
        this.SetData(ASSIGNED_CREEPS, this.AssignedCreeps);
        super.Save();
    }
    Load() {
        super.Load();
        this.AssignedCreeps = this.GetData(ASSIGNED_CREEPS) || [];
        for (let index in this.AssignedCreeps) {
            let foundCreep = Game.getObjectById(this.AssignedCreeps[index]);
            if (!foundCreep) {
                this.ReleaseCreep(this.AssignedCreeps[index], 'Dead creep');
            }
        }
    }
    static CreateEmptyOverseerRegistry(): IOverseer_Registry {
        return {
            Available: {
                Resources: []
            },
            Requirements: {
                Creeps: [],
                Resources: []
            }
        }
    };
    protected abstract InitOverseerRegistry(): IOverseer_Registry;

    abstract HasResources(): boolean;
    GetAvailableResources(): IOverseerData_Resource[] {
        return this.Registry.Available.Resources;
    }
    abstract HasRequirements(): boolean;
    GetRequirements(): IOverseerRequirements {
        return this.Registry.Requirements;
    }
    AssignCreep(creepName: string) {
        this.AssignedCreeps.push(creepName);
    }
    abstract ValidateOverseer(): void;
    abstract ActivateOverseer(): void;
    abstract ReleaseCreep(name: string, releaseReason: string): void;
}