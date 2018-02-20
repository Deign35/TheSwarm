import * as SwarmCodes from "Consts/SwarmCodes"
import { ConsulBase, CreepConsul } from "./ConsulBase";
import { ImperatorBase } from "Imperators/ImperatorBase";
import { MinHeap } from "Tools/MinHeap";
import { HiveQueenBase } from "Queens/HiveQueenBase";

const CONSUL_TYPE = 'Spawn_Consul';
const SPAWN_DATA = 'S_DATA';
const SPAWN_QUEUE = 'S_QUEUE';
const RELATIVE_TIME = 'R_TIME';
const REFILLER_ID = 'Refiller';
const REFILLER_DATA = 'R_DATA';
const EXTENSION_IDS = 'Extensions';
export class SpawnConsul extends CreepConsul {
    static get ConsulType(): string { return CONSUL_TYPE; }
    readonly consulType = SpawnConsul.ConsulType;

    protected SpawnData!: SpawnConsul_SpawnData[];
    protected SpawnQueue!: MinHeap<SpawnConsul_SpawnArgs>;
    protected RelativeTime!: number;

    SpawnRefiller?: Creep;
    RefillerData!: SpawnConsul_RefillerData;
    Save() {
        this.SetData(SPAWN_DATA, this.SpawnData);
        let serializedQueue = MinHeap.CompressHeap(this.SpawnQueue, SpawnConsul.SerializeSpawnRequest);
        this.SetData(SPAWN_QUEUE, serializedQueue);
        this.SetData(REFILLER_DATA, this.RefillerData);
        super.Save();
    }

    Load() {
        if (!super.Load()) { return false; }
        this.SpawnData = this.GetData(SPAWN_DATA);
        let serializedQueue = this.GetData(SPAWN_QUEUE);
        this.SpawnQueue = MinHeap.DeserializeHeap(serializedQueue, SpawnConsul.DeserializeSpawnRequest);
        this.RelativeTime = this.GetData(RELATIVE_TIME);
        this.RefillerData = this.GetData(REFILLER_DATA);
        if (this.RefillerData.creepName) {
            this.SpawnRefiller = Game.creeps[this.RefillerData.creepName];
            if (!this.SpawnRefiller) {
                this.RefillerData.creepName = '';
            } else {
                if(this.RefillerData.fetching) {
                    if(this.SpawnRefiller.carry[RESOURCE_ENERGY] == this.SpawnRefiller.carryCapacity) {
                        (this.Parent as HiveQueenBase).Collector.Consul.ReleaseManagedCreep(this.SpawnRefiller.name);
                        this.RefillerData.fetching = false;
                    }
                } else {
                    if(this.SpawnRefiller.carry[RESOURCE_ENERGY] == 0) {
                        (this.Parent as HiveQueenBase).Collector.Consul.AssignManagedCreep(this.SpawnRefiller);
                        this.RefillerData.fetching = true;
                    }
                }
            }
        }
        return true;
    }

    InitMemory() {
        super.InitMemory();
        this.SpawnQueue = new MinHeap();
        this.RefillerData = { creepName: '', fetching: true, extensionList: [], curTarget: 0 };
        this.ScanRoom();
    }

    ScanRoom(): void {
        let spawns = this.Nest.find(FIND_MY_SPAWNS);
        this.SpawnData = [];
        this.RefillerData.extensionList = [];
        for (let i = 0, length = spawns.length; i < length; i++) {
            this.AddSpawner(spawns[i]);
            this.RefillerData.extensionList.push(spawns[i].id);
        }
        let extensions = this.Nest.find(FIND_MY_STRUCTURES, {
            filter: function (struct) {
                return struct.structureType == STRUCTURE_EXTENSION;
            }
        });
        for (let i = 0, length = extensions.length; i < length; i++) {
            this.RefillerData.extensionList.push(extensions[i].id);
        }
        this.RefillerData.extensionList.sort((a, b) => {

            return 0;
        })
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

    GetNextSpawns(numLookAhead: number): SpawnConsul_RequirementsData[] {
        let requirements: SpawnConsul_RequirementsData[] = [];
        let peeked: SpawnConsul_SpawnArgs[] = [];
        for (let i = 0; i < numLookAhead; i++) {
            if (this.SpawnQueue.Peek()) {
                peeked.push(this.SpawnQueue.Pop() as SpawnConsul_SpawnArgs);
                // Have to pop this off to get to the first 3
            } else {
                break;
            }
        }
        for (let i = 0, length = peeked.length; i < length; i++) {
            let newReq = { energyNeeded: SpawnConsul.CalculateEnergyCost(peeked[i]), neededBy: peeked[i].targetTime };
            requirements.push(newReq);
            // Add it back to the list
            this.AddSpawnToQueue(peeked[i]);
        }

        return requirements;
    }

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

    RequiresSpawn(): boolean {
        // Check if
        if (!this.CreepRequested && !this.SpawnRefiller) {
            return true;
        }
        return false;
    }
    ReleaseCreep(creepName: string): void {
        if (this.CreepRequested) {
            this.CreepRequested = undefined;
        }
        if (this.SpawnRefiller) {
            this.SpawnRefiller = undefined;
            this.RefillerData.creepName = '';
        }
    }
    GetSpawnDefinition(): SpawnConsul_SpawnArgs {
        return {
            body: [CARRY, MOVE, CARRY, MOVE],
            targetTime: Game.time - 100,
            creepName: 'SR' + Game.time,
            requestorID: this.consulType,
        }
    }
    GetIdleCreeps(): Creep[] {
        return [];
    }
    protected _assignCreep(creepName: string): void {
        this.RefillerData.creepName = creepName;
        this.SpawnRefiller = Game.creeps[creepName];
    }
}

declare type SpawnConsul_RefillerData = {
    creepName: string,
    extensionList: string[],
    curTarget: number,
    fetching: boolean
}