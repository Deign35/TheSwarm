import { profile } from "./Profiler";

@profile
export class Swarmlord {
    constructor() {
    }

    CheckoutMemory(id: string): IMemory {
        throw 'poop';
    }

    SaveMemory(id: string, data: any, parentMemory: IMemory) {

    }
}