import * as SwarmCodes from "Consts/SwarmCodes";
import * as _ from "lodash";
import { ActionWithTarget } from "Actions/ActionBase";

declare type TransferTargetType = Creep | Structure;
export class TransferAction extends ActionWithTarget<TransferTargetType> {
    static SimultaneousActionValue = 0;
    protected get BlockValue() { return TransferAction.SimultaneousActionValue; }
    protected get EnergyBlockValue() { return 5; }
    constructor(creep: Creep, target: Creep | Structure, protected ResourceType: ResourceConstant = RESOURCE_ENERGY, protected Amount?: number) {
        super(creep, target);
        //Amount unused.
    }
    ActionImplemented(): SwarmCodes.SwarmlingResponse {
        let carryAmount = this.AssignedCreep.carry[this.ResourceType] || 0;
        let targetAllows = 0;
        if ((this.Target as StructureContainer).storeCapacity) {
            targetAllows = (this.Target as StructureContainer).storeCapacity - _.sum((this.Target as StructureContainer).store);
        } else if ((this.Target as Creep).carryCapacity) {
            targetAllows = (this.Target as Creep).carryCapacity - _.sum((this.Target as Creep).carry);
        } else if ((this.Target as StructureExtension).energyCapacity) {
            targetAllows = (this.Target as StructureExtension).energyCapacity - (this.Target as StructureExtension).energy;
        }

        let amount = Math.min(carryAmount, targetAllows);
        let result = this.AssignedCreep.transfer(this.Target, this.ResourceType, amount);
        let actionResponse: SwarmCodes.SwarmlingResponse = SwarmCodes.C_NONE;
        switch (result) {
            case (OK): actionResponse = SwarmCodes.C_NONE; break;
            //case(ERR_NOT_OWNER): Not the owner of this object.
            //case(ERR_BUSY): Creep is still being spawned.
            case (ERR_NOT_ENOUGH_RESOURCES): actionResponse = SwarmCodes.E_ACTION_UNNECESSARY; break;
            //case(ERR_INVALID_TARGET): Target is not a valid transfer object.
            case (ERR_FULL): actionResponse = SwarmCodes.E_TARGET_INELLIGIBLE; break;
            case (ERR_NOT_IN_RANGE): actionResponse = SwarmCodes.C_MOVE; break;
            //case(ERR_INVALID_ARGS): The resources amount is incorrect.
            default: console.log('FAILED ACTION[TransferAction] -- ' + result);
        }

        return actionResponse;
    }

    ValidateAction() {
        let result: SwarmCodes.SwarmlingResponse = SwarmCodes.C_NONE;
        if (_.sum(this.AssignedCreep.carry) == 0) {
            result = SwarmCodes.E_ACTION_UNNECESSARY;
        } else if ((this.Target as Creep).carryCapacity) {
            let creepCarry = _.sum((this.Target as Creep).carry);
            if (creepCarry == (this.Target as Creep).carryCapacity) {
                result = SwarmCodes.E_TARGET_INELLIGIBLE;
            }
        } else if (this.ResourceType == RESOURCE_ENERGY && (this.Target as StructureExtension).energyCapacity) {
            if ((this.Target as StructureExtension).energy == (this.Target as StructureExtension).energyCapacity) {
                result = SwarmCodes.E_TARGET_INELLIGIBLE;
            }
        } else if ((this.Target as StructureContainer).storeCapacity) {
            let storeCarry = _.sum((this.Target as StructureContainer).store);
            if (storeCarry == (this.Target as StructureContainer).storeCapacity) {
                result = SwarmCodes.E_TARGET_INELLIGIBLE;
            }
        } else {
            console.log('SHOULD NOT BE HERE');
            console.log('this.Target: ' + JSON.stringify(this.Target));
            result = SwarmCodes.E_INVALID;
        }

        if (result == SwarmCodes.C_NONE) {
            if (!this.AssignedCreep.pos.isNearTo(this.Target)) {
                return SwarmCodes.C_MOVE;
            }
        }
        return result;
    }
}