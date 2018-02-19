import { CreepConsul } from "Consuls/ConsulBase";

const CONSUL_TYPE = 'Constructor';
export class ConstructionConsul extends CreepConsul {
    ReleaseCreep(creepName: string): void {
        throw new Error("Method not implemented.");
    }
    GetSpawnDefinition(): SpawnConsul_SpawnArgs {
        throw new Error("Method not implemented.");
    }
    get consulType(): string { return CONSUL_TYPE }
    ScanRoom(): void {

    }
    RequiresSpawn(): boolean {
        return false;
    }
    static get ConsulType(): string { return CONSUL_TYPE; }
}