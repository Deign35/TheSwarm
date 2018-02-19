import { CreepConsul } from "Consuls/ConsulBase";

const CONSUL_TYPE = 'Constructor';
const BUILDER_DATA = 'B_Data';
const SITE_DATA = 'S_Data';
export class ConstructionConsul extends CreepConsul {
    static get ConsulType(): string { return CONSUL_TYPE; }
    get consulType(): string { return CONSUL_TYPE }
    //BuilderCreeps!: Creep[];
    //Sites!: ConstructionSite[];

    BuilderData!: ConstructorData[];
    protected siteData!: { [id: string]: ConstructionRequest };
    Save() {
        this.SetData(BUILDER_DATA, this.BuilderData);
        this.SetData(SITE_DATA, this.siteData);
        super.Save();
    }
    Load() {
        if (!super.Load()) { return false; }

        // :(  not working
        let allSites = this.Nest.find(FIND_CONSTRUCTION_SITES);
        let validSites: { [id: string]: ConstructionSite } = {}
        this.siteData = this.GetData(SITE_DATA) || {};
        for (let id in this.siteData) {
            let siteId = this.siteData[id].siteId;
            if (allSites[siteId]) {
                validSites[siteId] = allSites[siteId];
                delete allSites[siteId]
            } else if (!Game.constructionSites[siteId]) {
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

        this.BuilderData = this.GetData(BUILDER_DATA) || {};
        for (let i = 0, length = this.BuilderData.length; i < length; i++) {
            if (!Game.creeps[this.BuilderData[i].creepName]) {
                this.BuilderData.splice(i--, 1);
                continue;
            }

            //Check that the construction site is valid
            if (!validSites[this.BuilderData[i].target]) {
                if (!this.siteData[0]) {
                    this.BuilderData[i].target = '';
                    continue;
                }
                this.BuilderData[i].target = this.siteData[0].siteId;
            }
        }

        return true;
    }
    AddSiteForConstruction(request: ConstructionRequest) {
        this.siteData[request.siteId] = request;
    }

    protected IsCreepIdle(creepIndex: number): boolean {
        let creep = Game.creeps[this.BuilderData[creepIndex].creepName];
        if (creep.spawning) { return false; }
        if (this.BuilderData[creepIndex].target == '') {
            return true;
        }
        if ((creep.carry[RESOURCE_ENERGY] || 0) == 0) {
            return true;
        }

        return false;
    }
    GetIdleCreeps(): Creep[] {
        let idleCreeps: Creep[] = [];
        for (let i = 0, length = this.BuilderData.length; i < length; i++) {
            if (this.IsCreepIdle(i)) {
                idleCreeps.push(Game.creeps[this.BuilderData[i].creepName]);
                continue;
            }
        }

        return idleCreeps;
    }
    protected _assignCreep(creepName: string): void {
        if (Object.keys(this.siteData).length == 0) {
            this.BuilderData.push({ creepName: creepName, target: '' });
        } else {
            this.BuilderData.push({ creepName: creepName, target: this.siteData[0].siteId });
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
}