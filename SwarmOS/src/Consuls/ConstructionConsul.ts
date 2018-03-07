import * as SwarmConsts from "Consts/SwarmConsts"
import { CreepConsul } from "Consuls/ConsulBase";
import { HiveQueenBase } from "Queens/HiveQueenBase";
import { ConstructionImperator } from "Imperators/ConstructionImperator";

const CONSUL_TYPE = 'Constructor';
const BUILDER_DATA = 'B_Data';
const SITE_DATA = 'S_Data';
const CREEP_SUFFIX = 'Bld';
const SITE_UPDATE_FREQUENCY = 59;
export class ConstructionConsul extends CreepConsul {
    GetSupplementalData() {
        return undefined;
    }
    static get ConsulType(): string { return CONSUL_TYPE; }
    get consulType(): string { return CONSUL_TYPE }
    get _Imperator() {
        return new ConstructionImperator();
    }

    protected CreepData!: ConstructorData[];
    protected siteData!: { [id: string]: ConstructionRequest };
    Save() {
        //this.SetData(BUILDER_DATA, this.CreepData);
        this.SetData(SITE_DATA, this.siteData);
        super.Save();
    }
    Load() {
        if (!super.Load()) { return false; }

        //this.CreepData = this.GetData(BUILDER_DATA) || [];
        this.siteData = this.GetData(SITE_DATA) || {};
        this.ValidateConsulState();
        return true;
    }
    InitMemory() {
        super.InitMemory();
        this.siteData = {};
    }

    AddSiteForConstruction(request: ConstructionRequest) {
        this.siteData[request.siteId] = request;
    }

    RemoveConstructionSite(request: ConstructionRequest) {
        delete this.siteData[request.siteId];
    }

    ValidateConsulState(): void {
        if (Game.time % SITE_UPDATE_FREQUENCY == 0) {
            let existingSites = this.siteData;
            for (let siteId in existingSites) {
                if (!Game.getObjectById(existingSites[siteId].siteId)) {
                    this.RemoveConstructionSite(existingSites[siteId]);
                }
            }
            let newSites = this.Queen.Nest.find<FIND_MY_CONSTRUCTION_SITES>(FIND_MY_CONSTRUCTION_SITES, {
                filter: function (cSite) {
                    return !!(existingSites[cSite.id]);
                }
            });

            for (let i = 0, length = newSites.length; i < length; i++) {
                let cSite = newSites[i];
                let newRequest: ConstructionRequest = {
                    requestor: this.consulType,
                    siteId: cSite.id,
                }

                this.AddSiteForConstruction(newRequest);
            }
        }
    }

    ValidateCreep(creepData: CreepConsul_Data, creep: Creep): boolean {
        let request;// = this.siteData[creepData.targetID!]
        let target;

        do {
            if (!creepData.targetID) {
                for (let id in this.siteData) {
                    creepData.targetID = this.siteData[id].siteId;
                    break;
                }
            }
            request = this.siteData[creepData.targetID!];
            target = Game.getObjectById(request.siteId);
            if (!target && !!request) {
                this.RemoveConstructionSite(request);
            }
        } while (creepData.active && !target && !!request);

        if (!request) {
            // no csites remaining, disperse
        }
        return true;
    }

    GetBodyTemplate(): BodyPartConstant[] {
        return [WORK, CARRY, CARRY, CARRY, MOVE];
    }
    GetCreepSuffix(): string {
        return CREEP_SUFFIX;
    }
    GetSpawnPriority(): SwarmConsts.SpawnPriority {
        return SwarmConsts.SpawnPriority.Low;
    }
    GetNextSpawnTime(): number {
        let nextSpawn = 0;
        if (this.Queen.Nest.find(FIND_CONSTRUCTION_SITES).length > 0) {
            if (this.CreepData.length < 3) {
                return Game.time;
            }

            nextSpawn = Game.time + 1500;
            for (let i = 0; i < this.CreepData.length; i++) {
                let creepSpawn = Game.time - 100 + Game.creeps[this.CreepData[i].creepName].ticksToLive;
                if (creepSpawn < nextSpawn) {
                    nextSpawn = creepSpawn;
                }
            }
        }

        return nextSpawn;
    }
}