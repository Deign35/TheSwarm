import { CreepConsul } from "Consuls/ConsulBase";
import { HiveQueenBase } from "Queens/HiveQueenBase";

const CONSUL_TYPE = 'Constructor';
const BUILDER_DATA = 'B_Data';
const SITE_DATA = 'S_Data';
export class ConstructionConsul extends CreepConsul {
    static get ConsulType(): string { return CONSUL_TYPE; }
    get consulType(): string { return CONSUL_TYPE }

    BuilderData!: ConstructorData[];
    protected siteData!: { [id: string]: ConstructionRequest };
    Save() {
        this.SetData(BUILDER_DATA, this.BuilderData);
        this.SetData(SITE_DATA, this.siteData);
        super.Save();
    }
    Load() {
        if (!super.Load()) { return false; }

        let allSites = this.Nest.find(FIND_CONSTRUCTION_SITES);
        let validSites: { [id: string]: ConstructionSite } = {}
        this.siteData = this.GetData(SITE_DATA) || {};
        for (let id in this.siteData) {
            let siteId = this.siteData[id].siteId;
            if (allSites[siteId]) {
                validSites[siteId] = allSites[siteId];
                delete allSites[siteId]
            } else {
                if (this.siteData[id].requestor != this.consulType) {
                    // notify the original requestor.
                }
                delete this.siteData[id];
                continue;
            }
        }

        for (let id in allSites) {
            //new sites.
            this.AddSiteForConstruction({ siteId: allSites[id].id, requestor: this.consulType })
            validSites[allSites[id].id] = Game.getObjectById(allSites[id].id) as ConstructionSite;
        }

        this.BuilderData = this.GetData(BUILDER_DATA) || [];
        for (let i = 0, length = this.BuilderData.length; i < length; i++) {
            let creep = Game.creeps[this.BuilderData[i].creepName];
            if (!creep) {
                this.BuilderData.splice(i--, 1);
                continue;
            }
            if (this.BuilderData[i].fetching) {
                if (creep.carry[RESOURCE_ENERGY] == creep.carryCapacity) {
                    (this.Parent as HiveQueenBase).Collector.Consul.ReleaseManagedCreep(creep.name);
                    this.BuilderData[i].fetching = false;
                }
            } else if (!this.BuilderData[i].fetching && creep.carry[RESOURCE_ENERGY] == 0) {
                (this.Parent as HiveQueenBase).Collector.Consul.AssignManagedCreep(creep);
                this.BuilderData[i].fetching = true;
            }
            //Check that the construction site is valid
            if (!validSites[this.BuilderData[i].target]) {
                if (Object.keys(this.siteData).length == 0) {
                    (this.Parent as HiveQueenBase).ReleaseControl(creep);
                    this.ReleaseCreep(creep.name);
                    continue;
                }
                this.BuilderData[i].target = this.siteData[Object.keys(this.siteData)[0]].siteId;
            }
        }

        return true;
    }
    AddSiteForConstruction(request: ConstructionRequest) {
        this.siteData[request.siteId] = request;
    }
    protected _assignCreep(creepName: string): void {
        if(!creepName) {
            throw "ASSIGNMENT IS EMPTY";
        }
        let builderKeys = Object.keys(this.siteData);
        for(let i = 0, length = this.BuilderData.length; i < length; i++) {
            if(this.BuilderData[i].creepName == creepName) {
                return;
            }
        }
        if (builderKeys.length == 0) {
            this.BuilderData.push({ creepName: creepName, target: '', fetching: false });
        } else {
            this.BuilderData.push({ creepName: creepName, target: this.siteData[Object.keys(this.siteData)[0]].siteId, fetching: false });
        }
    }
    ReleaseCreep(creepName: string): void {
        for (let i = 0, length = this.BuilderData.length; i < length; i++) {
            if (this.BuilderData[i].creepName == creepName) {
                this.BuilderData.splice(i, 1);
                return;
            }
        }
    }
    GetSpawnDefinition(): SpawnConsul_SpawnArgs {
        return {
            creepName: 'Build_' + ('' + Game.time).slice(-3),
            body: [WORK, CARRY, CARRY, MOVE],
            targetTime: Game.time,
            requestorID: this.consulType,
        }
    }
    RequiresSpawn(): boolean {
        if (this.CreepRequested) { return false; }
        return Object.keys(this.siteData).length > 0 && this.BuilderData.length < 3;
    }
}

declare type ConstructionRequest = {
    siteId: string,
    requestor: string,
}

declare type ConstructorData = {
    creepName: string,
    target: string,
    fetching: boolean
}