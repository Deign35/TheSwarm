import * as SwarmCodes from "Consts/SwarmCodes"
import { ConsulBase } from "./ConsulBase";
import { ImperatorBase } from "Imperators/ImperatorBase";
import { MinHeap } from "Tools/MinHeap";

const CONSUL_TYPE = 'Spawn_Consul';
const SPAWN_DATA = 'S_DATA';
const SPAWN_QUEUE = 'S_QUEUE';
const RELATIVE_TIME = 'R_TIME';
export class SpawnConsul extends ConsulBase implements IConsul {
    readonly consulType = CONSUL_TYPE;

    SpawnData!: SpawnConsul_SpawnData[];
    protected SpawnQueue!: MinHeap<SpawnConsul_SpawnArgs>;
    protected RelativeTime!: number;
    Save() {
        this.SetData(SPAWN_DATA, this.SpawnData);
        let serializedQueue = MinHeap.CompressHeap(this.SpawnQueue, SpawnConsul.SerializeSpawnRequest);
        this.SetData(SPAWN_QUEUE, serializedQueue);
        super.Save();
    }

    Load() {
        if (!super.Load()) { return false; }
        this.SpawnData = this.GetData(SPAWN_DATA);
        let serializedQueue = this.GetData(SPAWN_QUEUE);
        this.SpawnQueue = MinHeap.DeserializeHeap(serializedQueue, SpawnConsul.DeserializeSpawnRequest);
        this.RelativeTime = this.GetData(RELATIVE_TIME);
        return true;
    }

    InitMemory() {
        super.InitMemory();
        this.ScanRoom();
        this.SpawnQueue = new MinHeap();
        this.SpawnData = [];
    }

    ScanRoom(): void {
        let spawns = this.Nest.find(FIND_MY_SPAWNS);
        this.SpawnData = [];
        for (let i = 0, length = spawns.length; i < length; i++) {
            this.AddSpawner(spawns[i]);
        }
    }

    SpawnCreep() {
        let spawnData = this.SpawnQueue.Peek();
        if (!spawnData) { return; }
        if (this.Nest.energyAvailable >= SpawnConsul.CalculateEnergyCost(spawnData)) {
            let spawnToUse: StructureSpawn | undefined;
            for (let i = 0, length = this.SpawnData.length; i < length; i++) {
                let spawn = Game.spawns[this.SpawnData[i].id];
                if (!spawn) { this.SpawnData.splice(i--, 1); continue; }
                if (spawn.spawning) { continue; }
                if (spawnToUse && spawnData.targetPos) {
                    let xDist1 = spawnToUse.pos.x - spawnData.targetPos.x;
                    let yDist1 = spawnToUse.pos.y - spawnData.targetPos.y;
                    let xDist2 = spawn.pos.x - spawnData.targetPos.x;
                    let yDist2 = spawn.pos.y - spawnData.targetPos.y;

                    if ((xDist1 * xDist1 + yDist1 * yDist1) > (xDist2 * xDist2 + yDist2 * yDist2)) {
                        spawnToUse = spawn;
                    }
                } else {
                    spawnToUse = spawn;
                }
            }
            if (spawnToUse) {
                if (Game.creeps[spawnData.creepName]) {
                    spawnData.creepName += ('' + Game.time).slice(-3);
                }
                if (spawnToUse.spawnCreep(spawnData.body, spawnData.creepName, { dryRun: true }) == OK) {
                    spawnToUse.spawnCreep(spawnData.body, spawnData.creepName);
                    return this.SpawnQueue.Pop();
                }
            }
        }

        return;
    }

    AddSpawner(spawner: StructureSpawn) {
        if (spawner.room.name != this.Nest.name) { return; }
        let newSpawnData: SpawnConsul_SpawnData = {
            x: spawner.pos.x,
            y: spawner.pos.y,
            id: spawner.name
        };
        this.SpawnData.push(newSpawnData);
    }

    AddSpawnToQueue(spawnArgs: SpawnConsul_SpawnArgs) {
        if (!this.SpawnQueue.Peek()) {
            this.RelativeTime = Game.time;
            this.SetData(RELATIVE_TIME, this.RelativeTime);
        }
        this.SpawnQueue.Push(spawnArgs, spawnArgs.targetTime - this.RelativeTime - (spawnArgs.body.length * 3));
    }

    DetermineRequirements(): SpawnConsul_RequirementsData {
        let requirements: SpawnConsul_RequirementsData = { energyNeeded: 0, neededBy: 0 };
        let peeked: SpawnConsul_SpawnArgs[] = [];
        for (let i = 0; i < 3; i++) {
            if (this.SpawnQueue.Peek()) {
                peeked.push(this.SpawnQueue.Pop() as SpawnConsul_SpawnArgs);
            }
        }
        if (peeked.length > 0) {
            requirements.neededBy = peeked[0].targetTime;
        }
        for (let i = 0; i < 3; i++) {
            requirements.energyNeeded += SpawnConsul.CalculateEnergyCost(peeked[i]);
            this.AddSpawnToQueue(peeked[i]);
        }

        return requirements;
    }

    static get ConsulType(): string { return CONSUL_TYPE; }

    protected static CalculateEnergyCost(spawnData: SpawnConsul_SpawnArgs): number {
        if (spawnData.calculatedCost) { return spawnData.calculatedCost; }
        let totalCost = 0;
        let body = spawnData.body;
        for (let i = 0, length = body.length; i < length; i++) {
            totalCost += BODYPART_COST[body[i]];
        }

        spawnData.calculatedCost = totalCost;
        return totalCost;
    }

    protected static SerializeSpawnRequest(spawnData: SpawnConsul_SpawnArgs): string {
        return JSON.stringify(spawnData);
    }
    protected static DeserializeSpawnRequest(data: string): SpawnConsul_SpawnArgs {
        return JSON.parse(data) as SpawnConsul_SpawnArgs;
    }
}