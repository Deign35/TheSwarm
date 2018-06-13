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
    @extensionInterface(EXT_RoomView)
    View!: IRoomDataExtension;
    get memory(): CreepRegistry_Memory {
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
        let creepIDs = Object.keys(this.registeredCreeps);
        for (let i = 0; i < creepIDs.length; i++) {
            if (!this.kernel.getProcessByPID(this.registeredCreeps[creepIDs[i]].o!)) {
                delete this.memory.registeredCreeps[creepIDs[i]].o;
            }
            if (!Game.creeps[creepIDs[i]]) {
                delete this.memory.registeredCreeps[creepIDs[i]];
                delete Memory.creeps[creepIDs[i]];
            }
        }
    }

    RunThread(): ThreadState {
        let creepIDs = Object.keys(Game.creeps);
        for (let i = 0, length = creepIDs.length; i < length; i++) {
            let creep = Game.creeps[creepIDs[i]];
            let context = this.registeredCreeps[creep.name];
            if (!context) {
                if (!this.Extensions.tryRegisterCreep(creep.name)) {
                    this.log.error(`Creep context doesnt exist and couldnt register the creep(${creep.name}).`);
                    return ThreadState_Done;
                }
                this.registeredCreeps[creep.name].o = creep.memory.p;
                delete creep.memory.p;
                context = this.registeredCreeps[creep.name];
            }

            if (!context.o) {
                let roomData = this.View.GetRoomData(creep.room.name)!;
                if (roomData.groups.CR_Work) {
                    let proc = this.kernel.getProcessByPID(roomData.groups.CR_Work);
                    if (proc && (proc as IWorkerGroupProcess).AddCreep) {
                        (proc as IWorkerGroupProcess).AddCreep(creep.name);
                    }
                }
            }
        }
        return ThreadState_Done;
    }
}
class CreepRegistryExtensions extends ExtensionBase implements ICreepRegistryExtensions {
    get memory(): CreepRegistry_Memory {
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
        let bestMatch: { con: CreepContext, creep: Creep } | undefined = undefined;
        let dist = maxDistance + 1;
        let desiredBody = CreepBodies[creepType][level];
        let creepIDs = Object.keys(this.registeredCreeps);
        for (let i = 0; i < creepIDs.length; i++) {
            let creepData = this.registeredCreeps[creepIDs[i]];
            let creep = Game.creeps[creepData.c];

            if (creepData.o) {
                let parentProcess = this.extensionRegistry.getKernel().getProcessByPID(creepData.o);
                if (parentProcess && (parentProcess.pkgName != CJ_Work || creepType == CT_Worker)) {
                    continue;
                }
            }

            let compareDist = Game.map.getRoomLinearDistance(Game.creeps[creepData.c].room.name, targetRoom);
            let betterMatch = false;

            if (creep.memory.ct == creepType || creepType == CT_Worker) {
                if (!bestMatch) {
                    betterMatch = true;
                } else {
                    if (bestMatch.con.o && !creepData.o) {
                        betterMatch = true;
                    } else if (creep.memory.ct == creepType && bestMatch.creep.memory.ct != creepType) {
                        betterMatch = true;
                    } else if (bestMatch.creep.memory.lvl != level || bestMatch.creep.memory.lvl == creep.memory.lvl) {
                        if (compareDist < dist) {
                            betterMatch = true;
                        } else if (bestMatch.creep.memory.lvl < level && creep.memory.lvl > bestMatch.creep.memory.lvl) {
                            betterMatch = true;
                        } else if (bestMatch.creep.memory.lvl > level && creep.memory.lvl < bestMatch.creep.memory.lvl) {
                            betterMatch = true;
                        }
                    }
                }
            }

            if (betterMatch) {
                bestMatch = {
                    con: creepData,
                    creep: creep
                }
                dist = compareDist;
            }
        }

        return bestMatch ? bestMatch.con.c : undefined;
    }

    tryRegisterCreep(creepID: CreepID): boolean {
        if (!this.registeredCreeps[creepID] && Game.creeps[creepID]) {
            this.registeredCreeps[creepID] = {
                c: creepID,
                rID: Game.creeps[creepID].room.name
            }
            return true;
        }

        return false;
    }

    tryGetCreep(id?: CreepID, requestingPID?: PID): Creep | undefined {
        if (!id || !requestingPID) {
            return undefined;;
        }
        let request = this.registeredCreeps[id];
        if (!request || !Game.creeps[request.c] || !request.o || request.o != requestingPID) {
            return undefined;
        }
        return Game.creeps[request.c];
    }

