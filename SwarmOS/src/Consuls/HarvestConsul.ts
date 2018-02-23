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
    Imperator!: HarvestImperator;
    readonly consulType = CONSUL_TYPE;
    TempWorkers!: Creep[];
    CreepData!: HarvestConsul_SourceData[];
    _tempData!: { [id: string]: string };
    protected _hasContainers!: boolean;
    Save() {
        this.SetData(TEMP_DATA, this._tempData);
        this.SetData(SOURCE_DATA, this.CreepData);
        super.Save();
    }

    Load() {
        if (!super.Load()) { return false; }
        this.CreepData = this.GetData(SOURCE_DATA);
        this._tempData = this.GetData(TEMP_DATA);
        this.TempWorkers = [];
        for (let id in this._tempData) {
            let tempCreep = Game.creeps[id];
            if (!tempCreep) {
                console.log('Temp Creep deleted cause it was dead[' + id + ']: ' + JSON.stringify(this._tempData));
                delete this._tempData[id];
                continue;
            }
            this.TempWorkers.push(tempCreep);
        }
        this.ScanRoom();
        this.Imperator = new HarvestImperator();
        return true;
    }

    InitMemory() {
        super.InitMemory();
        this.CreepData = [];
        this._tempData = {};
        let foundSources = this.Queen.Nest.find(FIND_SOURCES);
        for (let i = 0, length = foundSources.length; i < length; i++) {
            this.CreepData.push(this.InitSourceData(foundSources[i]));
        }
        this.ScanRoom();
    }

    ScanRoom(): void {
        for (let i = 0, length = this.CreepData.length; i < length; i++) {
            let data = this.CreepData[i];
            let sourceTarget = Game.getObjectById(data.id) as Source;
            if (data.creepName && !Game.creeps[data.creepName as string]) {
                data.creepName = '';
            }

            if (data.constructionSite && !Game.getObjectById(data.constructionSite)) {
                data.constructionSite = undefined;
            }

            if (data.containerID) {
                if (!Game.getObjectById(data.containerID)) {
                    data.containerID = undefined;
                }
            }
            this.CreepData[i] = data;
        }
    }

    GetNextSpawn(): boolean {
        // Calculates the distance to new sources
        // Orders creation of new screep so that they will arrive at the harvest node
        // just a few ticks before the previous one dies.
        if (!this.CreepRequested) {
            for (let i = 0, length = this.CreepData.length; i < length; i++) {
                if (!this.CreepData[i].creepName) {
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

        console.log("Release Managed Creep with name[" + creepName + "]: was not assigned to harvest consul");
    }

    protected _assignCreep(creepName: string) {
        if (this.CreepData.length == 0) {
            return;
        }
        for (let i = 0, length = this.CreepData.length; i < length; i++) {
            if (!this.CreepData[i].creepName || !Game.creeps[this.CreepData[i].creepName as string]) {
                this.CreepData[i].creepName = creepName;
                return;
            }
        }
        // If we're here, then this creep has no place, return it to the nest.
        console.log("Assign regular Creep with name[" + creepName + "]: had no where to focus harvesting.");
        this.ReleaseCreep(creepName);
        (this.Parent as HiveQueenBase).Upgrader.AssignSpawn(creepName); // this is really shitty.
    }

    ReleaseCreep(creepName: string) {
        for (let i = 0, length = this.CreepData.length; i < length; i++) {
            if (this.CreepData[i].creepName && this.CreepData[i].creepName == creepName) {
                this.CreepData[i].creepName = '';
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
        let structures = this.Queen.Nest.lookForAtArea(LOOK_STRUCTURES,
            sourceData.y - 1, sourceData.x - 1,
            sourceData.y + 1, sourceData.x + 1, true);

        let container = _.filter(structures, (struct) => {
            return (struct.structure as Structure).structureType == STRUCTURE_CONTAINER;
        });

        if (container.length > 0) {
            sourceData.containerID = (container[0].structure as Structure).id;
        } else {
            let constructionSites = this.Queen.Nest.lookForAtArea(LOOK_CONSTRUCTION_SITES,
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
    ActivateConsul() {
        // Request hive harvesters from the nestqueen.
        let sourceData = this.CreepData;
        for (let i = 0, length = sourceData.length; i < length; i++) {
            let data = sourceData[i];
            if (data.creepName && Game.creeps[data.creepName]) {
                this.Imperator.ActivateHarvester(data, Game.creeps[data.creepName]);
            }
        }

        let tempWorkers = this.TempWorkers;
        let rotateBackward = Game.time % 2 == 0;
        let curIndex = Game.time % this.CreepData.length;
        for (let id in tempWorkers) {
            if (tempWorkers[id].spawning) { continue; }
            let targetId = this._tempData[tempWorkers[id].name];
            let target: RoomObject | undefined = Game.getObjectById(targetId) || undefined;
            let cycleProtection = 0;
            do {
                if (cycleProtection++ > this.CreepData.length) {
                    break;
                }
                if (!target) {
                    // find a target by cycling through
                    let data = this.CreepData[curIndex];
                    curIndex = rotateBackward ? curIndex - 1 : curIndex + 1;
                    if (curIndex < 0) {
                        curIndex = this.CreepData.length - 1;
                    }
                    if (curIndex >= this.CreepData.length) {
                        curIndex = 0;
                    }

                    if (data.containerID) {
                        target = Game.getObjectById(data.containerID) as StructureContainer;
                        if ((target as StructureContainer).store[RESOURCE_ENERGY] < 10) {
                            target = undefined;
                        }
                    }
                    if (!target && tempWorkers[id].getActiveBodyparts(WORK) > 0) {
                        target = Game.getObjectById(data.id) as Source;
                    }
                    if (!target && data.creepName) {
                        target = Game.creeps[data.creepName];
                    }
                }
                if (target) {
                    if ((target as Source).energyCapacity) {
                    } else if ((target as StructureContainer).storeCapacity) {
                        if ((target as StructureContainer).store[RESOURCE_ENERGY] == 0) {
                            target = undefined;
                            continue;
                        }
                    } else if ((target as Creep).carryCapacity) {
                        if ((target as Creep).carry[RESOURCE_ENERGY] == 0) {
                            target = undefined;
                            continue;
                        }
                    } else {
                        target = undefined;
                        continue;
                    }
                    //let targetId = this.Consul._tempData[tempWorkers[id].name];
                    //let target: RoomObject | undefined = Game.getObjectById(targetId) || undefined;
                    this._tempData[tempWorkers[id].name] = (target as Source).id;
                    break;
                }
            } while (!target);
            this.Imperator.ActivateTempWorker(tempWorkers[id], target as Source | StructureContainer | Creep);
        }
        return SwarmCodes.C_NONE; // unused
    }

    static get ConsulType(): string { return CONSUL_TYPE; }
}