import { SwarmCreep } from "Prototypes/SwarmCreep";
import { profile } from "Tools/Profiler";

@profile
export class SwarmManager implements ISwarmManager {
    private Creeps!: { [creepName: string]: ICreepManager }
    private static _instance: SwarmManager;
    static PrepareTheSwarm() {
        this._instance = new SwarmManager();
        return this._instance.PrepareTheSwarm();
    }
    PrepareTheSwarm(): void {
        this.Creeps = {};
        let newManager = new SwarmManager();

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

    static ActivateSwarm() { this._instance.ActivateSwarm(); }
    ActivateSwarm(): void {
        for (let name in this.Creeps) {
            let creep = this.Creeps[name];
            creep.ProcessTick();
            // do stuff to the creep.
        }
    }

    static FinalizeSwarmActivity() { return this._instance.FinalizeSwarmActivity(); }
    FinalizeSwarmActivity(): void {
        for (let name in this.Creeps) {
            let creep = this.Creeps[name];
            creep.EndTick();
        }
    }

    static CreateSwarmObject(creep: Creep) { return this._instance.CreateSwarmObject(creep); }
    CreateSwarmObject(creep: Creep): SwarmCreep {
        return new SwarmCreep(creep);
    }
} global['SwarmManager'] = SwarmManager;