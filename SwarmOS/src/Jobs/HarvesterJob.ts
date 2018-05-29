export const OSPackage: IPackage<SpawnRegistry_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(CJ_Harvester, HarvesterJob);
    }
}

import { BasicJob } from "./BasicJob";
import { MoveToPositionAction } from "Actions/MoveToPositionAction";
import { HarvestAction } from "Actions/HarvestAction";
import { FindStructureNextTo, FindNextTo } from "Tools/TheFinder";

class HarvesterJob extends BasicJob<HarvesterJob_Memory> {
    protected GetPrimaryActionType(): ActionType {
        return AT_Harvest;
    }
    protected GetIcon() {
        return '⛏ ⛏ ⛏';
    }
    protected GetTarget(): ObjectTypeWithID | undefined {
        return Game.getObjectById(this.memory.obj) as Source;
    }

    protected SetupAction(): ThreadState {
        this.memory.ac = AT_Harvest;
        this.memory.tar = this.memory.obj;

        if (!this.memory.fm) {
            let source = Game.getObjectById(this.memory.tar) as Source;
            if (!this.memory.cont) {
                let containers = FindStructureNextTo(source.pos, STRUCTURE_CONTAINER);
                if (containers && containers.length > 0) {
                    this.memory.cont = containers[0].structure.id;
                } else {
                    let sites = FindNextTo(source.pos, LOOK_CONSTRUCTION_SITES);
                    if (sites && sites.length > 0) {
                        for (let i = 0; i < sites.length; i++) {
                            let cSite = sites[i].constructionSite as ConstructionSite
                            if (cSite && cSite.structureType == STRUCTURE_CONTAINER) {
                                this.memory.cont = cSite.id;
                                break;
                            }
                        }
                    }
                }
            }
            if (this.creep.pos.isNearTo(source)) {
                this.memory.fm = true;
                delete this.memory.cont;
            }
        }

        return ThreadState_Done;
    }

    EndTick() {
        super.EndTick();
        if (this.memory.cont) {
            let container = Game.getObjectById(this.memory.cont) as StructureContainer | ConstructionSite;
            if (container && !this.creep.pos.isEqualTo(container.pos)) {
                if (container.pos.lookFor(LOOK_CREEPS).length > 0) {
                    delete this.memory.cont;
                    this.memory.fm = true;
                }
                new MoveToPositionAction(this.creep, container.pos).Run();
            } else if (container) {
                this.memory.fm = true;
                delete this.memory.cont;
            } else if (!container) {
                delete this.memory.cont;
            }
        }
    }
}