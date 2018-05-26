export const OSPackage: IPackage<SpawnRegistry_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(CJ_Build, BuildJob);
        processRegistry.register(CJ_Refiller, RefillerJob);
        processRegistry.register(CJ_Upgrade, UpgradeJob);
        processRegistry.register(CJ_Repair, RepairJob);
    }
}

import { BasicJob } from "./BasicJob";

class RepairJob extends BasicJob<BasicJob_Memory> {
    protected GetPrimaryActionType(): ActionType {
        return AT_Repair;
    }
}

class BuildJob extends BasicJob<BasicJob_Memory> {
    protected GetPrimaryActionType(): ActionType {
        return AT_Build;
    }
}

class RefillerJob extends BasicJob<BasicJob_Memory> {
    protected GetPrimaryActionType(): ActionType {
        return AT_Transfer;
    }
}

class UpgradeJob extends BasicJob<BasicJob_Memory> {
    protected GetPrimaryActionType(): ActionType {
        return AT_Upgrade;
    }
}