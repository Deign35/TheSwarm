declare type TFlagData = IFlagData<FlagType>;
declare interface IFlagData<T extends FlagType> extends ISwarmData<SwarmDataType.Flag, SwarmType.SwarmFlag, T> {
    // Special info for flags
}
declare interface AIFlagBase<T extends FlagType> extends AIBase<IFlagData<T>, Flag> {

}

declare type AIFlag = AIFlagBase<FlagType>;