import * as SwarmCodes from "Consts/SwarmCodes"
import { ConsulBase } from "./ConsulBase";
import { ImperatorBase } from "Imperators/ImperatorBase";
import { MinHeap } from "Tools/MinHeap";

const CONSUL_TYPE = 'Spawn_Consul';
const SPAWN_DATA = 'S_DATA';
const SPAWN_QUEUE = 'S_QUEUE';
export class SpawnConsul extends ConsulBase implements IConsul {
    readonly consulType = CONSUL_TYPE;
    SpawnData!: SpawnConsul_SpawnData[];
    protected SpawnQueue!: MinHeap<SpawnConsul_SpawnArgs>;
    Save() {
        this.SetData(SPAWN_DATA, this.SpawnData);
        this.SetData(SPAWN_QUEUE, this.SpawnQueue);
        super.Save();
    }

    Load() {
        if (!super.Load()) { return false; }
        this.SpawnData = this.GetData(SPAWN_DATA);
        this.SpawnQueue = this.GetData(SPAWN_QUEUE);
        return true;
    }

    InitMemory() {
        super.InitMemory();
        this.ScanRoom();
    }

    ScanRoom(): void {

    }

    AddSpawner(spawnName: string) {

    }
    AddSpawnToQueue(spawnArgs: SpawnConsul_SpawnArgs) {

    }

    DetermineRequirements(): void {
        // Calculates the distance to new sources
        // Orders creation of new screep so that they will arrive at the harvest node
        // just a few ticks before the previous one dies.
    }

    static get ConsulType(): string { return CONSUL_TYPE; }
}