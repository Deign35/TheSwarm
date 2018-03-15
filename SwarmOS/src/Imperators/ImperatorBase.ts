export abstract class ImperatorBase implements IImperator {
    abstract ActivateCreep(creep: CreepConsul_Data): SwarmCodes.SwarmlingResponse;
}