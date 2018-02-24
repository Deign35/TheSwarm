import { ConsulBase } from "./ConsulBase";

const CONSUL_TYPE = 'Spawn_Consul';
const REQUEST_DATA = 'R_DATA';
export class Respawner extends ConsulBase {
    static get ConsulType(): string { return CONSUL_TYPE; }
    readonly consulType = Respawner.ConsulType;

    protected RequestData!: CreepRequestData[];
    Save() {
        this.SetData(REQUEST_DATA, this.RequestData);
        super.Save();
    }
    Load() {
        if (!super.Load()) { return false; }

        this.RequestData = this.GetData(REQUEST_DATA);
        return true;
    }
    ValidateConsulState(): void {
        throw new Error("Method not implemented.");
    }
    ActivateConsul(): void {
        throw new Error("Method not implemented.");
    }

    SetSpawnSchedule(requestData: CreepRequestData) {

    }
}