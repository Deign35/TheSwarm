import { OSPackage as CreepActivity } from "Activities/CreepActivity";
import { OSPackage as RepetitiveCreepActivity } from "Activities/RepetitiveCreepActivity";
import { OSPackage as RoomActivity } from "Activities/RoomActivity";
import { OSPackage as SpawnActivity } from "Activities/SpawnActivity";

export const ActivitiesPackage: IPackage<{}> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        CreepActivity.install(processRegistry, extensionRegistry);
        RepetitiveCreepActivity.install(processRegistry, extensionRegistry);
        RoomActivity.install(processRegistry, extensionRegistry);
        SpawnActivity.install(processRegistry, extensionRegistry);
    }
}