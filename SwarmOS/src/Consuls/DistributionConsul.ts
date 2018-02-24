import { CreepConsul } from "Consuls/ConsulBase";
import { DistributionImperator } from "Imperators/DistributionImperator";

const CONSUL_TYPE = 'Distribution';
const REFILLER_DATA = 'R_DATA';
const DISTRIBUTION_REQUESTS = 'D_REQ';
export class DistributionConsul extends CreepConsul {
    static get ConsulType(): string { return CONSUL_TYPE; }
    get consulType(): string { return CONSUL_TYPE }

    Imperator!: DistributionImperator;
    CreepData!: DelivererData[];
    protected DeliveryRequests!: DistributionConsul_DeliveryRequest[];
    Save() {
        this.SetData(DISTRIBUTION_REQUESTS, this.DeliveryRequests);
        this.SetData(REFILLER_DATA, this.CreepData);
        super.Save();
    }
    Load() {
        if (!super.Load()) { return false }

        this.DeliveryRequests = this.GetData(DISTRIBUTION_REQUESTS);
        this.CreepData = this.GetData(REFILLER_DATA);

        for (let i = 0; i < this.CreepData.length; i++) {
            let creep = Game.creeps[this.CreepData[i].creepName];
            if (!creep) {
                this.CreepData.splice(i--, 1);
                continue;
            }
            if (this.CreepData[i].fetching) {
                if (creep.carry[RESOURCE_ENERGY] == creep.carryCapacity) {
                    this.Parent.Collector.ReleaseManagedCreep(creep.name);
                    this.CreepData[i].fetching = false;
                }
            } else if (creep.carry[RESOURCE_ENERGY] == 0) {
                this.Parent.Collector.AssignManagedCreep(creep);
                this.CreepData[i].fetching = true;
            }

            // THIS IS FUGLY
            let target = this.GetSpawnRefillerTarget(this.CreepData[i]);
            if (target) {
                this.CreepData[i].target = target.id;
            }
        }

        this.Imperator = new DistributionImperator();
        return true;
    }
    InitMemory() {
        super.InitMemory();
        this.CreepData = [];
    }
    ReleaseCreep(creepName: string): void {
        for (let i = 0, length = this.CreepData.length; i < length; i++) {
            if (this.CreepData[i].creepName == creepName) {
                this.CreepData.splice(i, 1);
                break;
            }
        }
    }
    GetSpawnDefinition(): SpawnConsul_SpawnArgs {
        return {
            body: [CARRY, MOVE, CARRY, MOVE, CARRY, MOVE],
            creepName: (Game.time + '_DIST').slice(-8),
            requestorID: this.consulType,
            targetTime: Game.time,
        }
    }
    GetNextSpawn(): boolean {
        if (!this.CreepRequested && this.CreepData.length < 2) {
            return true;
        }

        return false;
    }
    protected _assignCreep(creepName: string): void {
        if (this.CreepData.length > 0) {
            let oldCreep = this.CreepData[0].creepName;
            this.ReleaseCreep(oldCreep);
            this.CreepData.push({ creepName: creepName, refillList: [], fetching: false, target: '' });
            if (Game.creeps[oldCreep]) {
                this.Parent.ReleaseControl(Game.creeps[oldCreep]);
            }
        } else {
            this.CreepData.push({ creepName: creepName, refillList: [], fetching: false, target: '' });
        }
    }

    SetDelivererTargets(creepData: DistributionConsul_RefillerData) {
        let creep = Game.creeps[creepData.creepName];
        let cap = creep.carryCapacity;
        let newList = [];
        let cummulativeTotal = 0;
        while (this.DeliveryRequests.length > 0) {
            let request = this.DeliveryRequests[0];
            if (cummulativeTotal < cap) {
                newList.push(request.id);
                cummulativeTotal += request.amount;
                this.DeliveryRequests.splice(0, 1);
                /*if (cummulativeTotal > cap) {
                    this.DeliveryRequests[0].amount = cummulativeTotal - cap;
                    break;
                } else {
                    this.DeliveryRequests.splice(0, 1);
                }*/
            } else {
                break;
            }
        }

        creepData.refillList = newList;
    }

    GetSpawnRefillerTarget(creepData: DelivererData): SpawnRefillTarget | undefined {
        while (creepData.refillList.length > 0) {
            let targetID = creepData.refillList[0].id;
            let target = Game.getObjectById(targetID) as SpawnRefillTarget;
            if (target.energy < target.energyCapacity) {
                return target;
            } else {
                creepData.refillList.splice(0, 1);
            }
        }

        return;
    }

    ScheduleResourceDelivery(target: Creep | StructureExtension | StructureSpawn | StructureLink, amount: number, time: number = Game.time, resourceType?: ResourceConstant) {
        let request: DistributionConsul_DeliveryRequest = { id: target.id, amount: amount, time: time };
        if (resourceType) {
            request.resourceType = resourceType;
        }

        this.DeliveryRequests.push(request);
    }
}