import { SwarmMemory } from "Memory/SwarmMemory";
import * as SwarmEnums from "SwarmEnums";
import * as _ from "lodash";

export abstract class OverseerBase extends SwarmMemory implements IOverseer {
    protected _registry: IOverseer_Registry;
    protected get Registry(): IOverseer_Registry {
        if (!this.registryInit) {
            this.registryInit = true;
            this._registry = this.InitOverseerRegistry();
        }
        return this._registry;
    }
    private registryInit = false;
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
    abstract AssignCreep(creepName: string): void;
    abstract ValidateOverseer(): void;
    abstract ActivateOverseer(): void;
    abstract ReleaseCreep(name: string, releaseReason: string): void;
}