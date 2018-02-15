import { ChildMemory } from "Memory/SwarmMemory";
import * as SwarmEnums from "SwarmEnums";
import { HiveQueen } from "Managers/HiveQueen";

const ASSIGNED_CREEPNAMES = 'AssignedCreeps';
export abstract class OverseerBase extends ChildMemory implements IOverseer {
    constructor(memID: string, protected Queen: HiveQueen) {
        super(memID, Queen);
    }

    Hive!: Room;
    AssignedCreeps!: { [creepName: string]: Creep };

    Save() {
        this.SetData(ASSIGNED_CREEPNAMES, this.AssignedCreeps)
        super.Save();
    }
    Load() {
        super.Load();
        this.Hive = Game.rooms[this.Queen.id];
        let creepNames = this.GetData(ASSIGNED_CREEPNAMES);
        for (let i = 0, length = creepNames.length; i < length; i++) {
            this.AssignedCreeps[creepNames[i]] = Game.creeps[creepNames[i]]
        }
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