import * as SwarmCodes from "Consts/SwarmCodes"
import { QueenMemory } from "Tools/SwarmMemory";
import { HarvestImperator } from "Imperators/HarvestImperator";
import { ConstructionImperator } from "Imperators/ConstructionImperator";
import { DistributionImperator } from "Imperators/DistributionImperator";
import { HarvestConsul } from "Consuls/HarvestConsul";
import { ConstructionConsul } from "Consuls/ConstructionConsul";
import { DistributionConsul } from "Consuls/DistributionConsul";

export abstract class NestQueenBase extends QueenMemory implements INestQueen {
    Collector!: HarvestImperator;
    Builder!: ConstructionImperator;
    Distributor!: DistributionImperator;

    Nest!: Room;
    Commands!: any; // Needs to be defined

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

    abstract ReceiveCommand(): void;
    abstract ReleaseControl(creep: Creep): void;
    protected LoadImperators() {
        this.Collector = new HarvestImperator(HarvestConsul.ConsulType, this);
        this.Builder = new ConstructionImperator(ConstructionConsul.ConsulType, this);
        this.Distributor = new DistributionImperator(DistributionConsul.ConsulType, this);
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