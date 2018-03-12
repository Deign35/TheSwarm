import { SwarmCreep } from "Prototypes/SwarmCreep";

export class SwarmManager {
    private static Creeps: { [creepName: string]: ICreepManager }
    static PrepareTheSwarm(): void {
        this.Creeps = {};
        let newManager = new SwarmManager();

        let creepNames = Swarmlord.GetMemoryEntries(StorageMemoryType.Creep);
        for (let i = 0; i < creepNames.length; i++) {
            let creepName = creepNames[i];
            if (!Game.creeps[creepName]) {
                // Creep died, do something with the memory?
            }
            this.Creeps[creepName] = CreateSwarmCreep(Game.creeps[creepName]);
            this.Creeps[creepName].StartTick();
        }
    }

    static ActivateSwarm(): void {
        for (let name in this.Creeps) {
            let creep = this.Creeps[name];
            creep.ProcessTick();
            // do stuff to the creep.
        }
    }

    static FinalizeSwarmActivity(): void {
        for (let name in this.Creeps) {
            let creep = this.Creeps[name];
            creep.EndTick();
        }
    }
}

function CreateSwarmCreep(creep: Creep): SwarmCreep {
    return new SwarmCreep(creep);
}