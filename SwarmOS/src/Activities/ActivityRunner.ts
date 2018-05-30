export interface RunArgs {
    creep: Creep;
    actionType: ActionType;
    target?: any;
    
    amount?: number;
    message?: string;
    resourceType?: ResourceConstant;
    path?: PathStep[];
}

export const ActivityRunner = {
    GetSquareDistance: (pos1: { x: number, y: number }, pos2: { x: number, y: number }) => {
        let xDiff = pos1.x - pos2.x;
        let yDiff = pos1.y - pos2.y;
        return xDiff > yDiff ? xDiff : yDiff;
    },
    MoveCreep: (creep: Creep, pos: RoomPosition) => {
        creep.moveTo(pos);
    },

    CreepIsInRange: (actionType: ActionType, pos1: RoomPosition, pos2: RoomPosition) => {
        let distance = ActivityRunner.GetSquareDistance(pos1, pos2);
        if (actionType == AT_Build || actionType == AT_RangedAttack || actionType == AT_RangedHeal || actionType == AT_Repair || actionType == AT_Upgrade) {
            return distance <= 3;
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
                return true;
        }
    }
}