import * as SwarmCodes from "Consts/SwarmCodes"
import { CreepConsul } from "Consuls/ConsulBase";

export abstract class ImperatorBase implements IImperator {
    abstract ActivateCreep(creep: CreepConsul_Data): SwarmCodes.SwarmlingResponse;
}