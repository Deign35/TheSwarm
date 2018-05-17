import { BasicProcess } from "./BasicTypes";

export abstract class ScheduledProcess<T extends ScheduledProcessMemBase> extends BasicProcess<T> {
    protected executeProcess(): void {
        throw new Error("Method not implemented.");
    }
}