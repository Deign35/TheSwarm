import * as SwarmConsts from "Consts/SwarmConsts";
import { ImperatorBase } from "Imperators/ImperatorBase";
import { CreepConsul } from "Consuls/ConsulBase";
import { HarvestImperator } from "Imperators/HarvestImperator";

const SOURCE_DATA = 'S_DATA';
const CONSUL_TYPE = 'Collector';
export class CollectionConsul extends CreepConsul {
    static get ConsulType(): string { return CONSUL_TYPE; }
    get consulType(): string { return CONSUL_TYPE }
    get _Imperator() { return new HarvestImperator() }

    protected CreepData!: CollectorData[];
    protected SourceData!: SourceData[];
    Save() {
        this.SetData(SOURCE_DATA, this.SourceData);
        super.Save();
    }

    Load() {
        if (!super.Load()) { return false; }
        this.SourceData = this.GetData(SOURCE_DATA);
        return true;
    }

    InitMemory() {
        super.InitMemory();

        let sources = this.Queen.Nest.find(FIND_SOURCES);
        for (let i = 0, length = sources.length; i < length; i++) {
            let newSource: SourceData = {
                sourceId: sources[i].id,
            }

            let pos = sources[i].pos;
            let foundStructures = this.Queen.Nest.lookForAtArea(LOOK_STRUCTURES, pos.y - 1, pos.x - 1, pos.y + 1, pos.x + 1)
        }
    }

    GetBodyTemplate(): BodyPartConstant[] {
        throw new Error("Method not implemented.");
    }
    GetCreepSuffix(): string {
        throw new Error("Method not implemented.");
    }
    GetDefaultSpawnPriority(): SwarmConsts.SpawnPriority {
        throw new Error("Method not implemented.");
    }
    GetDefaultTerminationType(): SwarmConsts.SpawnRequest_TerminationType {
        throw new Error("Method not implemented.");
    }
    GetDefaultJobCount(): number {
        throw new Error("Method not implemented.");
    }
}

declare type SourceData = {
    sourceId: string,
    container?: string, // Use this for the construction site too
    //room distance map for choosing predefined paths.
}