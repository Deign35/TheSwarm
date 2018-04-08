import { ControlConsulMemory } from "SwarmMemory/ConsulMemory";
import { SwarmConsul, ConsulObject } from "Consuls/ConsulBase";

export class ControlConsul extends SwarmConsul<ConsulType.Control> {
    Activate(mem: ControlConsulMemory, obj: ConsulObject<ConsulType.Control>): ControlConsulMemory {
        throw new Error("Method not implemented.");
    }
    InitAsNew(mem: ControlConsulMemory, obj: ConsulObject<ConsulType.Control>): ControlConsulMemory {
        throw new Error("Method not implemented.");
    }
    PrepObject(mem: ControlConsulMemory, obj: ConsulObject<ConsulType.Control>): ControlConsulMemory {
        throw new Error("Method not implemented.");
    }
}