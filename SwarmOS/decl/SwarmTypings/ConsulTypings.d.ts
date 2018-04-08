
declare interface IConsulData<T extends ConsulType> extends
    ISwarmData<SwarmDataType.Consul, SwarmType.SwarmConsul, T> {

}

declare interface HarvestConsulData extends IConsulData<ConsulType.Harvest> {
    sourceIDs: string[];
}
declare interface ControlConsulData extends IConsulData<ConsulType.Control> {
    creepIDs: string[];
}
declare type TConsulData = HarvestConsulData | ControlConsulData;

declare interface AIConsulBaseObject<T extends ConsulType> extends _Constructor<any> {
    GetSwarmType(): SwarmType.SwarmConsul;
    GetConsulType(): T;
}
declare type AIConsulObject = AIConsulBaseObject<ConsulType>;
declare interface AIConsulBase<T extends ConsulType> extends AIBase<TConsulData, AIConsulObject> {
}

declare type AIConsul = AIConsulBase<ConsulType>;