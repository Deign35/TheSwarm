declare interface INestQueen extends IMemory {
}

declare interface IHiveQueen extends INestQueen {

}

declare type CreepRequestData = {
    requestID: string,
    requestor: string,
    body: BodyPartConstant[],
    creepSuffix: string,
    terminationType: number,
    priority: number,
    initMemory?: any,
    disabled?: boolean,
    targetTime?: number,
    supplementalData?: any
}