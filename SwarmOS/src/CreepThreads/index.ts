import { OSPackage as BuilderThread } from "CreepThreads/BuilderThread";
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
