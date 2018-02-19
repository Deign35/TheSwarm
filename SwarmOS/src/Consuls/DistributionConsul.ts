import { CreepConsul } from "Consuls/ConsulBase";

const DISTRIBUTOR_DATA = 'D_Data';
const RECEIVER_DATA = 'R_Data';
const CONSUL_TYPE = 'Distribution';

const DEFAULT_PRIORITY = {

}
export class DistributionConsul extends CreepConsul {
    static get ConsulType(): string { return CONSUL_TYPE; }
    get consulType(): string { return CONSUL_TYPE }

    protected StructureData!: { [id: string]: any };
    protected DistributorData!: { [id: string]: DistributorData };
    protected ReceiverData!: { [id: string]: ReceiverData };
    Save() {
        this.SetData(RECEIVER_DATA, this.ReceiverData);
        this.SetData(DISTRIBUTOR_DATA, this.DistributorData);
        super.Save();
    }
    Load() {
        if (!super.Load()) { return false }

        this.DistributorData = this.GetData(DISTRIBUTOR_DATA) || {};
        this.ReceiverData = this.GetData(RECEIVER_DATA) || {};

        return true;
    }
    InitMemory() {
        super.InitMemory();
        this.DistributorData = {};
        this.ReceiverData = {};
        this.ScanRoom();
    }
    RequestDistribution(requestData: DistributionOrder): DistributionActionType {
        // Search for available resources.
        // Assign the requestor and return the DistributionType

        return DistributionActionType.transferTo;
    }
    RegisterStorageStructure(struct: StructureContainer | StructureStorage) {

    }
    RegisterSpawnEnergyStructure(struct: StructureSpawn | StructureExtension) {

    }
    RegisterLink(link: StructureLink) {

    }
    RegisterTower(tower: StructureTower) {

    }
    ScanRoom(): void {
        let structures = this.Nest.find(FIND_STRUCTURES, {
            filter: function (struct) {
                return struct.structureType == STRUCTURE_CONTAINER ||
                    struct.structureType == STRUCTURE_EXTENSION ||
                    struct.structureType == STRUCTURE_LINK ||
                    struct.structureType == STRUCTURE_SPAWN ||
                    struct.structureType == STRUCTURE_STORAGE ||
                    struct.structureType == STRUCTURE_TERMINAL ||
                    struct.structureType == STRUCTURE_TOWER;
            }
        });

        for (let i = 0, length = structures.length; i < length; i++) {

        }
    }
    RequiresSpawn(): boolean {
        throw new Error("Method not implemented.");
    }
    ReleaseCreep(creepName: string): void {
        throw new Error("Method not implemented.");
    }
    GetSpawnDefinition(): SpawnConsul_SpawnArgs {
        return {
            requestorID: this.consulType,
            body: [CARRY, MOVE, CARRY, MOVE],
            creepName: 'Dist_' + ('' + Game.time).slice(-3),
            targetTime: Game.time
        }
    }
    GetIdleCreeps(): Creep[] {
        throw new Error("Method not implemented.");
    }
    protected _assignCreep(creepName: string): void {
        throw new Error("Method not implemented.");
    }
}

declare type DistributionOrder = {
    id: string,
    distributorType: DistributionType,
    distributionActionType: DistributionActionType,
    amount: number,
    resourceType?: string,
}
declare type DistributionStatus = DistributionOrder & {
    DeliveryStatus?: DistributionOrder
}

declare type DistributorData = {
    id: string,
    distributorType: DistributionType,
}
declare type ReceiverData = {
    id: string,
    receiverType: DistributionType,
}
export enum DistributionActionType {
    transferFrom,
    transferTo,
    withdraw,
}
export enum DistributionType {
    creepEnergy,
    structureEnergy,
    spawnEnergy,
    labMineral,
    creepMineral,
    structureMineral
}