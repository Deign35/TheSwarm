import * as SwarmCodes from "Consts/SwarmCodes"
import { SwarmMemory } from "Tools/SwarmMemory";
import { CollectionConsul } from "Consuls/CollectionConsul";
import { ConstructionConsul } from "Consuls/ConstructionConsul";
import { DistributionConsul } from "Consuls/DistributionConsul";
import { CreepConsul } from "Consuls/ConsulBase";
import { ControllerConsul } from "Consuls/ControllerConsul";

const ASSIGNED_CREEPS = 'A_DATA';
export abstract class NestQueenBase extends SwarmMemory implements INestQueen {
    Nest!: Room;

    Collector!: CollectionConsul;
    Builder!: ConstructionConsul;
    CreepConsulList!: CreepConsul[];

    AssignedCreeps!: string[];
    Save() {
        this.Collector.Save();
        this.Builder.Save();
        this.SetData(ASSIGNED_CREEPS, this.AssignedCreeps);
        super.Save();
    }
    Load() {
        if (!super.Load()) { return false; }
        this.Nest = Game.rooms[this.id];
        this.AssignedCreeps = this.GetData(ASSIGNED_CREEPS);
        this.LoadNestCouncil();
        this.ValidateCouncil();
        return true;
    }

    protected InitMemory() {
        super.InitMemory();
        this.Nest = Game.rooms[this.id];
        this.LoadNestCouncil();
        this.ValidateCouncil();
        this.InitializeNest();
    }
    abstract get SpawnCapacity(): number;
    abstract InitializeNest(): void;
    abstract ActivateNest(): void;

    abstract ReleaseControl(creep: string): void;

    protected LoadNestCouncil() {
        this.CreepConsulList = [];
        this.Collector = new CollectionConsul(CollectionConsul.ConsulType, this);
        this.CreepConsulList.push(this.Collector);
        this.Builder = new ConstructionConsul(ConstructionConsul.ConsulType, this);
        this.CreepConsulList.push(this.Builder);
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
    }
    protected ActivateSupportConsuls() {
        this.Builder.ActivateConsul();
    }
    protected abstract CheckForSpawnRequirements(): void;
}