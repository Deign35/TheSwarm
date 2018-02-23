import * as SwarmCodes from "Consts/SwarmCodes"
import { QueenMemory } from "Tools/SwarmMemory";
import { HarvestImperator } from "Imperators/HarvestImperator";
import { ConstructionImperator } from "Imperators/ConstructionImperator";
import { DistributionImperator } from "Imperators/DistributionImperator";
import { HarvestConsul } from "Consuls/HarvestConsul";
import { ConstructionConsul } from "Consuls/ConstructionConsul";
import { DistributionConsul } from "Consuls/DistributionConsul";

export abstract class NestQueenBase extends QueenMemory implements INestQueen {
    Nest!: Room;

    Collector!: HarvestImperator;
    Builder!: ConstructionImperator;
    Distributor!: DistributionImperator;

    ImperatorList!: IImperator[];
    Save() {
        this.Collector.ImperatorComplete();
        this.Builder.ImperatorComplete();
        this.Distributor.ImperatorComplete();
        super.Save();
    }
    Load() {
        if (!super.Load()) { return false; }
        this.Nest = Game.rooms[this.id];
        this.LoadImperators();
        if(Game.time % 10 == 0) {
            let idleCreeps = this.FindIdleCreeps();
            this.AssignIdleCreeps(idleCreeps);
        }
        return true;
    }

    protected InitMemory() {
        super.InitMemory();
        this.Nest = Game.rooms[this.id];
        this.LoadImperators();
        this.InitializeNest();
    }
    abstract InitializeNest(): void;
    abstract ActivateNest(): void;

    abstract ReleaseControl(creep: Creep): void;
    FindIdleCreeps(): Creep[] {
        let idleCreeps: Creep[] = [];
        for (let creepName in Game.creeps) {
            let creepFound = false;
            for (let i = 0, length = this.Collector.Consul.CreepData.length; i < length; i++) {
                if (this.Collector.Consul.CreepData[i].creepName == creepName) {
                    creepFound = true;
                    break;
                }
            }
            if (creepFound) { continue; }
            for (let i = 0, length = this.Builder.Consul.CreepData.length; i < length; i++) {
                if (this.Builder.Consul.CreepData[i].creepName == creepName) {
                    creepFound = true;
                    break;
                }
            }
            if (creepFound) { continue; }
            if (this.Distributor.Consul.SpawnRefillerData.creepName == creepName) {
                continue;
            }
            idleCreeps.push(Game.creeps[creepName]);
        }
        return idleCreeps;
    }
    abstract AssignIdleCreeps(idleCreeps: Creep[]): void;
    protected LoadImperators() {
        this.ImperatorList = []
        this.Collector = new HarvestImperator(HarvestConsul.ConsulType, this);
        this.ImperatorList.push(this.Collector);
        this.Builder = new ConstructionImperator(ConstructionConsul.ConsulType, this);
        this.ImperatorList.push(this.Builder);
        this.Distributor = new DistributionImperator(DistributionConsul.ConsulType, this);
        this.ImperatorList.push(this.Distributor);
    }
    protected ActivateImperators(): SwarmCodes.SwarmErrors {
        this.Collector.ActivateImperator();
        if (Game.cpu.bucket > 500 || Game.shard.name == 'sim') {
            this.Builder.ActivateImperator();
        }
        this.Distributor.ActivateImperator();
        return SwarmCodes.C_NONE;
    }
}