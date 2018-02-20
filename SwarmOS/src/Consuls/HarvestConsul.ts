import * as SwarmCodes from "Consts/SwarmCodes"
import * as _ from "lodash";
import { HarvestAction } from "Actions/HarvestAction";
import { HarvestImperator } from "Imperators/HarvestImperator";
import { RateTracker } from "Tools/RateTracker";
import { CreepConsul } from "./ConsulBase";
import { HiveQueenBase } from "Queens/HiveQueenBase";

const CONSUL_TYPE = 'H_Consul';
const SOURCE_DATA = 'S_Data';
const TRACKER_PREFIX = 'Track_';
const TEMP_DATA = 'T_DATA';
export class HarvestConsul extends CreepConsul {
    readonly consulType = CONSUL_TYPE;
    TempWorkers!: Creep[];
    SourceData!: HarvestConsul_SourceData[];
    protected SourceHarvestRateTrackers!: RateTracker[];
    _tempData!: { [id: string]: string };
    protected _hasContainers!: boolean;
    Save() {
        this.SetData(TEMP_DATA, this._tempData);
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
        this._tempData = this.GetData(TEMP_DATA);
        this.TempWorkers = [];
        for (let id in this._tempData) {
            let tempCreep = Game.creeps[id];
            if (!tempCreep) {
                delete this._tempData[id];
                continue;
            }
            this.TempWorkers.push(tempCreep);
        }
        this.ScanRoom();
        return true;
    }

    InitMemory() {
        super.InitMemory();
        this.SourceData = [];
        this.SourceHarvestRateTrackers = [];
        this._tempData = {};
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
                data.harvester = '';
            }

            if (data.constructionSite && !Game.getObjectById(data.constructionSite)) {
                data.constructionSite = undefined;
            }

            if (data.containerID) {
                if (!Game.getObjectById(data.containerID)) {
                    data.containerID = undefined;
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
                if (!this.SourceData[i].harvester) {
                    return true;
                }
            }
        }

        return false;
    }

    AssignManagedCreep(creep: Creep) {
        if (!this._tempData[creep.name]) {
            this._tempData[creep.name] = '';//target id
        }
    }

    ReleaseManagedCreep(creepName: string) {
        if (this._tempData[creepName]) {
            delete this._tempData[creepName];
            for (let i = 0, length = this.TempWorkers.length; i < length; i++) {
                if (this.TempWorkers[i].name == creepName) {
                    this.TempWorkers.splice(i, 1);
                    return;
                }
            }
        }
    }

    protected _assignCreep(creepName: string) {
        if (this.SourceData.length == 0) {
            return;
        }
        for (let i = 0, length = this.SourceData.length; i < length; i++) {
            if (!this.SourceData[i].harvester || !Game.creeps[this.SourceData[i].harvester as string]) {
                this.SourceData[i].harvester = creepName;
                return;
            }
        }
        // If we're here, then this creep has no place, return it to the nest.
        this.ReleaseCreep(creepName);
        (this.Parent as HiveQueenBase).ReleaseControl(creepName);
    }

    ReleaseCreep(creepName: string) {
        for (let i = 0, length = this.SourceData.length; i < length; i++) {
            if (this.SourceData[i].harvester && this.SourceData[i].harvester == creepName) {
                this.SourceData[i].harvester = '';
                break;
            }
        }
    }
    GetSpawnDefinition(): SpawnConsul_SpawnArgs {
        return {
            creepName: 'Harv' + ('' + Game.time).slice(-3),
            body: [WORK, WORK, WORK, WORK, WORK, MOVE],
            targetTime: Game.time,
            requestorID: this.consulType,
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