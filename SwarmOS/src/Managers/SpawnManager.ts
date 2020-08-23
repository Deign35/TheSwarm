import { BasicProcess, ExtensionBase } from "Core/BasicTypes";

export const OSPackage: IPackage<any> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {

    }
}

const PKG_SpawnManager_LogContext: LogContext = {
    logID: PKG_SpawnManager,
    logLevel: LOG_INFO
}

// This order determines the default order of body parts
const BodyLegend = {
    t: TOUGH,
    a: ATTACK,
    r: RANGED_ATTACK,
    cl: CLAIM,
    w: WORK,
    c: CARRY,
    h: HEAL,
    m: MOVE,
}

// (TODO) -- Convert this to auto generated -- maybe also optional ordering??
// additionally, presize the array.
const ConvertContextToSpawnBody = function (context: SpawnContext) {
    let body = [];
    let bodyDef = CreepBodies.get(context.creep_type)[context.level];
    for (let bodyID in BodyLegend) {
        if (bodyDef[bodyID]) {
            for (let i = 0; i < bodyDef[bodyID]; i++) {
                body.push(BodyLegend[bodyID]);
            }
        }
    }

    return body;
}