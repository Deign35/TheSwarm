
declare interface IConsulData<T extends ConsulType> extends ISwarmData<SwarmDataType.Consul, SwarmType.SwarmConsul, T> { }

declare interface HarvestConsulData extends IConsulData<ConsulType.Harvest> {
    sourceIDs: string[];
}
declare interface ControlConsulData extends IConsulData<ConsulType.Control> {
    creepIDs: string[];
}
declare type TConsulData = HarvestConsulData | ControlConsulData;