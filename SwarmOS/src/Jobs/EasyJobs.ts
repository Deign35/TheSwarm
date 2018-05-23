export const OSPackage: IPackage<SpawnRegistry_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(CJ_Build, BuildJob);
        processRegistry.register(CJ_Refiller, RefillerJob);
        processRegistry.register(CJ_Upgrade, UpgradeJob);
    }
}

import { BasicJob } from "./BasicJob";

class BuildJob extends BasicJob<CreepJob_Memory> {
    protected GetActionType(): ActionType {
        return AT_Build;
    }
    protected CheckIsTargetStillValid(): boolean {
        return !!Game.getObjectById(this.memory.t);
    }
}

class RefillerJob extends BasicJob<CreepJob_Memory> {
    protected GetActionType(): ActionType {
        return AT_Transfer;
    }

    protected CheckIsTargetStillValid() {
        // (TODO): Check to make sure the controller is mine
        return !!Game.getObjectById(this.memory.t);
    }
}
class UpgradeJob extends BasicJob<CreepJob_Memory> {
    protected GetActionType(): ActionType {
        return AT_Upgrade;
    }

    protected CheckIsTargetStillValid() {
        // (TODO): Check to make sure the controller is mine
        return !!Game.getObjectById(this.memory.t);
    }
}