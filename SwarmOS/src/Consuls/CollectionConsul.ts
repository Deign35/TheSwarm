import * as SwarmConsts from "Consts/SwarmConsts";
import { ImperatorBase } from "Imperators/ImperatorBase";
import { CreepConsul } from "Consuls/ConsulBase";
import { HarvestImperator } from "Imperators/HarvestImperator";
import * as Finder from "Tools/TheFinder";
import { BootstrapImperator } from "Imperators/BootstrapImperator";

const SOURCE_DATA = 'S_DATA';
const CONSUL_TYPE = 'Collector';
const CREEP_SUFFIX = 'Col';
export class CollectionConsul extends CreepConsul {
    static get ConsulType(): string { return CONSUL_TYPE; }
    get consulType(): string { return CONSUL_TYPE }
    get _Imperator() { return new HarvestImperator(); }

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
            let foundSupportStructure = this.FindCollectionContainer(sources[i]);
            if (foundSupportStructure) {
                newSource.container = foundSupportStructure.id;
            }

            this.SourceData.push(newSource);
        }
        super.InitMemory();
    }
    GetCollectionTarget(creepData: CreepConsul_Data): StructureContainer | Resource | undefined {
        for (let i = 0; i < this.SourceData.length; i++) {
            if (this.SourceData[i].container) {
                let container = Game.getObjectById(this.SourceData[i].container);
                if ((container as ConstructionSite).progress) {
                    continue;
                }

                return container as StructureContainer;
            }
        }

        for (let i = 0; i < this.CreepData.length; i++) {
            let creep = Game.creeps[this.CreepData[i].creepName];
            if (creep.pos.lookFor(LOOK_RESOURCES)) {
                return creep.pos.lookFor(LOOK_RESOURCES)[0];
            }
        }

        return undefined;
    }
    protected FindCollectionContainer(source: Source): ConstructionSite | StructureContainer | undefined {
        let pos = source.pos;
        let foundStructures = Finder.FindStructureNextTo(pos, STRUCTURE_CONTAINER, { distance: 1 });
        if (foundStructures.length > 0) {
            // We have a container!
            if (foundStructures.length > 1) {
                Game.notify('Somehow found multiple Containers near ID: ' + source.id + ' in room: ' + this.Queen.id);
            }
            return foundStructures[0].structure! as StructureContainer;
            //pos = foundStructures[0].structure!.pos;
        } else {
            let foundConstructionSites = Finder.FindNextTo(pos, LOOK_CONSTRUCTION_SITES, { distance: 1 });
            foundConstructionSites.filter((a) => {
                return a.constructionSite && (a.constructionSite! as ConstructionSite<BuildableStructureConstant>).structureType == STRUCTURE_CONTAINER;
            });
            if (foundConstructionSites.length > 0) {
                // we have a construction site.  This should already be picked up by the StructurePlanner.
                if (foundConstructionSites.length > 1) {
                    Game.notify('Somehow found multiple Containers near ID: ' + source.id + ' in room: ' + this.Queen.id);
                }
                return foundConstructionSites[0].constructionSite! as ConstructionSite<BuildableStructureConstant>;
                //pos = (foundConstructionSites[0].constructionSite! as ConstructionSite<BuildableStructureConstant>).pos;
            }
        }

        return undefined;
    }
    AssignCreep(creepName: string, supplementalData: any) {
        if (supplementalData != undefined && supplementalData < this.SourceData.length) {
            let sourceData = this.SourceData[supplementalData];
            let source = Game.getObjectById(sourceData.sourceId) as Source;
            let pos = source.pos;
            if (sourceData.container && Game.getObjectById(sourceData.container)) {
                pos = (Game.getObjectById(sourceData.container) as StructureContainer).pos;
            }
            this.CreepData.push({
                creepName: creepName, active: true, targetID: sourceData.sourceId,
                harvestPosition: new RoomPosition(pos.x, pos.y, pos.roomName)
            })
        } else {
            this.ReleaseCreep(creepName);
        }
    }
    protected ValidateConsulState(): void {
        for (let i = 0; i < this.SourceData.length; i++) {
            if (!this.SourceData[i].container) {

            }
        }
    }
    protected ValidateCreep(creepData: CollectorConsul_CreepData, creep: Creep): boolean {
        if (!creepData.containerID) {
            for (let i = 0; i < this.SourceData.length; i++) {
                if (this.SourceData[i].sourceId == creepData.targetID) {
                    let foundObj = this.FindCollectionContainer(Game.getObjectById(this.SourceData[i].sourceId) as Source);
                    if (foundObj) {
                        this.SourceData[i].container = foundObj.id;
                        creepData.harvestPosition = foundObj.pos;
                        return true;
                    }
                }
            }
        }
        creepData.harvestPosition = new RoomPosition(creepData.harvestPosition.x,
            creepData.harvestPosition.y,
            creepData.harvestPosition.roomName);

        return true;
    }
    GetBodyTemplate(): BodyPartConstant[] {
        if (this.Queen.SpawnCapacity <= 550) {
            return [WORK, WORK, CARRY, MOVE];
        } else if (this.Queen.SpawnCapacity < 800) {
            return [WORK, WORK, WORK, WORK, WORK, MOVE]
        } else {
            return [WORK, WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE];
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
        let index = -1;
        let nextToDie = 1500;
        for (let i = 0; i < this.CreepData.length; i++) {
            if (this.CreepData[i].targetID) {
                sourceIds[this.CreepData[i].targetID!] = true;
            }
            let creep = Game.creeps[this.CreepData[i].creepName];
            if (creep.ticksToLive < nextToDie) {
                index = i;
                nextToDie = creep.ticksToLive;
            }
        }
        for (let i = 0; i < this.SourceData.length; i++) {
            if (!sourceIds[this.SourceData[i].sourceId]) {
                return i;
            }
        }

        if (index >= 0 && nextToDie <= 100) {
            return index;
        }
        return undefined;
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
                return Game.time - 50;
            }
        }

        return nextSpawn;
    }
}

declare type SourceData = {
    sourceId: string,
    container?: string,
    //room distance map for choosing predefined paths.
}