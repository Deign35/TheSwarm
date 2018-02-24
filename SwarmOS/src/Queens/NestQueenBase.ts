import * as SwarmCodes from "Consts/SwarmCodes"
import { QueenMemory } from "Tools/SwarmMemory";
import { HarvestImperator } from "Imperators/HarvestImperator";
import { ConstructionImperator } from "Imperators/ConstructionImperator";
import { DistributionImperator } from "Imperators/DistributionImperator";
import { HarvestConsul } from "Consuls/HarvestConsul";
import { ConstructionConsul } from "Consuls/ConstructionConsul";
import { DistributionConsul } from "Consuls/DistributionConsul";
import { ImperatorBase } from "Imperators/ImperatorBase";
import { CreepConsul } from "Consuls/ConsulBase";

export abstract class NestQueenBase extends QueenMemory implements INestQueen {
    Nest!: Room;

    Collector!: HarvestConsul;
    Builder!: ConstructionConsul;
    Distributor!: DistributionConsul;

    CreepConsulList!: CreepConsul[];
    Save() {
        this.Collector.Save();
        this.Builder.Save();
        this.Distributor.Save();
        super.Save();
    }
    Load() {
        if (!super.Load()) { return false; }
        this.Nest = Game.rooms[this.id];
        this.LoadNestCounsel();
        if (Game.time % 10 == 0) {
            let idleCreeps = this.FindIdleCreeps();
            this.AssignIdleCreeps(idleCreeps);
        }
        return true;
    }

    protected InitMemory() {
        super.InitMemory();
        this.Nest = Game.rooms[this.id];
        this.LoadNestCounsel();
        this.InitializeNest();
    }
    abstract InitializeNest(): void;
    abstract ActivateNest(): void;

    abstract ReleaseControl(creep: Creep): void;
    FindIdleCreeps(): Creep[] {
        let idleCreeps: Creep[] = [];
        for (let creepName in Game.creeps) {
            let creepFound = false;

            for (let i = 0, length = this.CreepConsulList.length; i < length; i++) {
                for (let j = 0, length2 = this.CreepConsulList[i].CreepData.length; j < length2; j++) {
                    if (this.CreepConsulList[i].CreepData[j].creepName == creepName) {
                        creepFound = true;
                        break;
                    }
                }
                if (creepFound) { continue; }
                idleCreeps.push(Game.creeps[creepName]);
            }
        }
        return idleCreeps;
    }
    abstract AssignIdleCreeps(idleCreeps: Creep[]): void;
    protected LoadNestCounsel() {
        this.CreepConsulList = [];
        this.Collector = new HarvestConsul(HarvestConsul.ConsulType, this);
        this.CreepConsulList.push(this.Collector);
        this.Builder = new ConstructionConsul(ConstructionConsul.ConsulType, this);
        this.CreepConsulList.push(this.Builder);
        this.Distributor = new DistributionConsul(DistributionConsul.ConsulType, this);
        this.CreepConsulList.push(this.Distributor);
    }
    protected ActivateImperators(): SwarmCodes.SwarmErrors {
        this.Collector.ActivateConsul();
        if (Game.cpu.bucket > 500 || Game.shard.name == 'sim') {
            this.Builder.ActivateConsul();
        }
        this.Distributor.ActivateConsul();
        return SwarmCodes.C_NONE;
    }
    protected abstract CheckForSpawnRequirements(): void; // Return a list of spawnArgs.
}