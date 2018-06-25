import { OSPackage as CreepActivity } from "Activities/CreepActivity";
import { OSPackage as RepetitiveCreepActivity } from "Activities/RepetitiveCreepActivity";
import { OSPackage as SpawnActivity } from "Activities/SpawnActivity";
import { OSPackage as EnergyTransferActivity } from "Activities/EnergyTransferActivity";

export const ActivitiesPackage: IPackage<{}> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        CreepActivity.install(processRegistry, extensionRegistry);
        RepetitiveCreepActivity.install(processRegistry, extensionRegistry);
        EnergyTransferActivity.install(processRegistry, extensionRegistry);
        SpawnActivity.install(processRegistry, extensionRegistry);
    }
}