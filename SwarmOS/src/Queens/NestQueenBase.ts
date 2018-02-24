import * as SwarmCodes from "Consts/SwarmCodes"
import { QueenMemory } from "Tools/SwarmMemory";
import { HarvestConsul } from "Consuls/HarvestConsul";
import { ConstructionConsul } from "Consuls/ConstructionConsul";
import { DistributionConsul } from "Consuls/DistributionConsul";
import { CreepConsul } from "Consuls/ConsulBase";

const ASSIGNED_CREEPS = 'A_DATA';
export abstract class NestQueenBase extends QueenMemory implements INestQueen {
    Nest!: Room;

    Collector!: HarvestConsul;
    Builder!: ConstructionConsul;
    Distributor!: DistributionConsul;
    CreepConsulList!: CreepConsul[];

    AssignedCreeps!: string[];
    Save() {
        this.Collector.Save();
        this.Builder.Save();
        this.Distributor.Save();
        this.SetData(ASSIGNED_CREEPS, this.AssignedCreeps);
        super.Save();
    }
    Load() {
        if (!super.Load()) { return false; }
        this.Nest = Game.rooms[this.id];
        this.AssignedCreeps = this.GetData(ASSIGNED_CREEPS);
        this.LoadNestCouncil();
        if (Game.time % 10 == 0) {
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

    abstract ReleaseControl(creep: Creep): void;

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
    abstract AssignIdleCreeps(idleCreeps: Creep[]): void;
    protected LoadNestCouncil() {
        this.CreepConsulList = [];
        this.Distributor = new DistributionConsul(DistributionConsul.ConsulType, this);
        this.CreepConsulList.push(this.Distributor);
        this.Collector = new HarvestConsul(HarvestConsul.ConsulType, this);
        this.CreepConsulList.push(this.Collector);
        this.Builder = new ConstructionConsul(ConstructionConsul.ConsulType, this);
        this.CreepConsulList.push(this.Builder);
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
    protected abstract CheckForSpawnRequirements(): void; // Return a list of spawnArgs.
}