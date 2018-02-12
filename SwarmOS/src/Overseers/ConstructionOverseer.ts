import * as _ from "lodash";
import * as SwarmEnums from "SwarmEnums";
import { OverseerBase } from "Overseers/OverseerBase";
import { BuildAction } from "Actions/BuildAction";

const BUILDER_DATA = 'BD';
const NEW_SITES = 'NS';
const REQUEST_DATA = 'RD';
export class ConstructionOverseer extends OverseerBase { // Needs a different name.
    Hive!: Room;
    protected RequestData!: {[siteID: string]: BuildOrder}
    protected BuilderCreeps!: {[creepName:string]: { siteID?: string, orderID?: string }};
    protected newSites!: {build: BuildOrder, pos: {x: number, y:number, roomName: string}}[];
    protected _loadedSites!: {[id: string]: ConstructionSite};

    Save() {
        this.SetData(BUILDER_DATA, this.BuilderCreeps);
        this.SetData(REQUEST_DATA, this.RequestData);
        this.SetData(NEW_SITES, this.newSites);
        super.Save();
    }

    Load() {
        super.Load();
        this.Hive = Game.rooms[this.ParentMemoryID];
        this.BuilderCreeps = this.GetData(BUILDER_DATA) || {};
        this.RequestData = this.GetData(REQUEST_DATA) || {};
        this.newSites = this.GetData(NEW_SITES) || [];
        this._loadedSites = {};
    }

    HasResources(): boolean { return false; } // It's just easier for now...

    ValidateOverseer() {
        let registry = OverseerBase.CreateEmptyOverseerRegistry();
        while(this.newSites.length > 0) {
            let locData = this.newSites.pop();
            if(!locData) break;
            let newLocation = new RoomPosition(locData.pos.x, locData.pos.y, locData.pos.roomName);
            let newCSite = newLocation.lookFor(LOOK_CONSTRUCTION_SITES);
            let siteID = newCSite.length > 0 ? (newCSite[0] as ConstructionSite).id : '';
            if(siteID != '') {
                this.RequestData[siteID] = locData.build;
            }
        }

        let requestedBuilders = 0;
        let openJobs = [];
        for(let siteID in this.RequestData) {
            let siteObj = Game.getObjectById(siteID) as ConstructionSite;
            if(!siteObj) {
                delete this.RequestData[siteID];
                continue;
            }
            this._loadedSites[siteObj.id] = siteObj;
            let requested = this.RequestData[siteID].numBuilders - this.RequestData[siteID].assignedBuilders;
            requestedBuilders += requested;
            if(requestedBuilders > 0) {
                openJobs.push(siteID);
            }
        }

        let unassignedCreeps: Creep[] = [];
        for(let creepName in this.BuilderCreeps) {
            let creep = Game.creeps[creepName];
            if(!creep) {
                delete this.BuilderCreeps[creepName];
                continue;
            }
            let curID = this.BuilderCreeps[creepName].siteID;
            if(!curID) {
                unassignedCreeps.push(creep);
                continue;
            }
            let cSite = curID && this._loadedSites[curID]; // Consolidate these game.getobjectbyId calls.
            if(!cSite) {
                unassignedCreeps.push(creep);
                continue;
            }

            let orderID = (this.BuilderCreeps[creepName].orderID && this.BuilderCreeps[creepName].orderID) as string || undefined;
            let validOrder = orderID && this.Queen.Distribution.CheckOrderIDIsValid(orderID);
            if(!validOrder) {
                registry.Requirements.Resources.push({amount: creep.carryCapacity, location: creep, type: RESOURCE_ENERGY})
            }
        }

        if(openJobs.length > 0) {
            openJobs.sort((a: string, b: string) => {
                let aCount = this.RequestData[a].numBuilders - this.RequestData[a].assignedBuilders;
                let bCount = this.RequestData[b].numBuilders - this.RequestData[b].assignedBuilders;
                if(a < b) {
                    return -1;
                }
                if(b < a) {
                    return 1;
                }
                return 0;
            })
            for(let i = 0, length = unassignedCreeps.length; i < length; i++) {
                this.BuilderCreeps[unassignedCreeps[i].name].siteID = openJobs[0];
                this.RequestData[openJobs[0]].assignedBuilders++;
            }
        }
        if(Object.keys(this.BuilderCreeps).length * 4 <= requestedBuilders) { // 1 builder per max
            registry.Requirements.Creeps.push({time: 0, creepBody: [MOVE, CARRY, CARRY, WORK]});
        }

        this.Registry = registry;
    }

    ActivateOverseer() {
        for(let name in this.BuilderCreeps) {
            let creep = Game.creeps[name];
            let targetSite = this._loadedSites[this.BuilderCreeps[name].siteID as string];
            if(!targetSite) {
                console.log('THIS IS NOT POSSIBLE { ConstructionOverseer.targetSite }');
                continue;
            }
            let action = new BuildAction(creep, targetSite);
            let actionResponse =action.Run()
            // I actually basically don't care what the result is
            // For now I will continue to check as a verification tool
            switch (actionResponse) {
                case (SwarmEnums.CRT_None):
                case (SwarmEnums.CRT_Condition_Empty):
                case (SwarmEnums.CRT_Next):
                case (SwarmEnums.CRT_Move): break;
                default:
                    console.log('THIS IS NOT POSSIBLE [' + actionResponse + ']{ ArchitectureOverseer.actionResponse }');
            }
        }
    }

    AssignCreep(creepName: string): void {
        if(this.BuilderCreeps[creepName]) {
            this.ReleaseCreep(creepName, 'Reassignment');
        }

        this.BuilderCreeps[creepName] = {};
    }

    ReleaseCreep(creepName: string, releaseReason: string) {
        if(this.BuilderCreeps[creepName]) {
            if(this.BuilderCreeps[creepName].orderID && this.RequestData[this.BuilderCreeps[creepName].orderID as string]){
                this.RequestData[this.BuilderCreeps[creepName].orderID as string].assignedBuilders -= 1;
            }
        }
    }

    AssignOrder(orderID: string): boolean {
        let orderDetails = this.Queen.Distribution.RetreiveOrderDetails(orderID);
        for(let name in this.BuilderCreeps) {
            if(Game.creeps[name].id == orderDetails.toTarget) {
                // Found our guy
                this.BuilderCreeps[name].orderID = orderID;
                return true;
            }
        }
        return false;
    }

    CreateNewStructure(type: BuildableStructureConstant, pos: RoomPosition, numBuilders: number) {
        let siteResult = pos.createConstructionSite(type);
        if(siteResult == OK) {
            this.newSites.push({pos: pos, build: {assignedBuilders: 0, numBuilders: numBuilders}});
        }
        return siteResult;
    }
}