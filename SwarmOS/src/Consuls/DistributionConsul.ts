import * as SwarmCodes from 'Consts/SwarmCodes';
import * as SwarmConsts from 'Consts/SwarmConsts';
import { CreepConsul } from "Consuls/ConsulBase";
import { DistributionImperator } from "Imperators/DistributionImperator";

const CONSUL_TYPE = 'Distribution';
const REFILLER_DATA = 'R_DATA';
const SPAWN_REFILL_REQUESTS = 'SR_REQ';
const OTHER_REQUESTS = 'O_REQ';
const CREEP_SUFFIX = 'Del';
const SPAWN_REFILLER = 'S_R';

export class DistributionConsul extends CreepConsul {
    static get ConsulType(): string { return CONSUL_TYPE; }
    get consulType(): string { return CONSUL_TYPE }

    get _Imperator() {
        return new DistributionImperator();
    }

    protected CreepData!: DistributionConsul_CreepData[];
    protected SpawnRefillRequests!: DistributionConsul_DeliveryRequest[];
    protected OtherRequests!: DistributionConsul_DeliveryRequest[];
    // Add refill targets.

    Save() {
        this.SetData(SPAWN_REFILL_REQUESTS, this.SpawnRefillRequests);
        this.SetData(OTHER_REQUESTS, this.OtherRequests);
        //this.SetData(REFILLER_DATA, this.CreepData);
        super.Save();
    }
    Load() {
        if (!super.Load()) { return false }

        this.SpawnRefillRequests = this.GetData(SPAWN_REFILL_REQUESTS);
        this.OtherRequests = this.GetData(OTHER_REQUESTS);
        //this.CreepData = this.GetData(REFILLER_DATA);

        return true;
    }
    InitMemory() {
        super.InitMemory();
        this.SpawnRefillRequests = [];
        this.OtherRequests = [];
    }
    AssignCreep(creepName: string, jobId: string) {
        super.AssignCreep(creepName, jobId);
        let job = this.Queen.JobBoard.GetJobRequest(jobId);
        if (job.supplementalData == SPAWN_REFILLER) {
            for (let i = 0; i < this.CreepData.length; i++) {
                if (this.CreepData[i].creepName == creepName) {
                    this.CreepData[i].prime = true;
                    break;
                }
            }
        }
    }
    ValidateCreep(creepData: DistributionConsul_CreepData, creep: Creep) {
        if (!super.ValidateCreep(creepData, creep)) {
            return false;
        }
        let target = Game.getObjectById(creepData.targetID);
        if (!target) {
            this.GetNextDeliveryTarget(creepData);
        }

        return true;
    }

    GetNextDeliveryTarget(creepData: DistributionConsul_CreepData): RefillTarget | undefined {
        let creep = Game.creeps[creepData.creepName];
        this.SortDeliveries(creep.pos, true);
        if (!creepData.prime) {
            this.SortDeliveries(creep.pos, false);
        }
        let spawnRequests = this.SpawnRefillRequests;
        let nonSpawnRequests = creepData.prime ? undefined : this.OtherRequests;
        creepData.targetID = undefined;
        let req: DistributionConsul_DeliveryRequest | undefined;
        let target;
        do {
            if (this.SpawnRefillRequests.length == 0) {
                this.ScanRoom();
                if (this.SpawnRefillRequests.length == 0 && creepData.prime) {
                    return;
                }
            }
            let spawnRequest = this.SpawnRefillRequests.length > 0 ? this.SpawnRefillRequests[0] : undefined;
            let otherRequest = this.OtherRequests.length > 0 ? this.OtherRequests[0] : undefined;
            if (!spawnRequest && !otherRequest) {
                return;
            } else if (spawnRequest && otherRequest) {
                // find the closer one
                let distA = creep.pos.getRangeTo(Game.getObjectById(spawnRequest.id) as RefillTarget);
                let distB = creep.pos.getRangeTo(Game.getObjectById(otherRequest.id) as RefillTarget);
                if (distA < distB) {
                    req = this.SpawnRefillRequests.splice(0, 1)[0];
                } else {
                    req = otherRequest;
                }
            } else {
                if (!!spawnRequest) {
                    req = this.SpawnRefillRequests.splice(0, 1)[0];
                } else {
                    req = otherRequest;
                }
            }
            if (!req) { return; }
            target = Game.getObjectById(req.id) as RefillTarget;
            if (!this.IsValidDeliveryTarget(target)) {
                req = undefined;
                target = undefined;
            }
        } while (!target);

        creepData.targetID = target.id;
        return target;
    }

