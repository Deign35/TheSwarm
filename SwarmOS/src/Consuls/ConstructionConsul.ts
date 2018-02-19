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
    protected siteData!: ConstructionRequest[];
    Save() {
        this.SetData(BUILDER_DATA, this.BuilderData);
        this.SetData(SITE_DATA, this.siteData);
        super.Save();
    }
    Load() {
        if (!super.Load()) { return false; }

        this.BuilderData = this.GetData(BUILDER_DATA);
        for (let i = 0, length = this.BuilderData.length; i < length; i++) {
            if (!Game.creeps[this.BuilderData[i].creepName]) {
                this.BuilderData.splice(i--, 1);
                continue;
            }
            //this.BuilderCreeps.push(Game.creeps[this.BuilderData[i].creepName]);
        }

        this.siteData = this.GetData(SITE_DATA);
        for (let i = 0, length = this.siteData.length; i < length; i++) {
            if (!Game.constructionSites[this.siteData[i].siteId]) {
                this.siteData.splice(i--, 1);
                // Notify the requestor that their building is complete.
                continue;
            }
            //this.Sites.push(Game.constructionSites[this.siteData[i].siteId]);
        }

        return true;
    }
    AddSiteForConstruction(request: ConstructionRequest) {
        let site = Game.getObjectById(request.siteId) as ConstructionSite;
        //this.Sites.push(site);
        this.siteData.push({ siteId: site.id, requestor: request.requestor });
    }

    protected IsCreepIdle(creepIndex: number): boolean {
        if (this.BuilderData[creepIndex].target == '') {
            return true;
        }
        let creep = Game.creeps[this.BuilderData[creepIndex].creepName];
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

    HasIdleCreeps(): boolean {
        for (let i = 0, length = this.BuilderData.length; i < length; i++) {
            if (this.IsCreepIdle(i)) {
                return true;
            }
        }

        return false;
    }
    protected _assignCreep(creepData: SpawnConsul_SpawnArgs): void {
        if (!this.siteData[0]) {
            this.Parent.ReturnCreep(Game.creeps[creepData.creepName]);
            return;
        }
        this.BuilderData.push({ creepName: creepData.creepName, target: this.siteData[0].siteId });
    }
    ReleaseCreep(creepName: string): void {
        for (let i = 0, length = this.BuilderData.length; i < length; i++) {
            if (this.BuilderData[i].creepName == creepName) {
                this.BuilderData.splice(i, 1);
                this.Parent.ReturnCreep(Game.creeps[creepName])
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
        return this.BuilderData.length < 3;
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