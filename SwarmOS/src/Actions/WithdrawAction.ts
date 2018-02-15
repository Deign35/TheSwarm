import { ActionWithTarget } from "Actions/ActionBase";
import * as SwarmCodes from "Consts/SwarmCodes";
import * as _ from "lodash";

declare type WithdrawTargetType = StructureContainer | StructureExtension | StructureSpawn | StructureLab | StructureLink |
    StructureStorage | StructureTower;
export class WithdrawAction extends ActionWithTarget<WithdrawTargetType> {
    static SimultaneousActionValue = 0;
    protected get BlockValue() { return WithdrawAction.SimultaneousActionValue; }
    protected get EnergyBlockValue() { return 4; }
    constructor(creep: Creep, target: WithdrawTargetType, protected ResourceType: ResourceConstant = RESOURCE_ENERGY, protected Amount: number = 0) {
        super(creep, target);
        if (Amount == 0) {
            Amount = creep.carry[ResourceType] || 0;
        }
    }
    protected ActionImplemented(): SwarmCodes.SwarmlingResponse {
        let carryCapacity = this.AssignedCreep.carryCapacity - _.sum(this.AssignedCreep.carry);
        let targetAllows = 0;
        if ((this.Target as StructureContainer).storeCapacity) {
            targetAllows = (this.Target as StructureContainer).store[this.ResourceType] || 0;
        } else if ((this.Target as StructureExtension).energyCapacity) {
            targetAllows = (this.Target as StructureExtension).energy;
        }

        let amount = Math.min(carryCapacity, targetAllows);
        let result = this.AssignedCreep.withdraw(this.Target, this.ResourceType, amount);
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
            default: console.log('FAILED ACTION[AttackAction] -- ' + result);
        }

        return actionResponse;
    }
    ValidateAction(): SwarmCodes.SwarmlingResponse {
        let validationResult = SwarmCodes.C_NONE as SwarmCodes.SwarmlingResponse;
        if (_.sum(this.AssignedCreep.carry) == this.AssignedCreep.carryCapacity) {
            validationResult = SwarmCodes.E_ACTION_UNNECESSARY;
        } else if ((this.Target as StructureSpawn).energyCapacity) {
            if ((this.Target as StructureSpawn).energy == 0) {
                validationResult = SwarmCodes.E_TARGET_INELLIGIBLE;
            }
        } else if ((this.Target as StructureContainer).storeCapacity) {
            if (!(this.Target as StructureContainer).store[this.ResourceType]) {
                validationResult = SwarmCodes.E_TARGET_INELLIGIBLE;
            }
        }
        return validationResult;
    }
}