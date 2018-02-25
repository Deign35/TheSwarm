import * as SwarmCodes from "consts/SwarmCodes"
import { ChildMemory } from "Tools/SwarmMemory";
import { NestQueenBase } from "Queens/NestQueenBase";
import { ImperatorBase } from "Imperators/ImperatorBase";

export abstract class ConsulBase extends ChildMemory implements IConsul {
    get Queen(): NestQueenBase { return this.Parent as NestQueenBase; }
    constructor(id: string, parent: NestQueenBase) {
        super(id, parent);
    }
    Load() {
        if (!super.Load()) { return false; }
        this.Queen.Nest = Game.rooms[this.Queen.id];

        return true;
    }
    InitMemory() {
        super.InitMemory();
        this.Queen.Nest = Game.rooms[this.Queen.id];
    }
    abstract ValidateConsulState(): void;
    abstract ActivateConsul(): void;
    abstract get consulType(): string;
    static get ConsulType(): string { return 'SwarmCodes.E_NOT_IMPLEMENTED'; }
}

const JOB_IDS = 'J_IDS';
const ASSIGNED_CREEPS = 'CREEPS';
export abstract class CreepConsul extends ConsulBase implements ICreepConsul {
    abstract CreepData: CreepConsul_Data[];
    abstract InitJobRequirements(): void;
    abstract get _Imperator(): ImperatorBase;

    protected JobIDs!: string[];
    Save() {
        this.SetData(JOB_IDS, this.JobIDs);
        this.SetData(ASSIGNED_CREEPS, this.CreepData);
        super.Save();
    }
    Load() {
        if (!super.Load()) { return false; }
        this.JobIDs = this.GetData(JOB_IDS);
        this.CreepData = this.GetData(ASSIGNED_CREEPS);
        return true;
    }
    InitMemory() {
        super.InitMemory();
        this.CreepData = [];
        this.InitJobRequirements();
    }
    ActivateConsul(): void {
        let imperator = this._Imperator;
        for (let i = 0, length = this.CreepData.length; i < length; i++) {
            imperator.ActivateCreep(this.CreepData[i]);
        }
    }
    AssignCreep(creepName: string, jobId: string) {
        let jobExists = false;
        for(let i = 0, length = this.CreepData.length; i < length; i++) {
            if(this.CreepData[i].jobId == jobId) {
                jobExists = true;
                if(this.CreepData[i].creepName && Game.creeps[this.CreepData[i].creepName]) {
                    if(this.CreepData[i].respawnedCreep) { throw 'Attempted to fill a job thats already overfilled'}
                    this.CreepData[i].respawnedCreep = creepName;
                } else {
                    this.CreepData[i].creepName = creepName;
                }

                break;
            }
        }
        if(!jobExists) {
            this.JobIDs.push(jobId);
            this.CreepData.push({ creepName: creepName, jobId: jobId, fetching: false });
        }
        this.UpdateJob(jobId);
    }
    ReleaseCreep(creepName: string) {
        for(let i = 0, length = this.CreepData.length; i < length; i++) {
            if(this.CreepData[i].creepName == creepName) {
                this.CreepData[i].creepName = '';
                if(this.CreepData[i].respawnedCreep) {
                    this.CreepData[i].creepName = this.CreepData[i].respawnedCreep!;
                    delete this.CreepData[i].respawnedCreep;
                }

                this.UpdateJob(this.CreepData[i].jobId);
            }
        }
    }
    UpdateJob(jobId: string): void {
        let request = this.Queen.JobBoard.GetJobRequest(jobId);
        if(!request) { return; } // No job means the job is expired as far as being filled again.
        let creepData;
        for(let i = 0, length = this.CreepData.length; i < length; i++) {
            if(this.CreepData[i].jobId == jobId) {
                creepData = this.CreepData[i];
            }
        }

        if(!creepData) {
            return;
        }

        let creep = Game.creeps[creepData.creepName];
        if(creepData.respawnedCreep && Game.creeps[creepData.creepName]) {
            creep = Game.creeps[creepData.creepName];
        }

        request.targetTime = Game.time + creep.ticksToLive - 50;
        this.Queen.JobBoard.AddOrUpdateJobPosting(request);
    }
}