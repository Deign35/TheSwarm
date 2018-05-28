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

    protected GetTarget(): ObjectTypeWithID | undefined {
        let struct = Game.getObjectById(this.memory.tar) as StructureExtension | StructureSpawn;
        if (struct && !this.memory.ret && struct.structureType) {
            return struct.hits < struct.hitsMax ? struct : undefined;
        }
        return struct;
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

    protected GetTarget(): ObjectTypeWithID | undefined {
        let struct = Game.getObjectById(this.memory.tar) as StructureExtension | StructureSpawn;
        if (struct && !this.memory.ret && struct.structureType && struct.energy) {
            return struct.energy < struct.energyCapacity ? struct : undefined;
        }
        return struct;
    }
}

class UpgradeJob extends BasicJob<BasicJob_Memory> {
    protected GetPrimaryActionType(): ActionType {
        return AT_Upgrade;
    }
}