    ScheduleResourceDelivery(target: RefillTarget, amount: number, time: number = Game.time, resourceType?: ResourceConstant) {
        let request: DistributionConsul_DeliveryRequest = { id: target.id, amount: amount, time: time };
        if (resourceType) {
            request.resourceType = resourceType;
        }

        if ((target as EnergyStructure).energyCapacity) {
            this.SpawnRefillRequests.push(request);
        } else {
            this.OtherRequests.push(request);
        }
    }

    ScanRoom() {
        let structures = this.Queen.Nest.find(FIND_STRUCTURES, {
            filter: function (struct) {
                return (struct.structureType == STRUCTURE_EXTENSION ||
                    struct.structureType == STRUCTURE_SPAWN ||
                    struct.structureType == STRUCTURE_TOWER) &&
                    struct.energy < struct.energyCapacity;
            }
        }) as EnergyStructure[];
        structures.sort((a, b) => {
            // Left to right scan will be more efficient than a simple distance check, but
            // this is still a bad solution for a difficult problem.
            return a.pos.x < b.pos.x ? -1 : 1;
        });

        let refillIDs = [];
        for (let i = 0, length = structures.length; i < length; i++) {
            //refillIDs.push(structures[i].id);
            this.ScheduleResourceDelivery(structures[i], (structures[i].energyCapacity - structures[i].energy));
        }
    }
    SortDeliveries(pos: RoomPosition, spawnList: boolean) {
        if (spawnList) {
            this.SpawnRefillRequests.sort((a, b) => {
                let aObj = Game.getObjectById(a.id) as RefillTarget;
                if (!aObj) return 1;
                let bObj = Game.getObjectById(b.id) as RefillTarget;
                if (!bObj) return -1;

                let distA = pos.getRangeTo(aObj.pos);
                let distB = pos.getRangeTo(bObj.pos);

                return distA < distB ? -1 : 1;
            });
        } else {
            this.OtherRequests.sort((a, b) => {
                let aObj = Game.getObjectById(a.id) as RefillTarget;
                if (!aObj) return 1;
                let bObj = Game.getObjectById(b.id) as RefillTarget;
                if (!bObj) return -1;

                let distA = pos.getRangeTo(aObj.pos);
                let distB = pos.getRangeTo(bObj.pos);

                return distA < distB ? -1 : 1;
            });
        }
    }

    protected IsValidDeliveryTarget(obj: RefillTarget) {
        if (!obj) { return false; }
        if ((obj as EnergyStructure).energyCapacity) {
            return (obj as EnergyStructure).energy < (obj as EnergyStructure).energyCapacity;
        } else if ((obj as Creep).carryCapacity) {
            return (obj as Creep).carry.energy < (obj as Creep).carryCapacity;
        }
        return false;
    }

    GetBodyTemplate(): BodyPartConstant[] {
        return [CARRY, MOVE, CARRY, MOVE, CARRY, MOVE];
    }
    GetCreepSuffix(): string {
        return CREEP_SUFFIX;
    }
    GetSpawnPriority(): SwarmConsts.SpawnPriority {
        if (this.CreepData.length == 0) {
            return SwarmConsts.SpawnPriority.Highest;
        }
        return SwarmConsts.SpawnPriority.High;
    }
    GetNextSpawnTime(): number {
        if (this.CreepData.length < 2) {
            return Game.time;
        }

        let nextSpawn = Game.time + 1500;
        for (let i = 0; i < this.CreepData.length; i++) {
            let creepSpawn = Game.time - 100 + Game.creeps[this.CreepData[i].creepName].ticksToLive;
            if (creepSpawn < nextSpawn) {
                nextSpawn = creepSpawn;
            }
        }

        return nextSpawn;
    }
    GetSupplementalData(): any {
        for (let i = 0; i < this.CreepData.length; i++) {
            if (this.CreepData[i].prime) {
                return super.GetSupplementalData();
            }
        }
        return SPAWN_REFILLER;
    };
}