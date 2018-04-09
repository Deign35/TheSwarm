import { profile } from "Tools/Profiler";
import { OwnableSwarmObject } from "SwarmTypes/SwarmTypes";

const FLASH_CARRY_TOTAL = 'carryTotal';
const FLASH_CURRENT_PATH = 'curPath';
@profile
export class SwarmCreep_Base<T extends CreepType> extends OwnableSwarmObject<IData, Creep>
    implements AICreep, Creep {
    get carryTotal() {
        if (!this.memory.HasData(FLASH_CARRY_TOTAL)) {
            this.memory.SetData(FLASH_CARRY_TOTAL, _.sum(this._instance.carry), false);
        }
        return this.memory.GetData(FLASH_CARRY_TOTAL);
    }
    get curPath() {
        if (!this.memory.HasData(FLASH_CURRENT_PATH)) {
            this.memory.SetData(FLASH_CURRENT_PATH, NOT_CONFIGURED, false);
        }
        return this.memory.GetData(FLASH_CURRENT_PATH);
    }

    /**
     * Prototype properties
     *  
     */
    get body() { return this._instance.body; }
    get carry() { return this._instance.carry; }
    get carryCapacity() { return this._instance.carryCapacity }
    get fatigue() { return this._instance.fatigue; }
    get hits() { return this._instance.hits; }
    get hitsMax() { return this._instance.hitsMax; }
    get prototype() { return this._instance; }
    get name() { return this._instance.name; }
    get room() { return this._instance.room; }
    get saying() { return this._instance.saying; }
    get spawning() { return this._instance.spawning; }
    get ticksToLive() { return this._instance.ticksToLive; }

    /**
     * Prototype methods
     * 
     */
    attack(target: Creep | Structure) { // ActionIntent
        return this._instance.attack(target);
    }
    attackController(target: StructureController) { // ActionIntent
        return this._instance.attackController(target);
    }
    build(target: ConstructionSite) { // ActionIntent
        return this._instance.build(target);
    }
    cancelOrder(methodName: string) { // ActionIntent
        return this._instance.cancelOrder(methodName);
    }
    claimController(target: StructureController) { // ActionIntent
        return this._instance.claimController(target);
    }
    dismantle(target: Structure) { // ActionIntent
        return this._instance.dismantle(target);
    }
    drop(resourceType: ResourceConstant, amount?: number) { // ActionIntent
        return this._instance.drop(resourceType, amount);
    }
    generateSafeMode(target: StructureController) { // ActionIntent
        return this._instance.generateSafeMode(target);
    }
    getActiveBodyparts(bodyPart: BodyPartConstant) {
        return this._instance.getActiveBodyparts(bodyPart);
    }
    harvest(target: Source) { // ActionIntent
        return this._instance.harvest(target);
    }
    heal(target: Creep) { // ActionIntent
        return this._instance.heal(target);
    }
    move(direction: DirectionConstant) { // ActionIntent
        return this._instance.move(direction);
    }
    moveByPath(path: PathStep[]) { // ActionIntent
        return this._instance.moveByPath(path);
    }
    moveTo(...args: any[]) { // High CPU Cost
        if (args.length == 1) {
            return this._instance.moveTo(args[0] as RoomPosition);
        }
        else if (args.length == 2) {
            return this._instance.moveTo(args[0] as RoomPosition, args[1] as MoveToOpts | undefined);
        } else if (args.length == 3) {
            return this._instance.moveTo(args[0] as number, args[1] as number, args[2] as MoveToOpts | undefined);
        }

        return ERR_INVALID_TARGET;
    }
    pickup(target: Resource) { // ActionIntent
        return this._instance.pickup(target);
    }
    rangedAttack(target: Creep | Structure) { // ActionIntent
        return this._instance.rangedAttack(target);
    }
    rangedHeal(target: Creep) { // ActionIntent
        return this._instance.rangedHeal(target);
    }
    rangedMassAttack() { // ActionIntent
        return this._instance.rangedMassAttack();
    }
    repair(target: Structure) { // ActionIntent
        return this._instance.repair(target);
    }
    reserveController(target: StructureController) { // ActionIntent
        return this._instance.reserveController(target);
    }
    say(message: string) {
        return this._instance.say(message);
    }
    signController(target: StructureController, message: string) { // ActionIntent
        return this._instance.signController(target, message);
    }
    suicide() { // ActionIntent
        return this._instance.suicide()
    }
    transfer(target: Creep | Structure, resourceType: ResourceConstant, amount?: number) { // ActionIntent
        return this._instance.transfer(target, resourceType, amount);
    }
    upgradeController(target: StructureController) { // ActionIntent
        return this._instance.upgradeController(target);
    }
    withdraw(target: StructureContainer | StructureStorage | StructureTerminal,
        resourceType: ResourceConstant, amount?: number) { // ActionIntent
        return this._instance.withdraw(target, resourceType, amount);
    }
}

export type SwarmCreep = SwarmCreep_Base<CreepType>;