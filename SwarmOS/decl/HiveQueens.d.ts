declare interface INestQueen extends IMemory {
}

declare interface IHiveQueen extends INestQueen {

}

declare type CreepRequestData = {
    requestID: string,
    requestor: string,
    body: BodyPartConstant[],
    creepSuffix: string,
    priority: number,
    supplementalData?: any
}