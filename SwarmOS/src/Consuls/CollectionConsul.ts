import * as SwarmConsts from "Consts/SwarmConsts";
import { ImperatorBase } from "Imperators/ImperatorBase";
import { CreepConsul } from "Consuls/ConsulBase";
import { HarvestImperator } from "Imperators/HarvestImperator";
import * as Finder from "Tools/TheFinder";

const SOURCE_DATA = 'S_DATA';
const CONSUL_TYPE = 'Collector';
const CREEP_SUFFIX = 'Col';
export class CollectionConsul extends CreepConsul {
    static get ConsulType(): string { return CONSUL_TYPE; }
    get consulType(): string { return CONSUL_TYPE }
    get _Imperator() { return new HarvestImperator() }

    protected CreepData!: CollectorConsul_CreepData[];
    protected SourceData!: SourceData[];
    Save() {
        this.SetData(SOURCE_DATA, this.SourceData);
        super.Save();
    }

    Load() {
        if (!super.Load()) { return false; }
        this.SourceData = this.GetData(SOURCE_DATA);
        return true;
    }

    InitMemory() {
        let sources = this.Queen.Nest.find(FIND_SOURCES);
        this.SourceData = [];
        for (let i = 0, length = sources.length; i < length; i++) {
            let newSource = {
                sourceId: sources[i].id,
            } as SourceData;

            let pos = sources[i].pos;
            let foundStructures = Finder.FindStructureNextTo(pos, STRUCTURE_CONTAINER, { distance: 1 });
            if (foundStructures.length > 0) {
                // We have a container!
                if (foundStructures.length > 1) {
                    Game.notify('Somehow found multiple Containers near ID: ' + sources[i].id + ' in room: ' + this.Queen.id);
                }
                pos = foundStructures[0].structure!.pos;
            } else {
                let foundConstructionSites = Finder.FindNextTo(pos, LOOK_CONSTRUCTION_SITES, { distance: 1 });
                foundConstructionSites.filter((a) => {
                    return a.constructionSite && (a.constructionSite! as ConstructionSite<BuildableStructureConstant>).structureType == STRUCTURE_CONTAINER;
                });
                if (foundConstructionSites.length > 0) {
                    // we have a construction site.  This should already be picked up by the StructurePlanner.
                    if (foundConstructionSites.length > 1) {
                        Game.notify('Somehow found multiple Containers near ID: ' + sources[i].id + ' in room: ' + this.Queen.id);
                    }
                    pos = (foundConstructionSites[0].constructionSite! as ConstructionSite<BuildableStructureConstant>).pos;
                } else {
                    // StructurePlanner.NewSite(STRUCTURE_CONTAINER);
                }
            }

            newSource.harvesterPositionX = pos.x;
            newSource.harvesterPositionY = pos.y;

            this.SourceData.push(newSource);
        }
        super.InitMemory();
    }
    AssignCreep(creepName: string, jobId: string) {
        super.AssignCreep(creepName, jobId);
        let job = this.Queen.JobBoard.GetJobRequest(jobId);
        for (let i = 0; i < this.CreepData.length; i++) {
            if (this.CreepData[i].creepName == creepName) {
                this.CreepData[i].targetID = this.SourceData[job.supplementalData].sourceId;

                this.CreepData[i].harvestPosition = new RoomPosition(this.SourceData[job.supplementalData].harvesterPositionX, this.SourceData[job.supplementalData].harvesterPositionY, this.Queen.id);
                break;
            }
        }
    }
    ValidateCreep(creepData: CollectorConsul_CreepData, creep: Creep): boolean {
        creepData.harvestPosition = new RoomPosition(creepData.harvestPosition.x,
            creepData.harvestPosition.y,
            creepData.harvestPosition.roomName);

        return true;
    }

    GetBodyTemplate(): BodyPartConstant[] {
        if (this.Queen.Nest.energyCapacityAvailable < 550) {
            return [WORK, WORK, CARRY, MOVE];
        } else if (this.Queen.Nest.energyCapacityAvailable < 700) {
            return [WORK, WORK, WORK, WORK, WORK, MOVE]
        } else {
            return [WORK, WORK, WORK, WORK, WORK, WORK, CARRY, MOVE];
        }
    }
    GetCreepSuffix(): string {
        return CREEP_SUFFIX;
    }
    GetSpawnPriority(): SwarmConsts.SpawnPriority {
        if (this.CreepData.length == 0) {
            return SwarmConsts.SpawnPriority.EMERGENCY;
        }
        return SwarmConsts.SpawnPriority.Highest;
    }
    GetSupplementalData(): any {
        let sourceIds: { [id: string]: boolean } = {};
        for (let i = 0; i < this.CreepData.length; i++) {
            if (this.CreepData[i].targetID) {
                sourceIds[this.CreepData[i].targetID!] = true;
            }
        }
        for (let i = 0; i < this.SourceData.length; i++) {
            if (!sourceIds[this.SourceData[i].sourceId]) {
                return i;
            }
        }
        return super.GetSupplementalData();
    };
    GetNextSpawnTime(): number {
        let sourceStatus: { [id: string]: number } = {};
        for (let i = 0; i < this.CreepData.length; i++) {
            if (this.CreepData[i].targetID) {
                sourceStatus[this.CreepData[i].targetID!] = Game.time - 100 + Game.creeps[this.CreepData[i].creepName].ticksToLive;
            }
        }

        let nextSpawn = Game.time + 1500;
        for (let i = 0; i < this.SourceData.length; i++) {
            if (sourceStatus[this.SourceData[i].sourceId]) {
                if (sourceStatus[this.SourceData[i].sourceId] < nextSpawn) {
                    nextSpawn = sourceStatus[this.SourceData[i].sourceId];
                }
            } else {
                return Game.time;
            }
        }

        return nextSpawn;
    }
}

declare type SourceData = {
    sourceId: string,
    harvesterPositionX: number,
    harvesterPositionY: number
    //room distance map for choosing predefined paths.
}