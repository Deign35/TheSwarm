import { ConsulBase } from "./ConsulBase";
import { OverseerBase } from "Overseers/OverseerBase";

const CONSUL_TYPE = 'H_Consul';
const SOURCE_DATA = 'S_DATA';
export class HarvestConsul extends ConsulBase implements IConsul {
    readonly consulType = CONSUL_TYPE;
    SourceData!: any;
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
        this.ScanRoom();
    }

    ScanRoom(): void {
        this.SourceData = [];
        let foundSources = this.Parent.Hive.find(FIND_SOURCES);
        for (let i = 0, length = foundSources.length; i < length; i++) {
            let sourceData = { x: foundSources[i].pos.x, y: foundSources[i].pos.y }
            this.SourceData.push(sourceData);
        }
    }
    DetermineRequirements(): void {
        // Calculates the distance to new sources
        // Orders creation of new screep so that they will arrive at the harvest node
        // just a few ticks before the previous one dies.
        throw new Error("Method not implemented.");
    }
    static get ConsulType(): string { return CONSUL_TYPE; }
}