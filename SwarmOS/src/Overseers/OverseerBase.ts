import { SwarmMemory } from "Memory/SwarmMemory";
import * as SwarmEnums from "SwarmEnums";
import { HiveQueen } from "Managers/HiveQueen";

export abstract class OverseerBase extends SwarmMemory implements IOverseer {
    constructor(memID: string, protected Queen: HiveQueen) {
        super(memID, Queen);
        this.ValidateOverseer();
    }

    protected abstract ValidateOverseer(): void;
    protected Registry!: IOverseer_Registry;
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

    abstract HasResources(): boolean;
    GetAvailableResources(): IOverseerData_Resource[] {
        return this.Registry.Available.Resources;
    }
    GetRequirements(): IOverseerRequirements {
        return this.Registry.Requirements;
    }
    abstract AssignCreep(creepName: string): void;
    abstract ActivateOverseer(): void;
    abstract ReleaseCreep(name: string, releaseReason: string): void;
    abstract AssignOrder(orderID: string): boolean;
}