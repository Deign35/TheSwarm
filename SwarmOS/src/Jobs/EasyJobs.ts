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
        let target = Game.getObjectById(this.memory.tar) as Structure | Creep;
        if (target && !this.memory.ret) {
            if ((target as Structure).structureType && (target as StructureExtension).energyCapacity) {
                return (target as StructureExtension).energy < (target as StructureExtension).energyCapacity ? target : undefined;
            }
            if ((target as Creep).carryCapacity) {
                return ((target as Creep).carry.energy + 25 < (target as Creep).carryCapacity) ? target : undefined;
            }
        }

        return target;
    }
}

class UpgradeJob extends BasicJob<BasicJob_Memory> {
    protected GetPrimaryActionType(): ActionType {
        return AT_Upgrade;
    }
}