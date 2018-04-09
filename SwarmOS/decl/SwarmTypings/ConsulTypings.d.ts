
declare interface IConsulData<T extends ConsulType> extends
    ISwarmData<SwarmDataType.Consul, SwarmType.SwarmConsul, T> {
}
declare type TConsulData = IConsulData<ConsulType>;

declare interface ControlConsulData extends IConsulData<ConsulType.Control> {
    creepIDs: string[];
}

declare interface AIConsulBaseObject<T extends ConsulType> extends _Constructor<any> {
    ConsulType: T;
}
declare type AIConsulObject = AIConsulBaseObject<ConsulType>;
declare interface AIConsulBase<T extends ConsulType>
    extends AIBase<TConsulData, AIConsulObject> {
}

declare type AIConsul = AIConsulBase<ConsulType>;