import * as SwarmCodes from "Consts/SwarmCodes"
import * as _ from "lodash";
import { HarvestAction } from "Actions/HarvestAction";
import { HarvestImperator } from "Imperators/HarvestImperator";
import { BootstrapImperator } from "Imperators/BootstrapImperator";
import { RateTracker } from "Tools/RateTracker";
import { CreepConsul } from "./ConsulBase";
import { HiveQueenBase } from "Queens/HiveQueenBase";

const CONSUL_TYPE = 'Collector';
const SOURCE_DATA = 'S_Data';
const TRACKER_PREFIX = 'Track_';
const TEMP_DATA = 'T_DATA';
export class HarvestConsul extends CreepConsul {
    static get ConsulType(): string { return CONSUL_TYPE; }
    get consulType(): string { return CONSUL_TYPE }

    get _Imperator() { return new HarvestImperator() }
    TempWorkers!: Creep[];
    protected CreepData!: CreepConsul_Data[];
    SourceData!: HarvestConsul_SourceData[];
    _tempData!: { [id: string]: string };
    protected _hasContainers!: boolean;
    Save() {
        this.SetData(TEMP_DATA, this._tempData);
        this.SetData(SOURCE_DATA, this.SourceData);
        super.Save();
    }

    Load() {
        if (!super.Load()) { return false; }
        this.SourceData = this.GetData(SOURCE_DATA);
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
        return true;
    }

    InitMemory() {
        super.InitMemory();
        this.SourceData = [];
        this._tempData = {};
        let foundSources = this.Queen.Nest.find(FIND_SOURCES);
        for (let i = 0, length = foundSources.length; i < length; i++) {
            this.SourceData.push(this.InitSourceData(foundSources[i]));
        }
    }

    protected InitSourceData(source: Source): HarvestConsul_SourceData {
        let sourceData = {} as HarvestConsul_SourceData;
        sourceData.sourceID = source.id;
        let sourcePos = source.pos;
        let structures = this.Queen.Nest.lookForAtArea(LOOK_STRUCTURES,
            sourcePos.y - 1, sourcePos.x - 1,
            sourcePos.y + 1, sourcePos.x + 1, true);

        let container = _.filter(structures, (struct) => {
            return struct.structure!.structureType == STRUCTURE_CONTAINER;
        });

        if (container.length > 0) {
            sourceData.containerID = container[0].structure!.id;
        } else {
            let constructionSites = this.Queen.Nest.lookForAtArea(LOOK_CONSTRUCTION_SITES,
                sourcePos.y - 1, sourcePos.x - 1,
                sourcePos.y + 1, sourcePos.x + 1, true);
            let site = _.filter(constructionSites, (site) => {
                return site.constructionSite!.structureType == STRUCTURE_CONTAINER;
            });
            if (site.length > 0) {
                sourceData.constructionSite = site[0].constructionSite!.id;
            }
        }
        return sourceData;
    }
    InitJobRequirements(): void {
        throw new Error("Method not implemented.");
        // Include supplementalData = true/false to correlate with a prime harvester.
    }
    ValidateConsul(): void {
        throw new Error("Method not implemented.");
    }
    ActivateConsul() {
        let sourceData = this.CreepData;
        for (let i = 0, length = sourceData.length; i < length; i++) {
            let data = sourceData[i];
            if (data.creepName && Game.creeps[data.creepName]) {
                if(!data.containerID) {
                    let bootStrapper = new BootstrapImperator();
                    bootStrapper.ActivateHarvester(data, Game.creeps[data.creepName]);
                } else {
                    this.Imperator.ActivateHarvester(data, Game.creeps[data.creepName]);
                }
            }
        }

        let tempWorkers = this.TempWorkers;
        let rotateBackward = Game.time % 2 == 0;
        let curIndex = Game.time % this.SourceData.length;
        for (let id in tempWorkers) {
            if (tempWorkers[id].spawning) { continue; }
            let targetId = this._tempData[tempWorkers[id].name];
            let target: RoomObject | undefined = Game.getObjectById(targetId) || undefined;
            let cycleProtection = 0;
            do {
                if (cycleProtection++ > this.SourceData.length) {
                    break;
                }
                if (!target) {
                    // find a target by cycling through
                    let data = this.SourceData[curIndex];
                    curIndex = rotateBackward ? curIndex - 1 : curIndex + 1;
                    if (curIndex < 0) {
                        curIndex = this.SourceData.length - 1;
                    }
                    if (curIndex >= this.SourceData.length) {
                        curIndex = 0;
                    }

                    if (data.containerID) {
                        target = Game.getObjectById(data.containerID) as StructureContainer;
                        if ((target as StructureContainer).store[RESOURCE_ENERGY] < 10) {
                            target = undefined;
                        }
                    }
                    if (!target && tempWorkers[id].getActiveBodyparts(WORK) > 0) {
                        target = Game.getObjectById(data.sourceID) as Source;
                    }
                    if (!target && data.creepName) {
                        target = Game.creeps[data.creepName];
                    } // last resort is to pull from the harvester, but this doesn't work like this anymore.
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

    AssignCreep(creepName: string, jobId: string) {
        let request = this.Queen.JobBoard.GetJobRequest(jobId);
        if(request && request.requestor == this.consulType) {
            // Assigned creep!
        } else {
            // Temp worker!
        }
    }

    AssignManagedCreep(creep: Creep, acceptsDelivery: boolean = false) {
        if (!this._tempData[creep.name]) {
            this._tempData[creep.name] = '';//target id
            if(acceptsDelivery) {
                this.Queen.Distributor.ScheduleResourceDelivery(creep, creep.carryCapacity);
            }
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
}