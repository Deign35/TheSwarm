import { ActionWithTarget } from "Actions/ActionBase";
import * as SwarmEnums from "SwarmEnums";
import * as _ from "lodash";

export class WithdrawAction extends ActionWithTarget<Structure> {
    constructor(creep: Creep, target: Structure, protected ResourceType: ResourceConstant = RESOURCE_ENERGY, protected Amount: number = 0) {
        super(creep, target);
        if (Amount == 0) {
            Amount = creep.carry[ResourceType];
        }
    }
    protected ActionImplemented(): SwarmEnums.CommandResponseType {
        let carryCapacity = this.AssignedCreep.carryCapacity - _.sum(this.AssignedCreep.carry);
        let targetAllows = 0;
        if ((this.Target as StructureContainer).storeCapacity) {
            targetAllows = (this.Target as StructureContainer).store[this.ResourceType];
        } else if ((this.Target as StructureExtension).energyCapacity) {
            targetAllows = (this.Target as StructureExtension).energy;
        }

        let amount = Math.min(carryCapacity, targetAllows);
        let result = this.AssignedCreep.withdraw(this.Target, this.ResourceType, amount);
        let actionResponse: SwarmEnums.CommandResponseType = SwarmEnums.CRT_None;
        switch (result) {
            case (OK): actionResponse = SwarmEnums.CRT_Condition_Full; break;
            //case(ERR_NOT_OWNER): Not the owner of this object.
            //case(ERR_BUSY): Creep is still being spawned.
            case (ERR_NOT_ENOUGH_RESOURCES): actionResponse = SwarmEnums.CRT_NewTarget; break;
            //case(ERR_INVALID_TARGET): Target is not a valid constructionsite.
            case (ERR_FULL): actionResponse = SwarmEnums.CRT_Next; break;
            case (ERR_NOT_IN_RANGE): actionResponse = SwarmEnums.CRT_Move; break;
            //case(ERR_INVALID_ARGS): The resources amount or type is incorrect.
        }

        return actionResponse;
    }
    ValidateAction(): SwarmEnums.CommandResponseType {
        let validationResult = SwarmEnums.CRT_None as SwarmEnums.CommandResponseType;
        if (_.sum(this.AssignedCreep.carry) == this.AssignedCreep.carryCapacity) {
            validationResult = SwarmEnums.CRT_Next;
        } else if ((this.Target as StructureSpawn).energyCapacity) {
            if ((this.Target as StructureSpawn).energy == 0) {
                validationResult = SwarmEnums.CRT_NewTarget;
            }
        } else if ((this.Target as StructureContainer).storeCapacity) {
            if (!(this.Target as StructureContainer).store[this.ResourceType]) {
                validationResult = SwarmEnums.CRT_NewTarget;
            }
        }
        return validationResult;
    }
}