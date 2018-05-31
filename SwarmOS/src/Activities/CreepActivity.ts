export const OSPackage: IPackage<SpawnRegistry_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(SPKG_CreepActivity, CreepActivity);
    }
}

import { SlimProcess } from "Core/BasicTypes";

class CreepActivity extends SlimProcess<ActionMemory> {
    @extensionInterface(EXT_CreepRegistry)
    protected creepRegistry!: ICreepRegistryExtensions;
    @extensionInterface(EXT_RoomView)
    protected View!: IRoomDataExtension;
    @extensionInterface(EXT_Sleep)
    protected sleeper!: IKernelSleepExtension;

    AssignedCreep?: Creep;
    Target?: ObjectTypeWithID;
    TargetPos?: RoomPosition;

    RunThread(): ThreadState {
        this.LoadActionMemory();
        if (!this.AssignedCreep || (!this.Target && !this.TargetPos)) {
            this.EndProcess();
            return ThreadState_Done;
        }

        // (TODO): Change this to be more predictive using the path (e.g. if(this.memory.p.length <= 3))
        if (!CreepActivityExtensions.CreepIsInRange(this.memory.at, this.AssignedCreep.pos, this.TargetPos || this.Target!.pos)) {
            CreepActivityExtensions.MoveCreep(this.AssignedCreep, this.TargetPos || this.Target!.pos, this.memory.p);
        } else {
            let result = CreepActivityExtensions.RunActivity(this.CreateActivityArgs());
            switch (result) {
                case (OK):
                case (ERR_NOT_OWNER):
                case (ERR_NO_PATH):
                case (ERR_NAME_EXISTS):
                case (ERR_BUSY):
                case (ERR_NOT_FOUND):
                case (ERR_NOT_ENOUGH_RESOURCES):
                case (ERR_INVALID_TARGET):
                case (ERR_FULL):
                case (ERR_NOT_IN_RANGE):
                case (ERR_INVALID_ARGS):
                case (ERR_TIRED):
                case (ERR_NO_BODYPART):
                case (ERR_RCL_NOT_ENOUGH):
                case (ERR_GCL_NOT_ENOUGH):
                    console.log(`ActionMemory(${result}) -- ${JSON.stringify(result)}`);
            }
        }

        return ThreadState_Done;
    }

    protected CreateActivityArgs(): RunArgs {
        return {
            actionType: this.memory.at,
            creep: this.AssignedCreep!,
            target: this.Target || this.TargetPos || this.AssignedCreep!.pos,
            amount: this.memory.a,
            message: this.memory.m,
            path: this.memory.p || [],
            resourceType: this.memory.rt,
        }
    }

    protected LoadActionMemory() {
        this.AssignedCreep = this.creepRegistry.tryGetCreep(this.memory.c, this.parentPID);
        this.Target = Game.getObjectById(this.memory.t);
        if (this.memory.tp) {
            this.TargetPos = new RoomPosition(this.memory.tp.x || 25, this.memory.tp.y || 25, this.memory.tp.roomName);
        }
    }

    EndProcess() {
        super.EndProcess(this.memory.c);
    }
}
interface RunArgs {
    creep: Creep;
    actionType: ActionType;
    path: PathStep[];

    target?: any;
    amount?: number;
    message?: string;
    resourceType?: ResourceConstant;
}

// (TODO): Convert this to ExtensionBase or put create on creep extensions
export const CreepActivityExtensions = {
    CreateNewCreepActivity: (actionMem: ActionMemory, parentPID: PID, extensions: IExtensionRegistry) => {
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

        if (!target || !CreepActivityExtensions.ValidateActionTarget(actionMem.at, target)) {
            return undefined;
        }
        if (!actionMem.p) {
            actionMem.p = CreepActivityExtensions.CreateMovePath(creep, target);
        }

        let newPID = extensions.getKernel().startProcess(SPKG_CreepActivity, actionMem);
        extensions.getKernel().setParent(newPID, parentPID);
        return newPID;
    },

    GetSquareDistance: (pos1: { x: number, y: number }, pos2: { x: number, y: number }) => {
        let xDiff = pos1.x - pos2.x;
        let yDiff = pos1.y - pos2.y;
        return xDiff > yDiff ? xDiff : yDiff;
    },

    MoveCreep: (creep: Creep, pos: RoomPosition, path?: PathStep[]) => {
        /*if (path && path.length > 0) {
            creep.moveByPath(path);
        }*/
        creep.moveTo(pos);
    },

    CreateMovePath: (creep: Creep, target: any): PathStep[] => {
        let path: PathStep[] = [];

        return path;
    },

    CreepIsInRange: (actionType: ActionType, pos1: RoomPosition, pos2: RoomPosition) => {
        let distance = CreepActivityExtensions.GetSquareDistance(pos1, pos2);
        if (actionType == AT_Build || actionType == AT_RangedAttack || actionType == AT_RangedHeal || actionType == AT_Repair || actionType == AT_Upgrade) {
            return distance <= 3;
        } else if (actionType == AT_Drop || actionType == AT_Suicide) {
            return distance == 0;
        } else {
            return distance <= 1;
        }
    },
    RunActivity: (args: RunArgs) => {
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
    },
    ValidateActionTarget: (actionType: ActionType, target: any) => {
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