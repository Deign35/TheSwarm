import { OwnableSwarmObject } from "./SwarmObject";
import * as _ from "lodash";
import { CreepMemory } from "Memory/StorageMemory";
import { MemoryNotFoundException, SwarmException } from "Tools/SwarmExceptions";

const CARRY_TOTAL = 'CT';
const CURRENT_PATH = 'CP';
export class SwarmCreep extends OwnableSwarmObject<Creep> implements ICreepManager {
    StartTick(): void {
        this.InitForTick();
    }
    ProcessTick(): void {
        let oldValue = this.creepMemory.GetData<number>('Test') || 0;
        this.creepMemory.SetData('Test', (oldValue + 1));
        //throw new Error("Method not implemented.");
    }
    EndTick(): void {
        Swarmlord.ReleaseMemory(this.creepMemory, true);
    }

    InitForTick(): void {
        try {
            this.creepMemory = Swarmlord.CheckoutMemory(this.name,
                [Swarmlord.StorageMemoryTypeToString(StorageMemoryType.Creep)], StorageMemoryType.Creep);
        } catch (error) {
            if (error.name != MemoryNotFoundException.ErrorName) {
                throw new SwarmException('InitForTick', error.name + '_' + error.message);
            }
            this.InitCreep();
            this.creepMemory = Swarmlord.CheckoutMemory(this.name,
                [Swarmlord.StorageMemoryTypeToString(StorageMemoryType.Creep)], StorageMemoryType.Creep);
        }
    }

    InitCreep(): void {
        this.creepMemory = this.CreateCreepData();
    }

    CreateCreepData() {
        Swarmlord.CreateNewStorageMemory(this.name, [Swarmlord.StorageMemoryTypeToString(StorageMemoryType.Creep)], StorageMemoryType.Creep);
        let newMem = Swarmlord.CheckoutMemory<CreepData, CreepMemory>(this.name, [Swarmlord.StorageMemoryTypeToString(StorageMemoryType.Creep)], StorageMemoryType.Creep);
        return newMem;
    }

    ReceiveCommand() {

    }

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
        throw "This should be allowed only once it has been properly integrated";
    }
    get name() { return this._instance.name; }
    get saying() { return this._instance.hits; }
    get spawning() { return this._instance.hits; }
    get ticksToLive() { return this._instance.ticksToLive; }

    /**
     * Prototype methods
     * 
     */
    Attack(target: Creep | Structure) { // ActionIntent
        return this._instance.attack(target);
    }
    AttackController(target: StructureController) { // ActionIntent
        return this._instance.attackController(target);
    }
    Build(target: ConstructionSite) { // ActionIntent
        return this._instance.build(target);
    }
    CancelOrder(methodName: string) { // ActionIntent
        return this._instance.cancelOrder(methodName);
    }
    ClaimController(target: StructureController) { // ActionIntent
        return this._instance.claimController(target);
    }
    Dismantle(target: Structure) { // ActionIntent
        return this._instance.dismantle(target);
    }
    Drop(resourceType: ResourceConstant, amount?: number) { // ActionIntent
        return this._instance.drop(resourceType, amount);
    }
    GenerateSafeMode(target: StructureController) { // ActionIntent
        return this._instance.generateSafeMode(target);
    }
    GetActiveBodyparts(bodyPart: BodyPartConstant) {
        return this._instance.getActiveBodyparts(bodyPart);
    }
    Harvest(target: Source) { // ActionIntent
        return this._instance.harvest(target);
    }
    Heal(target: Creep) { // ActionIntent
        return this._instance.heal(target);
    }
    Move(direction: DirectionConstant) { // ActionIntent
        return this._instance.move(direction);
    }
    MoveByPath(path: PathStep[]) { // ActionIntent
        return this._instance.moveByPath(path);
    }
    MoveTo(x: number, y: number, opts: MoveToOpts) { // High CPU Cost
        return this._instance.moveTo(x, y, opts);
    }
    Pickup(target: Resource) { // ActionIntent
        return this._instance.pickup(target);
    }
    RangedAttack(target: Creep | Structure) { // ActionIntent
        return this._instance.rangedAttack(target);
    }
    RangedHeal(target: Creep) { // ActionIntent
        return this._instance.rangedHeal(target);
    }
    RangedMassAttack() { // ActionIntent
        return this._instance.rangedMassAttack();
    }
    Repair(target: Structure) { // ActionIntent
        return this._instance.repair(target);
    }
    ReserveController(target: StructureController) { // ActionIntent
        return this._instance.reserveController(target);
    }
    Say(message: string) {
        return this._instance.say(message);
    }
    SignController(target: StructureController, message: string) { // ActionIntent
        return this._instance.signController(target, message);
    }
    Suicide() { // ActionIntent
        return this._instance.suicide()
    }
    Transfer(target: Creep | Structure, resourceType: ResourceConstant, amount?: number) { // ActionIntent
        return this._instance.transfer(target, resourceType, amount);
    }
    UpgradeController(target: StructureController) { // ActionIntent
        return this._instance.upgradeController(target);
    }
    Withdraw(target: StructureContainer | StructureStorage | StructureTerminal,
        resourceType: ResourceConstant, amount?: number) { // ActionIntent
        return this._instance.withdraw(target, resourceType, amount);
    }
}