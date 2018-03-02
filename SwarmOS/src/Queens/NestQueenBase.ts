import * as SwarmCodes from "Consts/SwarmCodes"
import { QueenMemory } from "Tools/SwarmMemory";
import { CollectionConsul } from "Consuls/CollectionConsul";
import { ConstructionConsul } from "Consuls/ConstructionConsul";
import { DistributionConsul } from "Consuls/DistributionConsul";
import { CreepConsul } from "Consuls/ConsulBase";
import { NestJobs } from "Consuls/NestJobs";
import { ControllerConsul } from "Consuls/ControllerConsul";

const ASSIGNED_CREEPS = 'A_DATA';
const NESTJOBS_DATA = 'N_JOBS';
export abstract class NestQueenBase extends QueenMemory implements INestQueen {
    Nest!: Room;

    Collector!: CollectionConsul;
    Builder!: ConstructionConsul;
    Distributor!: DistributionConsul;
    HiveLord!: ControllerConsul;
    CreepConsulList!: CreepConsul[];
    JobBoard!: NestJobs;

    AssignedCreeps!: string[];
    Save() {
        this.Collector.Save();
        this.Builder.Save();
        this.Distributor.Save();
        this.HiveLord.Save();
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
        return true;
    }

    protected InitMemory() {
        super.InitMemory();
        this.Nest = Game.rooms[this.id];
        this.JobBoard = new NestJobs(NESTJOBS_DATA, this);
        this.JobBoard.Save();
        this.JobBoard.Load();
        this.LoadNestCouncil();
        this.InitializeNest();
    }
    abstract InitializeNest(): void;
    abstract ActivateNest(): void;

    abstract ReleaseControl(creep: string): void;

    protected LoadNestCouncil() {
        this.CreepConsulList = [];
        this.Distributor = new DistributionConsul(DistributionConsul.ConsulType, this);
        this.CreepConsulList.push(this.Distributor);
        this.Collector = new CollectionConsul(CollectionConsul.ConsulType, this);
        this.CreepConsulList.push(this.Collector);
        this.Builder = new ConstructionConsul(ConstructionConsul.ConsulType, this);
        this.CreepConsulList.push(this.Builder);
        this.HiveLord = new ControllerConsul(ControllerConsul.ConsulType, this);
        this.CreepConsulList.push(this.HiveLord);
    }
    protected ValidateCouncil() {
        for (let i = 0, length = this.CreepConsulList.length; i < length; i++) {
            this.CreepConsulList[i].ValidateConsul();
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
        this.HiveLord.ActivateConsul();
    }
    protected abstract CheckForSpawnRequirements(): void;
}