import { ControlMemory } from "SwarmMemory/ConsulMemory";
import { SwarmConsul, ConsulObject } from "Consuls/ConsulBase";

export class ControlConsul extends SwarmConsul<ConsulType.Control> {
    Activate(mem: ControlMemory, obj: ConsulObject<ConsulType.Control>): ControlMemory {
        throw new Error("Method not implemented.");
    }
    InitAsNew(obj: ConsulObject<ConsulType.Control>): ControlMemory {
        throw new Error("Method not implemented.");
    }
    PrepObject(mem: ControlMemory, obj: ConsulObject<ConsulType.Control>): ControlMemory {
        throw new Error("Method not implemented.");
    }
}