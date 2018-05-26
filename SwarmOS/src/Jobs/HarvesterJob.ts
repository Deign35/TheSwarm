export const OSPackage: IPackage<SpawnRegistry_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(CJ_Harvester, HarvesterJob);
    }
}

import { BasicJob } from "./BasicJob";
import { MoveToPositionAction } from "Actions/MoveToPositionAction";
import { HarvestAction } from "Actions/HarvestAction";

class HarvesterJob extends BasicJob<HarvesterJob_Memory> {
    protected GetPrimaryActionType(): ActionType {
        return AT_Harvest;
    }

    protected SetupAction(): ThreadState {
        this.memory.ac = AT_Harvest;
        this.memory.tar = this.memory.obj;
        return ThreadState_Done;
    }
}