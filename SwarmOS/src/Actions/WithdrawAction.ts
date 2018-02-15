import { ActionWithTarget } from "Actions/ActionBase";
import * as SwarmCodes from "Consts/SwarmCodes";
import * as _ from "lodash";

declare type WithdrawTargetType = WithdrawTypeStorage | WithdrawTypeEnergy | StructureLab;
declare type WithdrawTypeStorage = StructureContainer | StructureStorage;
declare type WithdrawTypeEnergy = StructureSpawn | StructureTower | StructureExtension | StructureLink

export class WithdrawAction extends ActionWithTarget<WithdrawTargetType> {
    static SimultaneousActionValue = 0;
    protected get BlockValue() { return WithdrawAction.SimultaneousActionValue; }
    protected get EnergyBlockValue() { return 4; }
    constructor(creep: Creep, target: WithdrawTargetType, protected ResourceType: ResourceConstant = RESOURCE_ENERGY, protected Amount: number = 0) {
        super(creep, target);
        let targetCarry: number = 0;
        if ((this.Target as WithdrawTypeStorage).storeCapacity) {
            targetCarry = (this.Target as WithdrawTypeStorage).store[ResourceType] || 0;
        } else if ((this.Target as WithdrawTypeEnergy).energyCapacity) {
            targetCarry = (this.Target as WithdrawTypeEnergy).energy || 0;
        } else if ((this.Target as StructureLab).mineralCapacity) {
            if (ResourceType == RESOURCE_ENERGY) {
                targetCarry = (this.Target as StructureLab).energy;
            } else {
                targetCarry = (this.Target as StructureLab).mineralAmount;
            }
        }
        if (Amount <= 0) {
            Amount = Math.min(targetCarry, creep.carryCapacity - _.sum(creep.carry));
        } else {
            Amount = Math.min(targetCarry, this.Amount);
        }
    }
    protected ActionImplemented(): SwarmCodes.SwarmlingResponse {
        let result = this.AssignedCreep.withdraw(this.Target, this.ResourceType, this.Amount);
        let actionResponse: SwarmCodes.SwarmlingResponse = SwarmCodes.C_NONE;
        switch (result) {
            case (OK): actionResponse = SwarmCodes.C_NONE; break;
            //case(ERR_NOT_OWNER): Not the owner of this object.
            //case(ERR_BUSY): Creep is still being spawned.
            case (ERR_NOT_ENOUGH_RESOURCES): actionResponse = SwarmCodes.E_TARGET_INELLIGIBLE; break;
            //case(ERR_INVALID_TARGET): Target is not a valid constructionsite.
            case (ERR_FULL): actionResponse = SwarmCodes.E_ACTION_UNNECESSARY; break;
            case (ERR_NOT_IN_RANGE): actionResponse = SwarmCodes.C_MOVE; break;
            //case(ERR_INVALID_ARGS): The resources amount or type is incorrect.
            default: console.log('FAILED ACTION[WithdrawAction] -- ' + result);
        }

        return actionResponse;
    }
    ValidateAction(): SwarmCodes.SwarmlingResponse {
        let validationResult = SwarmCodes.C_NONE as SwarmCodes.SwarmlingResponse;

        if (_.sum(this.AssignedCreep.carry) == this.AssignedCreep.carryCapacity) {
            validationResult = SwarmCodes.E_ACTION_UNNECESSARY;
        } else if ((this.Target as WithdrawTypeEnergy).energyCapacity) {
            if ((this.Target as WithdrawTypeEnergy).energy == 0) {
                validationResult = SwarmCodes.E_TARGET_INELLIGIBLE;
            }
        } else if ((this.Target as WithdrawTypeStorage).storeCapacity) {
            if (!(this.Target as WithdrawTypeStorage).store[this.ResourceType]) {
                validationResult = SwarmCodes.E_TARGET_INELLIGIBLE;
            }
        } else if ((this.Target as StructureLab)) {
            if (this.ResourceType == RESOURCE_ENERGY) {
                validationResult = (this.Target as StructureLab).energy > 0 ? SwarmCodes.C_NONE : SwarmCodes.E_TARGET_INELLIGIBLE;
            } else {
                if ((this.Target as StructureLab).mineralType != this.ResourceType) {
                    validationResult = SwarmCodes.E_TARGET_INELLIGIBLE;
                } else {
                    // Amount already verified by constructor.
                }
            }
        }
        return validationResult;
    }
}