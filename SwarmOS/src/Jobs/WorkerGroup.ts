export const OSPackage: IPackage<SpawnRegistry_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(CG_Worker, WorkerGroup);
    }
}
import { BasicProcess } from "Core/BasicTypes";

class WorkerGroup extends BasicProcess<WorkerJob_Memory> {
    @extensionInterface(EXT_CreepRegistry)
    creepRegistry!: ICreepRegistryExtensions;
    @extensionInterface(EXT_RoomView)
    View!: IRoomDataExtension;
    @extensionInterface(EXT_CreepActivity)
    creepActivity!: ICreepActivityExtensions;

    RunThread(): ThreadState {
        let room = Game.rooms[this.memory.r];

        // Scale the number of creeps needed based on energy allocation and available energy.

        return ThreadState_Done;
    }

    ActivityComplete(creepID: string) {
        let creep = this.creepRegistry.tryGetCreep(creepID);
        if (creep) {
            // Create a new activity for the creep to either use the energy it has or to get more energy
        } else {
            delete this.memory.c;
        }
    }
}