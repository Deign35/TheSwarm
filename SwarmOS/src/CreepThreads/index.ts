/*import { OSPackage as BuilderThread } from "CreepThreads/BuilderThread";
import { OSPackage as HarvesterThread } from "CreepThreads/HarvesterThread";
import { OSPackage as RefillerThread } from "CreepThreads/RefillerThread";
import { OSPackage as UpgraderThread } from "CreepThreads/UpgraderThread";

export const CreepThreadsPackage: IPackage<{}> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        BuilderThread.install(processRegistry, extensionRegistry);
        HarvesterThread.install(processRegistry, extensionRegistry);
        RefillerThread.install(processRegistry, extensionRegistry);
        UpgraderThread.install(processRegistry, extensionRegistry);
    },
}
*/

import { OSPackage as EasyThreads } from "CreepThreads/EasyThreads"
import { OSPackage as RefillerThreads } from "CreepThreads/RefillThread2";

export const CreepThreadsPackage: IPackage<{}> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        EasyThreads.install(processRegistry, extensionRegistry);
        RefillerThreads.install(processRegistry, extensionRegistry);
    }
}