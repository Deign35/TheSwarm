import * as SwarmCodes from "Consts/SwarmCodes"
import { QueenMemory } from "Tools/SwarmMemory";
import { HarvestConsul } from "Consuls/HarvestConsul";
import { ConstructionConsul } from "Consuls/ConstructionConsul";
import { DistributionConsul } from "Consuls/DistributionConsul";
import { CreepConsul } from "Consuls/ConsulBase";
import { NestJobs } from "Consuls/NestJobs";
import { ControllerConsul } from "Consuls/ControllerConsul";

const ASSIGNED_CREEPS = 'A_DATA';
const NESTJOBS_DATA = 'N_JOBS';
export abstract class NestQueenBase extends QueenMemory implements INestQueen {
    Nest!: Room;

    Collector!: HarvestConsul;
    Builder!: ConstructionConsul;
    Distributor!: DistributionConsul;
    Upgrader!: ControllerConsul;
    CreepConsulList!: CreepConsul[];
    JobBoard!: NestJobs;

    AssignedCreeps!: string[];
    Save() {
        this.Collector.Save();
        this.Builder.Save();
        this.Distributor.Save();
        this.Upgrader.Save();
        this.SetData(ASSIGNED_CREEPS, this.AssignedCreeps);
        this.JobBoard.Save();
        super.Save();
    }
    Load() {
        if (!super.Load()) { return false; }
        this.Nest = Game.rooms[this.id];
        this.AssignedCreeps = this.GetData(ASSIGNED_CREEPS);
        this.JobBoard = new NestJobs(NESTJOBS_DATA, this);
        this.LoadNestCouncil();
        if (Game.time % 10 == 3) {
            let idleCreeps = this.FindIdleCreeps();
            this.AssignIdleCreeps(idleCreeps);
        }
        return true;
    }

    protected InitMemory() {
        super.InitMemory();
        this.Nest = Game.rooms[this.id];
        this.LoadNestCouncil();
        this.InitializeNest();
    }
    abstract InitializeNest(): void;
    abstract ActivateNest(): void;

    abstract ReleaseControl(creep: string): void;

    FindIdleCreeps(): Creep[] {
        let idleCreeps: Creep[] = [];
        //for (let creepName in Game.creeps) {
        for (let a = 0, length3 = this.AssignedCreeps.length; a < length3; a++) {
            let creepName = this.AssignedCreeps[a];
            let creepFound = false;

            for (let i = 0, length = this.CreepConsulList.length; i < length; i++) {
                for (let j = 0, length2 = this.CreepConsulList[i].CreepData.length; j < length2; j++) {
                    if (this.CreepConsulList[i].CreepData[j].creepName == creepName) {
                        creepFound = true;
                    }
                    if (creepFound) { break; }
                }
                if (creepFound) { break; }
            }
            if (creepFound) { continue; }
            idleCreeps.push(Game.creeps[creepName]);
        }
        return idleCreeps;
    }
    AssignIdleCreeps(idleCreeps: Creep[]) {
        for (let i = 0, length = idleCreeps.length; i < length; i++) {
            if (idleCreeps[i].getActiveBodyparts(WORK) == 0) {
                this.Distributor.AssignCreep(idleCreeps[i]);
                continue;
            }

            if (idleCreeps[i].getActiveBodyparts(WORK) > 1) {
                this.Collector.AssignCreep(idleCreeps[i]);
                continue;
            }

            if (this.Nest.find(FIND_MY_CONSTRUCTION_SITES)) {
                this.Builder.AssignCreep(idleCreeps[i]);
                continue;
            }

            this.Upgrader.AssignCreep(idleCreeps[i]);
        }
    }
    protected LoadNestCouncil() {
        this.CreepConsulList = [];
        this.Distributor = new DistributionConsul(DistributionConsul.ConsulType, this);
        this.CreepConsulList.push(this.Distributor);
        this.Collector = new HarvestConsul(HarvestConsul.ConsulType, this);
        this.CreepConsulList.push(this.Collector);
        this.Builder = new ConstructionConsul(ConstructionConsul.ConsulType, this);
        this.CreepConsulList.push(this.Builder);
        this.Upgrader = new ControllerConsul(ControllerConsul.ConsulType, this);
        this.CreepConsulList.push(this.Upgrader);
    }
    protected ValidateCouncil() {
        for (let i = 0, length = this.CreepConsulList.length; i < length; i++) {
            this.CreepConsulList[i].ValidateConsulState();
        }
    }

    protected ActivateCouncil(): SwarmCodes.SwarmErrors {
        this.ActivateRequiredConsuls();
        if (Game.cpu.bucket > 500 || Game.shard.name == 'sim') {
            this.ActivateSupportConsuls();
        }
        return SwarmCodes.C_NONE;
    }
    protected ActivateRequiredConsuls() {
        this.Collector.ActivateConsul();
        this.Distributor.ActivateConsul();
    }
    protected ActivateSupportConsuls() {
        this.Builder.ActivateConsul();
    }
    protected abstract CheckForSpawnRequirements(): void;
}