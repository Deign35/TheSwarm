import { CreepConsul } from "Consuls/ConsulBase";

const DISTRIBUTOR_DATA = 'D_Data';
const CONSUL_TYPE = 'Distribution';
export class DistributionConsul extends CreepConsul {
    RequiresSpawn(): boolean {
        throw new Error("Method not implemented.");
    }
    AssignCreep(creepName: string): void {
        throw new Error("Method not implemented.");
    }
    ReleaseCreep(creepName: string): void {
        throw new Error("Method not implemented.");
    }
    GetSpawnDefinition(): SpawnConsul_SpawnArgs {
        throw new Error("Method not implemented.");
    }
    get consulType(): string { return CONSUL_TYPE }

    protected DistributorData!: { [id: string]: DistributionOrder };
    Save() {
        this.SetData(DISTRIBUTOR_DATA, this.DistributorData);
        super.Save();
    }
    Load() {
        if (!super.Load()) { return false }

        this.DistributorData = this.GetData(DISTRIBUTOR_DATA);

        return true;
    }
    RequestDistribution(requestData: DistributionOrder): DistributionType {
        // Search for available resources.
        // Assign the requestor and return the DistributionType

        return DistributionType.transferTo;
    }
    RegisterResourceSource(registrationData: DistributionOrder) {
        this.DistributorData[registrationData.id] = registrationData;
    }
    ScanRoom(): void {

    }
    static get ConsulType(): string { return CONSUL_TYPE; }
}

declare type DistributionOrder = {
    id: string,
    distributorType: DistributionTargetType,
    distributionType: DistributionType,
    amount: number,
    resourceType?: string,
}
declare type DistributionStatus = DistributionOrder & {
    DeliveryStatus?: DistributionOrder
}
export enum DistributionType {
    transferFrom,
    transferTo,
    withdraw,
}
export enum DistributionTargetType {
    creepEnergy,
    structureEnergy,
    spawnEnergy,
    labMineral,
    creepMineral,
    structureMineral
}