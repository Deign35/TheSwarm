import { SwarmCreep } from "Prototypes/SwarmCreep";
import { profile } from "Tools/Profiler";

@profile
export class SwarmCreepManager implements ISwarmCreepManager {
    private Creeps!: { [creepName: string]: ICreepManager }
    private static _instance: SwarmCreepManager;
    static PrepareTheSwarm() {
        SwarmCreepManager._instance = new SwarmCreepManager();
        return SwarmCreepManager._instance.PrepareTheSwarm();
    }
    PrepareTheSwarm(): void {
        this.Creeps = {};
        let newManager = new SwarmCreepManager();

        let creepNames = Swarmlord.GetMemoryEntries(StorageMemoryType.Creep);
        for (let i = 0; i < creepNames.length; i++) {
            let creepName = creepNames[i];
            if (!Game.creeps[creepName]) {
                // Creep died, do something with the memory?
            }
            this.Creeps[creepName] = this.CreateSwarmObject(Game.creeps[creepName]);
            this.Creeps[creepName].StartTick();
        }
    }

    static ActivateSwarm() { SwarmCreepManager._instance.ActivateSwarm(); }
    ActivateSwarm(): void {
        for (let name in this.Creeps) {
            let creep = this.Creeps[name];
            creep.ProcessTick();
            // do stuff to the creep.
        }
    }

    static FinalizeSwarmActivity() { return SwarmCreepManager._instance.FinalizeSwarmActivity(); }
    FinalizeSwarmActivity(): void {
        for (let name in this.Creeps) {
            let creep = this.Creeps[name];
            creep.EndTick();
        }
    }

    static CreateSwarmObject(creep: Creep) { return SwarmCreepManager._instance.CreateSwarmObject(creep); }
    CreateSwarmObject(creep: Creep): SwarmCreep {
        return new SwarmCreep(creep);
    }
} global['SwarmManager'] = SwarmCreepManager;