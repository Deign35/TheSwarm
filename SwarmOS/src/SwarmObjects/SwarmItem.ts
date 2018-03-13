import { CreepMemory } from "Memory/StorageMemory";
import { InvalidArgumentException } from "Tools/SwarmExceptions";

export class SwarmItemBase<T extends ValidSwarmObjects> {
    constructor(protected _instance: T) { }
    get id() { return this._instance.id; }
    get my() { return this._instance.my; }
    get owner() { return this._instance.owner; }
    get pos() { return this._instance.pos; }
    get room() { return this._instance.room; }
    notifyWhenAttacked(notify: boolean = false) { return this._instance.notifyWhenAttacked(notify) as OK | ERR_NOT_OWNER | ERR_BUSY | ERR_INVALID_ARGS; }

    GetWrappedObject() { return this._instance; }
}

const CARRY_TOTAL = 'CT';
const CURRENT_PATH = 'CP';
export class SwarmCreep extends SwarmItemBase<Creep> implements Creep {
    protected data: { [id: string]: any } = {};
    protected creepMemory!: CreepMemory;
    get carryTotal() {
        if (!this.data[CARRY_TOTAL]) {
            this.data[CARRY_TOTAL] = _.sum(this._instance.carry);
        }
        return this.data[CARRY_TOTAL];
    }
    get curPath() {
        if (!this.data[CURRENT_PATH]) {
            this.data[CURRENT_PATH] = NOT_CONFIGURED;
        }
        return this.data[CURRENT_PATH];
    }
    get endTickEnergy() {
        // This should utilize calls to things like Drop/Harvest/Pickup etc... and calculate if reactions aught to be
        // enacted as a result of being invalid next tick.
        return 0;
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
    get memory() {
        //throw "This should be allowed only once it has been properly integrated";
        return this._instance.memory;
    }
    get prototype() { return this._instance.prototype; }
    get name() { return this._instance.name; }
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

declare type ValidSwarmObjects = Creep | OwnedStructure;