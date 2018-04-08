import { profile } from "Tools/Profiler";
import { OwnableSwarmObject } from "SwarmTypes/SwarmTypes";

const CARRY_TOTAL = 'CT';
const CURRENT_PATH = 'CP';
@profile
export class SwarmCreep<T extends CreepType> extends OwnableSwarmObject<ICreepData<T>, Creep>
    implements AICreep, Creep {
    Activate(mem: ICreepData<T>, obj: Creep): ICreepData<T> {
        throw new Error("Method not implemented.");
    }
    InitAsNew(mem: ICreepData<T>, obj: Creep): ICreepData<T> {
        throw new Error("Method not implemented.");
    }
    PrepObject(mem: ICreepData<T>, obj: Creep): ICreepData<T> {
        throw new Error("Method not implemented.");
    }

    // (TODO): Need to switch this to using the flashData.
    protected _cachedData: { [id: string]: any } = {};
    get carryTotal() {
        if (!this._cachedData[CARRY_TOTAL]) {
            this._cachedData[CARRY_TOTAL] = _.sum(this._instance.carry);
        }
        return this._cachedData[CARRY_TOTAL];
    }
    get curPath() {
        if (!this._cachedData[CURRENT_PATH]) {
            this._cachedData[CURRENT_PATH] = NOT_CONFIGURED;
        }
        return this._cachedData[CURRENT_PATH];
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
    get prototype() { return this._instance.prototype; }
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