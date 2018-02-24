import * as SwarmCodes from 'Consts/SwarmCodes';
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

        this.Imperator = new DistributionImperator();
        return true;
    }
    ValidateConsulState(): void {
        if(this.DeliveryRequests.length == 0) {
            this.ScanRoom();
        }
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
                this.Parent.Collector.AssignManagedCreep(creep, false);
                this.CreepData[i].fetching = true;
            }

            // THIS IS FUGLY
            let target = this.GetSpawnRefillerTarget(this.CreepData[i]);
            if(!target) {
                this.SetDelivererTargets(this.CreepData[i]);
                target = this.GetSpawnRefillerTarget(this.CreepData[i]);
            }
            if (target) {
                this.CreepData[i].target = target.id;
            }
        }
    }
    InitMemory() {
        super.InitMemory();
        this.CreepData = [];
        this.DeliveryRequests = [];
    }
    ReleaseCreep(creepName: string): void {
        for (let i = 0, length = this.CreepData.length; i < length; i++) {
            if (this.CreepData[i].creepName == creepName) {
                if(this.CreepData[i].fetching) {
                    this.Queen.Collector.ReleaseManagedCreep(creepName);
                }
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
        this.CreepData.push({ creepName: creepName, refillList: [], fetching: false, target: '' });
    }

    SetDelivererTargets(creepData: DelivererData) {
        let creep = Game.creeps[creepData.creepName];
        let cap = creep.carryCapacity;
        let newList = [];
        let cummulativeTotal = 0;
        while (this.DeliveryRequests.length > 0) {
            if (cummulativeTotal < cap) {
                let request = this.DeliveryRequests[0];
                cummulativeTotal += request.amount;
                newList.push(request);
                this.DeliveryRequests.splice(0, 1);
            } else {
                break;
            }
        }

        creepData.refillList = newList;
    }

    GetSpawnRefillerTarget(creepData: DelivererData): RefillTarget | undefined {
        // Set the target, have the target remain as is..
        while (creepData.refillList.length > 0) {
            let targetID = creepData.refillList[0].id;
            let target = Game.getObjectById(targetID) as RefillTarget;
            if(((target as StructureSpawn).energyCapacity && (target as StructureSpawn).energy < (target as StructureSpawn).energyCapacity) ||
                ((target as Creep).carryCapacity && (target as Creep).carry.energy < (target as Creep).carryCapacity)) {
                return target;
            } else {
                creepData.refillList.splice(0, 1);
            }
        }

        return;
    }

    ScheduleResourceDelivery(target: Creep | StructureTower | StructureExtension | StructureSpawn | StructureLink, amount: number, time: number = Game.time, resourceType?: ResourceConstant) {
        let request: DistributionConsul_DeliveryRequest = { id: target.id, amount: amount, time: time };
        if (resourceType) {
            request.resourceType = resourceType;
        }

        this.DeliveryRequests.push(request);
    }

    ScanRoom() {
        let structures = this.Queen.Nest.find(FIND_STRUCTURES, {
            filter: function (struct) {
                return (struct.structureType == STRUCTURE_EXTENSION ||
                    struct.structureType == STRUCTURE_SPAWN ||
                    struct.structureType == STRUCTURE_TOWER) &&
                    struct.energy < struct.energyCapacity;
            }
        }) as RefillTarget[];
        structures.sort((a, b) => {
            // Left to right scan will be more efficient than a simple distance check, but
            // this is still a bad solution for a difficult problem.
            return a.pos.x < b.pos.x ? -1 : 1;
        });

        let refillIDs = [];
        for (let i = 0, length = structures.length; i < length; i++) {
            //refillIDs.push(structures[i].id);
            this.ScheduleResourceDelivery(structures[i], ((structures[i] as StructureSpawn).energyCapacity - (structures[i] as StructureSpawn).energy));
        }
    }
}