import { BasicProcess } from "Core/BasicTypes";

export abstract class GroupRole extends BasicProcess<GroupRole_Memory> {
    protected executeProcess(): void {
        if (this.IsRoleActive()) {
            return;
        }
    }
    protected IsRoleActive(): boolean {
        return false;
    }
    protected GetAmountRequired(): number {
        return 0;
    }
}