import { OverseerBase } from "./OverseerBase";

const REPAIR_LIST_IDS = 'RL';
export class RepairOverseer extends OverseerBase {
    RepairList!: string[];
    protected _repairData!: { creep: Creep, repairTarget: StructureConstant }[];

    Save() {
        this.SetData(REPAIR_LIST_IDS, this.RepairList);
        super.Save();
    }

    Load() {
        super.Load();
        this.RepairList = this.GetData(REPAIR_LIST_IDS);
        this._repairData = [];
    }

    ValidateOverseer(): void {
        let registry: IOverseer_Registry = OverseerBase.CreateEmptyOverseerRegistry();

        for (let i = 0, length = this.RepairList.length; i < length; i++) {

        }

        this.Registry = registry;
    }

    HasResources(): boolean { return false; }

    AssignCreep(creepName: string): void {
        throw new Error("Method not implemented.");
    }

    ActivateOverseer(): void {
        throw new Error("Method not implemented.");
    }

    ReleaseCreep(name: string, releaseReason: string): void {
        throw new Error("Method not implemented.");
    }

    AssignOrder(orderID: string): boolean {
        throw new Error("Method not implemented.");
    }
}