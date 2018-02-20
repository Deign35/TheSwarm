import * as SwarmCodes from "Consts/SwarmCodes";
import { ImperatorBase } from "Imperators/ImperatorBase";
import { HarvestConsul } from "Consuls/HarvestConsul";
import { HarvestAction } from "Actions/HarvestAction";
import { MoveToPositionAction } from "Actions/MoveToPositionAction";
import { RepairAction } from "Actions/RepairAction";
import { BuildAction } from "Actions/BuildAction";
import { ActionBase } from "Actions/ActionBase";
import * as _ from "lodash";

export class HarvestImperator extends ImperatorBase {
    Consul!: HarvestConsul;

    InitImperator(memoryHandle: string): void {
        this.Consul = new HarvestConsul(memoryHandle, this.Queen);
    }
    ImperatorComplete(): void {
        this.Consul.Save();
    }

    ActivateImperator(): SwarmCodes.SwarmErrors {
        // Request hive harvesters from the nestqueen.
        let sourceData = this.Consul.SourceData;
        for (let i = 0, length = sourceData.length; i < length; i++) {
            let data = sourceData[i];
            if (data.harvester && Game.creeps[data.harvester]) {
                this.ActivateHarvester(data, Game.creeps[data.harvester]);
            }
        }

        let tempWorkers = this.Consul.TempWorkers;
        let rotateBackward = Game.time % 2 == 0;
        let curIndex = Game.time % this.Consul.SourceData.length;
        for (let i = 0, length = tempWorkers.length; i < length; i++) {
            let targetId = this.Consul._tempData[tempWorkers[i].name];
            let target: RoomObject | undefined = Game.getObjectById(targetId) || undefined;
            let cycleProtection = 0;
            do {
                if (++cycleProtection > this.Consul.SourceData.length) {
                    continue;
                }
                if (!target) {
                    // find a target by cycling through
                    let data = this.Consul.SourceData[curIndex];
                    curIndex = rotateBackward ? curIndex - 1 : curIndex + 1;
                    if (curIndex < 0) {
                        curIndex = this.Consul.SourceData.length - 1;
                    }
                    if (curIndex >= this.Consul.SourceData.length) {
                        curIndex = 0;
                    }

                    if (data.containerID) {
                        target = Game.getObjectById(data.containerID) as StructureContainer;
                        if ((target as StructureContainer).store[RESOURCE_ENERGY] == 0) {
                            target = undefined;
                        }
                    }
                    if (!target && tempWorkers[i].getActiveBodyparts(WORK) > 0) {
                        target = Game.getObjectById(data.id) as Source;
                    }
                    if (!target && data.harvester) {
                        target = Game.creeps[data.harvester];
                    }
                }
                if (target) {
                    if ((target as Source).energyCapacity) {
                    } else if ((target as StructureContainer).storeCapacity) {
                    } else if ((target as Creep).carryCapacity) {
                    } else {
                        target = undefined;
                    }
                }
            } while (!target);
            this.ActivateTempWorker(tempWorkers[i], target as Source | StructureContainer | Creep);
        }
        return SwarmCodes.C_NONE; // unused
    }

    // Activate temp worker as a different function
    // temp worker can try to withdraw from the container first.
    protected ActivateHarvester(data: HarvestConsul_SourceData, harvester: Creep) {
        this.Queen.Nest.visual.text('Harv', harvester.pos);
        if (harvester.spawning) { return; }
        let sourceTarget = Game.getObjectById(data.id) as Source;
        let harvestAction: ActionBase = new HarvestAction(harvester, sourceTarget);
        // Do a container check, where if it exists, do an express version that doesn't go through this logic.
        let harvestResult = harvestAction.ValidateAction();
        switch (harvestResult) {
            case (SwarmCodes.C_NONE):
                if (!data.constructionSite && !data.containerID) {
                    let foundCS = harvester.pos.lookFor(LOOK_CONSTRUCTION_SITES);
                    if (foundCS && foundCS.length > 0) {
                        if ((foundCS[0] as ConstructionSite).structureType == STRUCTURE_CONTAINER) {
                            data.constructionSite = (foundCS[0] as ConstructionSite).id;
                        }
                    } else {
                        let foundS = harvester.pos.lookFor(LOOK_STRUCTURES);
                        if (foundS && foundS.length > 0 && (foundS[0] as Structure).structureType == STRUCTURE_CONTAINER) {
                            data.containerID = (foundS[0] as StructureContainer).id;
                        } else {
                            harvester.room.createConstructionSite(harvester.pos, STRUCTURE_CONTAINER);
                        }
                    }
                }
                break;
            case (SwarmCodes.E_ACTION_UNNECESSARY):
                if (data.harvester == harvester.name) {
                    if (data.constructionSite) {
                        harvestAction = new BuildAction(harvester, Game.getObjectById(data.constructionSite) as ConstructionSite);
                    } else if (data.containerID) {
                        let container = Game.getObjectById(data.containerID) as StructureContainer;
                        if (container.hits < container.hitsMax) {
                            harvestAction = new RepairAction(harvester, container);
                        }
                    }
                }
                break; // Creep's carry is full
            case (SwarmCodes.E_TARGET_INELLIGIBLE): break; // Target is empty.
            case (SwarmCodes.C_MOVE):
                let targetPos = sourceTarget.pos;

                if (data.harvester == harvester.name && (data.constructionSite || data.containerID)) {
                    let targetStruct = (Game.getObjectById(data.constructionSite) ||
                        Game.getObjectById(data.containerID)) as ConstructionSite | StructureContainer;
                    if (targetStruct) {
                        targetPos = targetStruct.pos;
                    }
                }
                new MoveToPositionAction(harvester, targetPos).Run(true);
                break;
        }

        if (harvestResult != SwarmCodes.C_MOVE) {
            harvestResult = harvestAction.Run();
            // Dont care about the result
        }
    }

    ActivateTempWorker(creep: Creep, target: Source | StructureContainer | Creep) {
        if ((target as Source).energyCapacity) {
            // Have to mine
        } else if ((target as StructureContainer).storeCapacity) {
            // go go withdraw!
        } else if ((target as Creep).carryCapacity) {
            //Need to request a transfer when we get there.
        }
    }
}