    tryReserveCreep(id?: CreepID, requestingPID?: PID): boolean {
        if (!id || !requestingPID) {
            return false;
        }
        if (!this.registeredCreeps[id]) {
            if (!this.tryRegisterCreep(id)) {
                return false;
            }
        }
        if (!this.registeredCreeps[id].o) {
            this.registeredCreeps[id].o = requestingPID;
        }
        return this.registeredCreeps[id].o == requestingPID;
    }

    releaseCreep(id?: CreepID, requestingPID?: PID): void {
        if (!id) {
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
    CreateNewCreepActivity(actionMem: CreepActivity_Memory, parentPID: PID): PID | undefined {
        if (!actionMem || !parentPID || !actionMem.c || !actionMem.at) {
            return undefined;
        }
        let creep = (this.extensionRegistry.get(EXT_CreepRegistry) as ICreepRegistryExtensions).tryGetCreep(actionMem.c, parentPID);
        if (!creep) {
            return undefined;
        }
        let target: ObjectTypeWithID | RoomPosition | undefined = actionMem.t ? Game.getObjectById(actionMem.t) : undefined;
        if (!target && actionMem.p) {
            target = new RoomPosition(actionMem.p.x || 25, actionMem.p.y || 25, actionMem.p.roomName);
        } else if (!target) {
            target = creep.pos;
        }

        if (!target || !this.ValidateActionTarget(actionMem.at, target)) {
            return undefined;
        }

        let newPID = this.extensionRegistry.getKernel().startProcess(SPKG_CreepActivity, actionMem);
        this.extensionRegistry.getKernel().setParent(newPID, parentPID);
        return newPID;
    }
    protected GetSquareDistance(pos1: { x: number, y: number }, pos2: { x: number, y: number }) {
        let xDiff = pos1.x - pos2.x;
        xDiff *= xDiff < 0 ? -1 : 1;
        let yDiff = pos1.y - pos2.y;
        yDiff *= yDiff < 0 ? -1 : 1;
        return xDiff > yDiff ? xDiff : yDiff;
    }

    MoveCreep(creep: Creep, pos: RoomPosition) {
        return creep.moveTo(pos, {
            visualizePathStyle: {
                fill: 'transparent',
                stroke: '#fff',
                lineStyle: 'dashed',
                strokeWidth: .15,
                opacity: .25
            }
        });
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
            case (AT_Harvest):
                let res = creep.harvest(target);
                if (res == OK && creep.carry.energy == creep.carryCapacity) {
                    return ERR_FULL;
                }
                return res;
            case (AT_Heal): return creep.heal(target);
            case (AT_Pickup): return creep.pickup(target);
            case (AT_RangedAttack): return creep.rangedAttack(target);
            case (AT_RangedHeal): return creep.rangedHeal(target);
            case (AT_Repair):
                if ((target as Structure).hits == (target as Structure).hitsMax) {
                    return ERR_INVALID_TARGET;
                }
                return creep.repair(target);
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
                break;
            case (AT_MoveToPosition):
                if ((target as Structure).pos) {
                    target = (target as Structure).pos;
                }
                let result = creep.moveTo(target, {
                    visualizePathStyle: {
                        fill: 'transparent',
                        stroke: '#fff',
                        lineStyle: 'dashed',
                        strokeWidth: .15,
                        opacity: .25
                    }
                });
                let dist = creep.pos.getRangeTo(target);
                if (dist <= (args.amount || 0)) {
                    if (creep.pos.isNearTo(target)) {
                        let creeps = (target as RoomPosition).lookFor(LOOK_CREEPS);
                        if (creeps.length > 0 && creeps[0].name != creep.name) {
                            return ERR_NO_PATH;
                        }
                        return result;
                    }
                } else {
                    return ERR_NOT_IN_RANGE;
                }
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
            case (AT_Repair): return (target as Structure).structureType && !!(target as Structure).hitsMax && (target as Structure).hits < (target as Structure).hitsMax;
            case (AT_RequestTransfer): return !!(target as Creep).ticksToLive;
            case (AT_ReserveController): return (target as Structure).structureType == STRUCTURE_CONTROLLER;
            case (AT_Upgrade): return (target as Structure).structureType == STRUCTURE_CONTROLLER;
            case (AT_SignController): return (target as Structure).structureType == STRUCTURE_CONTROLLER;
            case (AT_Transfer):
                if (!(target as Creep | Structure).hitsMax) {
                    return false;
                }

                if ((target as Structure).structureType) {
                    if ((target as StructureStorage).energy < (target as StructureTerminal).energyCapacity) {
                        return true;
                    }
                } else {
                    if ((target as Creep).carry.energy < (target as Creep).carryCapacity * 0.8) {
                        return true;
                    }
                }
                return false;
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