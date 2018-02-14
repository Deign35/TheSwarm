import { ChildMemory } from "Memory/SwarmMemory";
import * as SwarmEnums from "SwarmEnums";
import { HiveQueen } from "Managers/HiveQueen";

const ASSIGNED_CREEPS = 'AssignedCreeps';
export abstract class OverseerBase extends ChildMemory implements IOverseer {
    constructor(memID: string, protected Queen: HiveQueen) {
        super(memID, Queen);
    }

    Hive!: Room;
    AssignedCreeps!: string[];
    Save() {
        this.SetData(ASSIGNED_CREEPS, this.AssignedCreeps)
        super.Save();
    }
    Load() {
        super.Load();
        this.Hive = Game.rooms[this.Queen.id];
        this.AssignedCreeps = this.GetData(ASSIGNED_CREEPS);
    }

    // This should be converted from passive to active.
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
    GetAvailableResources(): IOverseerData_Resource[] {
        return this.Registry.Available.Resources;
    }
    GetRequirements(): IOverseerRequirements {
        return this.Registry.Requirements;
    }

    abstract ValidateOverseer(): void;
    abstract AssignCreep(creepName: string): void;
    abstract ActivateOverseer(): void;
    abstract ReleaseCreep(name: string, releaseReason: string): void;
    abstract AssignOrder(orderID: string): boolean;
    abstract PrepareCreep(creepName: string): number;
}