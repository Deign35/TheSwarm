import { profile } from "Tools/Profiler";

declare var Memory: MemoryStructure;
var deserializedMemory = JSON.parse(JSON.stringify(Memory)) as MemoryStructure;

@profile
export class Swarmlord {
    constructor() {
    }

    InitializeMemory() {
        if (!deserializedMemory.INIT) {

        }
    }

    CheckoutMemory(id: string): ISwarmMemory {
        throw 'poop';
    }

    SaveMemory(id: string, data: any, parentMemory: ISwarmMemory) {

    }
}