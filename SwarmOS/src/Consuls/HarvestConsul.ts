import * as SwarmCodes from "Consts/SwarmCodes"
import * as _ from "lodash";
import { HarvestAction } from "Actions/HarvestAction";
import { HarvestImperator } from "Imperators/HarvestImperator";
import { RateTracker } from "Tools/RateTracker";
import { CreepConsul } from "./ConsulBase";

const CONSUL_TYPE = 'H_Consul';
const SOURCE_DATA = 'S_Data';
const TRACKER_PREFIX = 'Track_';
export class HarvestConsul extends CreepConsul {
    readonly consulType = CONSUL_TYPE;
    SourceData!: HarvestConsul_SourceData[];
    protected SourceHarvestRateTrackers!: RateTracker[];

    Save() {
        this.SetData(SOURCE_DATA, this.SourceData);
        for (let i = 0, length = this.SourceHarvestRateTrackers.length; i < length; i++) {
            this.SourceHarvestRateTrackers[i].Save();
        }
        super.Save();
    }

    Load() {
        if (!super.Load()) { return false; }
        this.SourceData = this.GetData(SOURCE_DATA);
        this.SourceHarvestRateTrackers = [];
        for (let i = 0; i < this.SourceData.length; i++) {
            this.SourceHarvestRateTrackers.push(new RateTracker(TRACKER_PREFIX + i, this));
        }
        return true;
    }

    InitMemory() {
        super.InitMemory();
        this.SourceData = [];
        this.SourceHarvestRateTrackers = [];
        let foundSources = this.Nest.find(FIND_SOURCES);
        for (let i = 0, length = foundSources.length; i < length; i++) {
            this.SourceData.push(this.InitSourceData(foundSources[i]));
            this.SourceHarvestRateTrackers.push(new RateTracker(TRACKER_PREFIX + i, this));
        }
        this.ScanRoom();
    }

    ScanRoom(): void {
        for (let i = 0, length = this.SourceData.length; i < length; i++) {
            let data = this.SourceData[i];
            let sourceTarget = Game.getObjectById(data.id) as Source;
            if (sourceTarget.energy < sourceTarget.energyCapacity) {
                this.SourceHarvestRateTrackers[i].InsertData(data.lastEnergy - sourceTarget.energy);
            }
            data.lastEnergy = sourceTarget.energy;
            if (data.harvester && !Game.creeps[data.harvester as string]) {
                data.harvester = undefined;
            }

            if (data.constructionSite && !Game.getObjectById(data.constructionSite)) {
                data.constructionSite = undefined;
            }

            if (data.containerID && !Game.getObjectById(data.containerID)) {
                data.containerID = undefined;
            }

            if (data.temporaryWorkers) {
                for (let i = 0, length = data.temporaryWorkers.length; i < length; i++) {
                    if (!Game.creeps[data.temporaryWorkers[i]]) {
                        data.temporaryWorkers.splice(i--, 1);
                    }
                }
            }
            this.SourceData[i] = data;
        }
    }

    RequiresSpawn(): boolean {
        // Calculates the distance to new sources
        // Orders creation of new screep so that they will arrive at the harvest node
        // just a few ticks before the previous one dies.
        if (!this.CreepRequested) {
            for (let i = 0, length = this.SourceData.length; i < length; i++) {
                if (this.SourceData[i].harvester) {
                    let curRate = this.SourceHarvestRateTrackers[i].GetRate();
                    //console.log('Rate[' + this.SourceData[i].id + '] -- ' + curRate);
                    if (curRate != 0 && curRate < 10) {
                        return true;
                    }
                } else {
                    return true;
                }
            }
        }

        return false;
    }

    AssignCreep(creepData: SpawnConsul_SpawnArgs): SwarmCodes.SwarmlingResponse {
        super.AssignCreep(creepData);
        if (this.SourceData.length == 0) {
            return SwarmCodes.E_MISSING_TARGET;
        }
        // Check main harvester position
        let index = 0;
        do {
            if (this.SourceData[index].harvester) {
                if (Game.creeps[this.SourceData[index].harvester as string] != undefined) {
                    continue;
                }
            }

            this.SourceData[index].harvester = creepData.creepName;
            return SwarmCodes.C_NONE;
        } while (++index < this.SourceData.length);

        // Pick the better source to help with.
        let min = this.SourceData[0].temporaryWorkers ? (this.SourceData[0].temporaryWorkers as string[]).length : 0;
        let bestPick = 0;
        index = 1;
        do {
            let curMin = this.SourceData[index].temporaryWorkers ? (this.SourceData[index].temporaryWorkers as string[]).length : 0;
            if (curMin < min) {
                bestPick = index;
            }
        } while (++index < this.SourceData.length);

        if (!this.SourceData[bestPick].temporaryWorkers) {
            this.SourceData[bestPick].temporaryWorkers = [];
        }

        (this.SourceData[bestPick].temporaryWorkers as string[]).push(creepData.creepName);
        return SwarmCodes.C_NONE;
    }

    ReleaseCreep(creepName: string) {
        let index = 0;
        while (index < this.SourceData.length) {
            if (this.SourceData[index].harvester == creepName) {
                this.SourceData[index].harvester = undefined;
                break;
            }
            if (this.SourceData[index].temporaryWorkers) {
                for (let i = 0, length = (this.SourceData[index].temporaryWorkers as string[]).length; i < length; i++) {
                    if ((this.SourceData[index].temporaryWorkers as string[])[i] == creepName) {
                        (this.SourceData[index].temporaryWorkers as string[]).splice(i, 1);
                    }
                }
                if ((this.SourceData[index].temporaryWorkers as string[]).length == 0) {
                    this.SourceData[index].temporaryWorkers = undefined;
                }
            }
            index++;
        }
    }
    GetSpawnDefinition(): SpawnConsul_SpawnArgs {
        return {
            creepName: 'Harv' + ('' + Game.time).slice(-3),
            body: [WORK, WORK, WORK, WORK, WORK, MOVE],
            targetTime: Game.time, requestorID: this.consulType
        }
    }

    protected InitSourceData(source: Source): HarvestConsul_SourceData {
        let sourceData = {} as HarvestConsul_SourceData;
        sourceData.x = source.pos.x;
        sourceData.y = source.pos.y;
        sourceData.id = source.id;
        sourceData.lastEnergy = source.energy;
        sourceData.spawnBuffer = 0; // This is how soon a creep must be spawned to get to the source at the right moment.
        let structures = this.Nest.lookForAtArea(LOOK_STRUCTURES,
            sourceData.y - 1, sourceData.x - 1,
            sourceData.y + 1, sourceData.x + 1, true);

        let container = _.filter(structures, (struct) => {
            return (struct.structure as Structure).structureType == STRUCTURE_CONTAINER;
        });

        if (container.length > 0) {
            sourceData.containerID = (container[0].structure as Structure).id;
        } else {
            let constructionSites = this.Nest.lookForAtArea(LOOK_CONSTRUCTION_SITES,
                sourceData.y - 1, sourceData.x - 1,
                sourceData.y + 1, sourceData.x + 1, true);
            let site = _.filter(constructionSites, (site) => {
                return (site.constructionSite as ConstructionSite).structureType == STRUCTURE_CONTAINER;
            });
            if (site.length > 0) {
                sourceData.constructionSite = (site[0].constructionSite as ConstructionSite).id;
            }
        }
        return sourceData;
    }

    static get ConsulType(): string { return CONSUL_TYPE; }
}