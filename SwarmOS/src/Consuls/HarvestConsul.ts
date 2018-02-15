import { ConsulBase } from "./ConsulBase";

const CONSUL_TYPE = 'H_Consul';
export class HarvestConsul extends ConsulBase implements IConsul {
    readonly consulType = CONSUL_TYPE;
    Save() {

        super.Save();
    }
    Load() {
        if(!super.Load()) { return false; }

        return true;
    }
    InitMemory() {
        super.InitMemory();

    }

    ScanRoom(roomName: string): void {
        // Looks inside the room and records source information to be used
        // when
        throw new Error("Method not implemented.");
    }
    DetermineRequirements(): void {
        // Calculates the distance to new sources
        // Orders creation of new screep so that they will arrive at the harvest node
        // just a few ticks before the previous one dies.
        throw new Error("Method not implemented.");
    }
    static get ConsulType(): string { return CONSUL_TYPE; }
}