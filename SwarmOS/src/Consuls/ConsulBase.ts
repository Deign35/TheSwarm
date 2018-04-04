import { BasicMemory } from "SwarmMemory/SwarmMemory";
import { SwarmLoader } from "SwarmTypes/SwarmLoader";

export class ConsulBase {
    consulMemory!: BasicMemory;
    constructor(id: string) {
        this.consulMemory = SwarmLoader.TheSwarm.otherData[id];
    }
    Activate() {

    }
}