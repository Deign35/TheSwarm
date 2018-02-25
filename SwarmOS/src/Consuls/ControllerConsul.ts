import * as SwarmConsts from 'Consts/SwarmConsts';
import * as SwarmCodes from 'Consts/SwarmCodes';
import * as _ from "lodash";
import { CreepConsul } from "Consuls/ConsulBase";
import { ControllerImperator } from "Imperators/ControllerImperator";

const CONSUL_TYPE = 'Controller';
const LAST_UPDATE = 'LAST_RCL';
export class ControllerConsul extends CreepConsul {
    static get ConsulType(): string { return CONSUL_TYPE; }
    get consulType(): string { return CONSUL_TYPE }

    get _Imperator() {
        return new ControllerImperator();
    }
    Controller!: StructureController;
    CreepData!: CreepConsul_Data[];

    Load() {
        if (!super.Load()) { return false }
        this.Controller = this.Queen.Nest.controller!;

        if(this.Controller.progress < 1000 && this.GetData(LAST_UPDATE) != this.Controller.level) {
            this.InitJobRequirements();
            this.SetData(LAST_UPDATE, this.Controller.level);
        }
        return true;
    }

    ValidateConsulState(): void { // spawn data managed from in here.
        if(!this.Controller) { return; }
        if (!this.Controller.my && // I dont control it
            (!this.Controller.reservation ||
                this.Controller.reservation.username != SwarmConsts.MY_USERNAME)) { // I dont have it reserved
            console.log('Lost control of this nest');
            // Need to update the NestQueen and on up.
        }
        for (let i = 0; i < this.CreepData.length; i++) {
            let creep = Game.creeps[this.CreepData[i].creepName];
            if (!creep) {
                this.CreepData.splice(i--, 1);
                continue;
            }
            if (this.CreepData[i].fetching) {
                if (creep.carry[RESOURCE_ENERGY] == creep.carryCapacity) {
                    this.Queen.Collector.ReleaseManagedCreep(creep.name);
                    this.CreepData[i].fetching = false;
                }
            } else if (creep.carry[RESOURCE_ENERGY] == 0) {
                this.Queen.Collector.AssignManagedCreep(creep, true);
                this.CreepData[i].fetching = true;
            }
        }
    }

    InitMemory() {
        super.InitMemory();
        if (!this.Queen.Nest.controller) {
            throw 'ATTEMPTING TO ADD CONTROLLERCONSUL TO A ROOM WITH NO CONTROLLER'
        }
    }

    InitJobRequirements() {
        if(!this.Controller) { this.JobIDs = []; return;}
        let newJobList = this.JobIDs || [];
        while(newJobList.length > 0) {
            let creep = newJobList[0];
            newJobList.splice(0, 1);
            this.Queen.JobBoard.RemoveJobRequest(creep);
            this.Queen.ReleaseControl(creep)
            this.ReleaseCreep(creep);
        }

        let nestID = this.Queen.id;
        let requestTemplate: CreepRequestData = { body: [WORK, CARRY, MOVE], // 200 / 300
            creepSuffix: this.Queen.id,
            priority: SwarmConsts.SpawnPriority.Lowest,
            requestID: this.Queen.id,
            requestor: this.consulType,
            targetTime: Game.time + 2000,
            terminationType: SwarmConsts.SpawnRequest_TerminationType.Infinite,
            supplementalData: 1 } // Number of jobs needed.
        switch(this.Controller.level) {
            case(1): break;
            case(2):
                requestTemplate.supplementalData = 8; // 4400 energy required per 1500 ticks.  of 30000 potential
                requestTemplate.body = [WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE]; // 550 / 550
                break;
            case(3):
                requestTemplate.supplementalData = 8; // 4400 energy required per 1500 ticks.  of 30000 potential
                requestTemplate.body = [WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE]; // 550 / 550
                break;
            case(4):
                requestTemplate.supplementalData = 8; // 4400 energy required per 1500 ticks.  of 30000 potential
                requestTemplate.body = [WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE]; // 550 / 550
                break;
            case(5):
                requestTemplate.supplementalData = 8; // 4400 energy required per 1500 ticks.  of 30000 potential
                requestTemplate.body = [WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE]; // 550 / 550
                break;
            case(6):
                requestTemplate.supplementalData = 8; // 4400 energy required per 1500 ticks.  of 30000 potential
                requestTemplate.body = [WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE]; // 550 / 550
                break;
            case(7):
                requestTemplate.supplementalData = 8; // 4400 energy required per 1500 ticks.  of 30000 potential
                requestTemplate.body = [WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE]; // 550 / 550
                break;
            case(8):
                requestTemplate.body = [WORK, WORK, WORK, WORK, WORK,
                    WORK, WORK, WORK, WORK, WORK,
                    WORK, WORK, WORK, WORK, WORK,
                    CARRY, CARRY, CARRY, CARRY, CARRY, // 20 parts -- 1750 energy
                    CARRY, CARRY, CARRY, CARRY, CARRY,
                    CARRY, CARRY, CARRY, CARRY, CARRY,
                    CARRY, CARRY, CARRY, CARRY, CARRY,
                    CARRY, CARRY, CARRY, CARRY, CARRY,// 20 parts -- 1000 energy
                    MOVE, MOVE, MOVE, MOVE, MOVE,
                    MOVE, MOVE, MOVE, MOVE, MOVE]; // 10 parts -- 500 energy
                    // Total: 50 parts -- 3250 energy
                break;
        }

        this.JobIDs = [];
        for(let i = 0; i < requestTemplate.supplementalData; i++) {
            let newReqID = requestTemplate.creepSuffix + i;
            this.JobIDs.push(newReqID);
            this.Queen.JobBoard.AddOrUpdateJobPosting({
                body: requestTemplate.body,
                priority: requestTemplate.priority,
                targetTime: requestTemplate.targetTime,
                terminationType: requestTemplate.terminationType,
                requestor: requestTemplate.requestor,
                creepSuffix: newReqID,
                requestID: newReqID,
            })
        }
    }
    ReleaseCreep(creepName: string): void {
        for (let i = 0, length = this.CreepData.length; i < length; i++) {
            if (this.CreepData[i].creepName == creepName) {
                if (this.CreepData[i].fetching) {
                    this.Queen.Collector.ReleaseManagedCreep(creepName);
                }
                this.CreepData.splice(i, 1);
                return;
            }
        }
    }
}