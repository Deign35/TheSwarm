import { CreepConsul } from "./ConsulBase";
import { ImperatorBase } from "Imperators/ImperatorBase";
import { SpawnPriority } from "Consts/SwarmConsts";

const CONSUL_TYPE = 'Retreiver';
const CREEP_SUFFIX = 'Ret';

const RETRIEVAL_TARGETS = 'RTAR';
const DELIVERY_TARGETS = 'DTAR';
export abstract class IRetreivalConsul extends CreepConsul {
    static get ConsulType(): string { return CONSUL_TYPE; }
    get consulType(): string { return CONSUL_TYPE }
    get _Imperator(): ImperatorBase { throw 'NOT IMPLEMENTED'; }

    protected RetrievalTargets!: { [id: string]: RetrievalTargetType };
    protected DeliveryTargets!: { [id: string]: DeliveryTargetType };

    Save() {
        let retrievalIds = [];
        for (let id in this.RetrievalTargets) {
            retrievalIds.push(this.RetrievalTargets[id].id)
        }
        this.SetData(RETRIEVAL_TARGETS, retrievalIds);

        let deliveryIds = [];
        for (let id in this.DeliveryTargets) {
            deliveryIds.push(this.DeliveryTargets[id].id)
        }
        this.SetData(DELIVERY_TARGETS, deliveryIds);
        super.Save();
    }

    Load() {
        if (!super.Load()) { return false; }

        let retrievalIds = this.GetData(RETRIEVAL_TARGETS);
        for (let i = 0; i < retrievalIds.length; i++) {
            let tar = Game.getObjectById(retrievalIds[i]) as RetrievalTargetType;
            if (tar && this.ValidateRetrievalTarget(tar)) {
                this.RetrievalTargets[i] = tar;
            }
        }

        let deliveryIds = this.GetData(DELIVERY_TARGETS);
        for (let i = 0; i < deliveryIds.length; i++) {
            let tar = Game.getObjectById(retrievalIds[i]) as DeliveryTargetType;
            if (tar && this.ValidateDeliveryTarget(tar)) {
                this.DeliveryTargets[i] = tar;
            }
        }

        return true;
    }


    protected ValidateConsulState(): void {
    }
    protected ValidateCreep(creepData: CreepConsul_Data, creep: Creep): boolean {
        if (creep.carry[RESOURCE_ENERGY] == 0) {
            if (creep.ticksToLive < 50) {
                creep.suicide();
                return false;
            }
            let target = Game.getObjectById(creepData.targetID);
            if (!target) {

            }
        }
        let target = Game.getObjectById(creepData.targetID);
        if (!target) {
            if (!this.GetNextDeliveryTarget(creepData) && this.Queen.Nest.storage) {
                creepData.targetID = this.Queen.Nest.storage.id;
            }
        }

        return true;
    }
    protected ValidateRetrievalTarget(target: RetrievalTargetType) {
        return true;
    }
    protected ValidateDeliveryTarget(target: DeliveryTargetType) {
        return true;
    }
    GetBodyTemplate(): BodyPartConstant[] {
        let body = [CARRY, CARRY, MOVE];
        if (this.Queen.SpawnCapacity >= 3000) {
            body = [
                CARRY, CARRY, CARRY, CARRY, CARRY,
                MOVE, MOVE, MOVE, MOVE, MOVE,
                CARRY, CARRY, CARRY, CARRY, CARRY,
                CARRY, CARRY, CARRY, CARRY, CARRY,
                MOVE, MOVE, MOVE, MOVE, MOVE,
                CARRY, CARRY, CARRY, CARRY, CARRY,
            ]
        } else if (this.Queen.SpawnCapacity >= 1000) {
            body = [
                CARRY, CARRY, CARRY, CARRY, CARRY,
                MOVE, MOVE, MOVE, MOVE, MOVE,
                CARRY, CARRY, CARRY, CARRY, CARRY,
            ]
        } else if (this.Queen.SpawnCapacity >= 500) {
            body = [
                CARRY, CARRY, CARRY,
                MOVE, MOVE, MOVE,
                CARRY, CARRY, CARRY,
            ]
        }

        return body;
    }
    GetCreepSuffix(): string {
        return CREEP_SUFFIX;
    }
    GetSupplementalData() { return undefined; }

    GetSpawnPriority(): SpawnPriority {
        if (this.CreepData.length == 0) { return SpawnPriority.Highest; }
        return SpawnPriority.High;
    }
    GetNextSpawnTime(): number {
        if (this.CreepData.length < 2) { return Game.time; }
        let nextSpawnTime = Game.time + 1500;
        for (let i = 0; i < this.CreepData.length; i++) {
            let nextSpawn = Game.time + Game.creeps[this.CreepData[i].creepName].ticksToLive - 100;
            if (nextSpawn < nextSpawnTime) {
                nextSpawnTime = nextSpawn;
            }
        }

        return nextSpawnTime;
    }
}

declare type RetrivalTarget = {
    target: RetrievalTargetType,
    priority: number,
    permanentRetrievalTarget: boolean,
}
declare type RetrievalTargetType =
    StructureContainer | StructureStorage |
    StructureTerminal | StructureLink |
    Tombstone | Creep | StructureLab | Resource;

declare type DeliveryTarget = {
    target: DeliveryTargetType,
    priority: number,
    permanentDeliveryTarget: boolean
}
declare type DeliveryTargetType =
    StructureSpawn | StructureExtension |
    StructureContainer | StructureStorage |
    StructureLink | Creep | StructureTower |
    StructureTerminal | StructureLab;