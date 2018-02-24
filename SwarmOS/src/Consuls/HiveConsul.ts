import { ConsulBase } from "./ConsulBase";
import { HiveQueenBase } from "Queens/HiveQueenBase";

const CONSUL_TYPE = 'HiveConsul';
export class HiveConsul extends ConsulBase {
    static get ConsulType(): string { return CONSUL_TYPE; }
    get consulType(): string { return CONSUL_TYPE }
    get Queen(): HiveQueenBase { return this.Parent as HiveQueenBase; }

    constructor(id: string, parent: HiveQueenBase) {
        super(id, parent);
    }
    ValidateConsulState(): void {
        throw new Error("Method not implemented.");
    }
    ActivateConsul(): void {
        throw new Error("Method not implemented.");
    }
}