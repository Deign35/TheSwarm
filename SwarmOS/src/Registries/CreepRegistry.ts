declare var Memory: {
    creepData: CreepRegistry_Memory;
    creeps: SDictionary<ScreepsObject_CreepMemory>;
}

import { BasicProcess, ExtensionBase } from "Core/BasicTypes";

export const OSPackage: IPackage<CreepRegistry_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(PKG_CreepRegistry, CreepRegistry);
        extensionRegistry.register(EXT_CreepRegistry, new CreepRegistryExtensions(extensionRegistry));
        extensionRegistry.register(EXT_CreepActivity, new CreepActivityExtensions(extensionRegistry));
    }
}

const PKG_CreepRegistry_LogContext: LogContext = {
    logID: PKG_CreepRegistry,
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

// This can eventually become a CreepGroup, but one that controls all the creeps -- Scheduler!!!!
class CreepRegistry extends BasicProcess<CreepRegistry_Memory> {
    @extensionInterface(EXT_CreepRegistry)
    Extensions!: ICreepRegistryExtensions;
    protected get memory(): CreepRegistry_Memory {
        if (!Memory.creepData) {
            this.log.warn(`Initializing CreepRegistry memory`);
            Memory.creepData = {
                registeredCreeps: {}
            }
        }
        return Memory.creepData;
    }
    protected get registeredCreeps() {
        return this.memory.registeredCreeps;
    }

    protected get logID(): string {
        return PKG_CreepRegistry_LogContext.logID;
    }
    protected get logLevel(): LogLevel {
        return PKG_CreepRegistry_LogContext.logLevel!;
    }

    PrepTick() {
        let creepIDs = Object.keys(this.memory.registeredCreeps);
        for (let i = 0; i < creepIDs.length; i++) {
            if (!this.kernel.getProcessByPID(this.memory.registeredCreeps[creepIDs[i]].o!)) {
                delete this.memory.registeredCreeps[creepIDs[i]].o;
            }
            if (!Game.creeps[creepIDs[i]]) {
                delete this.memory.registeredCreeps[creepIDs[i]];
                delete Memory.creeps[creepIDs[i]];
            }
        }
        creepIDs = Object.keys(Game.creeps);
        for (let i = 0, length = creepIDs.length; i < length; i++) {
            let creep = Game.creeps[creepIDs[i]];
            let context = this.registeredCreeps[creepIDs[i]];
            if (!context) {
                this.Extensions.tryRegisterCreep({
                    ct: creep.memory.ct,
                    l: creep.memory.lvl,
                    n: creep.name
                })
            }
        }
    }

    RunThread(): ThreadState {
        return ThreadState_Done;
    }
}
class CreepRegistryExtensions extends ExtensionBase implements ICreepRegistryExtensions {
    protected get memory(): CreepRegistry_Memory {
        if (!Memory.creepData) {
            this.log.warn(`Initializing CreepRegistry memory`);
            Memory.creepData = {
                registeredCreeps: {}
            }
        }
        return Memory.creepData;
    }
    protected get registeredCreeps() {
        return this.memory.registeredCreeps;
    }

    tryFindCompatibleCreep(creepType: CT_ALL, level: number, targetRoom: RoomID, maxDistance: number = 3): string | undefined {
        let bestMatch: CreepContext | undefined = undefined;
        let dist = maxDistance + 1;
        let desiredBody = CreepBodies[creepType][level];
        let creepIDs = Object.keys(this.registeredCreeps);
        for (let i = 0; i < creepIDs.length; i++) {
            let creep = this.registeredCreeps[creepIDs[i]];
            if (creep.o) { continue; }

            let compareDist = Game.map.getRoomLinearDistance(Game.creeps[creep.n].room.name, targetRoom);
            let betterMatch = false;

            if (creep.ct == creepType) {
                if (!bestMatch) {
                    betterMatch = true;
                } else {
                    if (bestMatch.l != level || bestMatch.l == creep.l) {
                        if (compareDist < dist) {
                            betterMatch = true;
                        }
                    } else {
                        if (bestMatch.l < level && creep.l > bestMatch.l) {
                            betterMatch = true;
                        } else if (bestMatch.l > level && creep.l < bestMatch.l) {
                            betterMatch = true;
                        }
                    }
                }
            }

            if (betterMatch) {
                bestMatch = creep;
                dist = compareDist;
            }
        }

        return bestMatch ? bestMatch.n : undefined;
    }

    tryRegisterCreep(creepContext: CreepContext): boolean {
        if (!this.registeredCreeps[creepContext.n]) {
            this.registeredCreeps[creepContext.n] = creepContext;
            return true;
        }

        return false;
    }

    tryGetCreep(id?: CreepID, requestingPID?: PID): Creep | undefined {
        if (!id || !requestingPID) {
            return undefined;;
        }
        let request = this.registeredCreeps[id];
        if (!request || !Game.creeps[request.n] || !request.o || request.o != requestingPID) {
            return undefined;
        }
        return Game.creeps[request.n];
    }

    tryReserveCreep(id?: CreepID, requestingPID?: PID): boolean {
        if (!id || !requestingPID) {
            return false;
        }
        if (!this.registeredCreeps[id]) {
            let creep = Game.creeps[id];
            if (!creep) {
                return false;
            }
            this.tryRegisterCreep({ ct: creep.memory.ct, l: creep.memory.lvl, n: creep.name, o: requestingPID });
        }
        if (!this.registeredCreeps[id].o) {
            this.registeredCreeps[id].o = requestingPID;
        }
        return this.registeredCreeps[id].o == requestingPID;
    }

    releaseCreep(id?: CreepID, requestingPID?: PID): void {
        if (!id || !requestingPID) {
            return;
        }
        if (this.registeredCreeps[id]) {
            if (!requestingPID || this.registeredCreeps[id].o == requestingPID) {
                this.registeredCreeps[id].o = undefined;
            }
        }
    }
}

class CreepActivityExtensions extends ExtensionBase implements ICreepActivityExtensions {
    CreateNewCreepActivity(actionMem: CreepActivity_Memory, parentPID: PID, extensions: IExtensionRegistry): PID | undefined {
        if (!actionMem || !parentPID || !extensions || !actionMem.c || !actionMem.at) {
            return undefined;
        }
        let creep = (extensions.get(EXT_CreepRegistry) as ICreepRegistryExtensions).tryGetCreep(actionMem.c, parentPID);
        if (!creep) {
            return undefined;
        }
        let target = actionMem.t ? Game.getObjectById(actionMem.t) : undefined;
        if (!target && actionMem.tp) {
            target = new RoomPosition(actionMem.tp.x || 25, actionMem.tp.y || 25, actionMem.tp.roomName);
        } else if (!target) {
            target = creep.pos;
        }

        if (!target || !this.ValidateActionTarget(actionMem.at, target)) {
            return undefined;
        }
        if (!actionMem.p) {
            actionMem.p = this.CreateMovePath(creep, target);
        }

        let newPID = extensions.getKernel().startProcess(SPKG_CreepActivity, actionMem);
        extensions.getKernel().setParent(newPID, parentPID);
        return newPID;
    }
    protected GetSquareDistance(pos1: { x: number, y: number }, pos2: { x: number, y: number }) {
        let xDiff = pos1.x - pos2.x;
        xDiff *= xDiff < 0 ? -1 : 1;
        let yDiff = pos1.y - pos2.y;
        yDiff *= yDiff < 0 ? -1 : 1;
        return xDiff > yDiff ? xDiff : yDiff;
    }

    MoveCreep(creep: Creep, pos: RoomPosition, path?: PathStep[]) {
        /*if (path && path.length > 0) {
            creep.moveByPath(path);
        }*/
        return creep.moveTo(pos);
    }

    CreateMovePath(creep: Creep, target: any): PathStep[] {
        let path: PathStep[] = [];

        return path;
    }

    CreepIsInRange(actionType: ActionType, pos1: RoomPosition, pos2: RoomPosition) {
        let distance = this.GetSquareDistance(pos1, pos2);
        if (actionType == AT_Build || actionType == AT_RangedAttack || actionType == AT_RangedHeal || actionType == AT_Repair || actionType == AT_Upgrade) {
            return distance <= 3;
        } else if (actionType == AT_Drop || actionType == AT_Suicide) {
            return distance == 0;
        } else {
            return distance <= 1;
        }
    }
    RunActivity(args: RunArgs) {
        let creep = args.creep;
        let actionType = args.actionType;
        let target = args.target;
        switch (actionType) {
            case (AT_Attack): return creep.attack(target);
            case (AT_AttackController): return creep.attackController(target);
            case (AT_Build): return creep.build(target);
            case (AT_ClaimController): return creep.claimController(target);
            case (AT_Dismantle): return creep.dismantle(target);
            case (AT_GenerateSafeMode): return creep.generateSafeMode(target);
            case (AT_Harvest): return creep.harvest(target);
            case (AT_Heal): return creep.heal(target);
            case (AT_Pickup): return creep.pickup(target);
            case (AT_RangedAttack): return creep.rangedAttack(target);
            case (AT_RangedHeal): return creep.rangedHeal(target);
            case (AT_Repair): return creep.repair(target);
            case (AT_ReserveController): return creep.reserveController(target);
            case (AT_Upgrade): return creep.upgradeController(target);

            case (AT_RequestTransfer):
                if ((target as Creep).transfer) {
                    return (target as Creep).transfer(creep, args.resourceType || RESOURCE_ENERGY, args.amount || 0);
                }
                break;
            case (AT_SignController): return creep.signController(target, args.message || '');
            case (AT_Transfer): return creep.transfer(target, args.resourceType || RESOURCE_ENERGY, args.amount || 0);
            case (AT_Withdraw): return creep.withdraw(target, args.resourceType || RESOURCE_ENERGY, args.amount || 0);

            case (AT_Drop): return creep.drop(args.resourceType || RESOURCE_ENERGY, args.amount || 0);
            case (AT_MoveByPath):
                if (args.path) {
                    return creep.moveByPath(args.path);
                }
                break;
            case (AT_MoveToPosition):
                if ((target as Structure).pos) {
                    target = (target as Structure).pos;
                }
                return creep.moveTo(target);
            case (AT_RangedMassAttack): return creep.rangedMassAttack();
            case (AT_Suicide): return creep.suicide();
            case (AT_NoOp): return OK;
        }

        return ERR_INVALID_ARGS;
    }
    ValidateActionTarget(actionType: ActionType, target: any) {
        switch (actionType) {
            case (AT_Attack): return !!(target as Creep | Structure).hitsMax;
            case (AT_AttackController): return (target as Structure).structureType == STRUCTURE_CONTROLLER;
            case (AT_Build): return (target as ConstructionSite).structureType && !(target as Structure).hitsMax;
            case (AT_ClaimController): return (target as Structure).structureType == STRUCTURE_CONTROLLER;
            case (AT_Dismantle): return (target as Structure).structureType && !!(target as Structure).hitsMax;
            case (AT_GenerateSafeMode): return (target as Structure).structureType == STRUCTURE_CONTROLLER;
            case (AT_Harvest): return !(target as Structure).structureType && (!!(target as Source).energyCapacity || !!(target as Mineral).mineralType);
            case (AT_Heal): return !!(target as Creep).ticksToLive;
            case (AT_Pickup): return !!(target as Resource).resourceType;
            case (AT_RangedAttack): return !!(target as Creep | Structure).hitsMax
            case (AT_RangedHeal): return !!(target as Creep | Structure).hitsMax
            case (AT_Repair): return (target as Structure).structureType && !!(target as Structure).hitsMax;
            case (AT_RequestTransfer): return !!(target as Creep).ticksToLive;
            case (AT_ReserveController): return (target as Structure).structureType == STRUCTURE_CONTROLLER;
            case (AT_Upgrade): return (target as Structure).structureType == STRUCTURE_CONTROLLER;
            case (AT_SignController): return (target as Structure).structureType == STRUCTURE_CONTROLLER;
            case (AT_Transfer): return !!(target as Creep | Structure).hitsMax
            case (AT_Withdraw): return (target as Structure).structureType && (!!(target as StructureContainer).storeCapacity || !!(target as StructureLink).energyCapacity);

            case (AT_Drop):
            case (AT_MoveByPath):
            case (AT_MoveToPosition):
            case (AT_RangedMassAttack):
            case (AT_Suicide):
            case (AT_NoOp):
            default:
                return target && !!(target as RoomPosition).isNearTo;
        }
    }
}