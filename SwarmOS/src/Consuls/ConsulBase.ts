import * as SwarmCodes from "consts/SwarmCodes"
import { ChildMemory } from "Tools/SwarmMemory";
import { NestQueenBase } from "Queens/NestQueenBase";
import { ImperatorBase } from "Imperators/ImperatorBase";
import { SpawnPriority, SpawnRequest_TerminationType } from "Consts/SwarmConsts";

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
    abstract ValidateConsul(): void;
    abstract ActivateConsul(): void;
    abstract get consulType(): string;
    static get ConsulType(): string { return 'SwarmCodes.E_NOT_IMPLEMENTED'; }
}

const JOB_IDS = 'J_IDS';
const ASSIGNED_CREEPS = 'CREEPS';
export abstract class CreepConsul extends ConsulBase implements ICreepConsul {
    protected abstract CreepData: CreepConsul_Data[];
    abstract get _Imperator(): ImperatorBase;

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
        this.JobIDs = [];
    }

    ActivateCreep(imperator: ImperatorBase, creepData: CreepConsul_Data): SwarmCodes.SwarmlingResponse {
        // Override to do something based on the results of the imperator actions.
        return imperator.ActivateCreep(creepData);
    }
    protected get RequiresCreepsAreActive() { return true; }
    ActivateConsul(): void {
        let imperator = this._Imperator;
        for (let i = 0, length = this.CreepData.length; i < length; i++) {
            if (!this.RequiresCreepsAreActive || this.CreepData[i].active) {
                this.ActivateCreep(imperator, this.CreepData[i]);
            }
        }
    }
    AssignCreep(creepName: string, jobId: string) {
        let jobExists = false;
        for (let i = 0, length = this.CreepData.length; i < length; i++) {
            if (this.CreepData[i].jobId == jobId) {
                jobExists = true;
                if (this.CreepData[i].creepName && Game.creeps[this.CreepData[i].creepName]) {
                    if (this.CreepData[i].respawnedCreep) { throw 'Attempted to fill a job thats already overfilled' }
                    this.CreepData[i].respawnedCreep = creepName;
                } else {
                    this.CreepData[i].creepName = creepName;
                }

                break;
            }
        }
        if (!jobExists) {
            this.JobIDs.push(jobId);
            this.CreepData.push({ creepName: creepName, jobId: jobId, active: true });
        }
    }

    protected _ReleaseCreep(index: number) {
        this.CreepData[index].creepName = '';
        if (this.CreepData[index].respawnedCreep) {
            this.CreepData[index].creepName = this.CreepData[index].respawnedCreep!;
            delete this.CreepData[index].respawnedCreep;
        }
    }

    ReleaseCreep(creepName: string) {
        for (let i = 0, length = this.CreepData.length; i < length; i++) {
            if (this.CreepData[i].creepName == creepName) {
                this._ReleaseCreep(i);
            }
        }
    }

    ValidateConsul() {
        for (let i = 0; i < this.CreepData.length; i++) {
            let creep = Game.creeps[this.CreepData[i].creepName];
            if (!creep) {
                this._ReleaseCreep(i);
                continue;
            }

            this.ValidateCreep(this.CreepData[i], creep);
        }
    }

    protected ValidateConsulState() { }
    protected ValidateCreep(creepData: CreepConsul_Data, creep: Creep): boolean {
        /*if(creepData.active) {
            if (creep.carry[RESOURCE_ENERGY] == creep.carryCapacity) {
                creepData.active = false;
            }
        } else if (creep.carry[RESOURCE_ENERGY] == 0) {
            creepData.active = true;
        }*/

        return true;
    }

    protected JobIDs!: string[];
    abstract GetBodyTemplate(): BodyPartConstant[];
    abstract GetCreepSuffix(): string;
    GetSupplementalData(): any { return undefined; };
    abstract GetSpawnPriority(): SpawnPriority;
    abstract GetNextSpawnTime(): number;

    CreateDefaultJobTemplate(newJobId: string): CreepRequestData {
        return {
            body: this.GetBodyTemplate(),
            creepSuffix: this.GetCreepSuffix(),
            requestor: this.consulType,
            requestID: newJobId,
            supplementalData: this.GetSupplementalData(),
            priority: this.GetSpawnPriority(),
        }
    }
}