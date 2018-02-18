import { ConsulBase } from "Consuls/ConsulBase";

const CONSUL_TYPE = 'Constructor';
export class ConstructionConsul extends ConsulBase {
    get consulType(): string { return CONSUL_TYPE }
    ScanRoom(): void {

    }
    DetermineRequirements(): void {

    }
    static get ConsulType(): string { return CONSUL_TYPE; }
}