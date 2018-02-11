import * as SwarmEnums from "SwarmEnums";
import * as _ from "lodash";
import { ActionWithTarget } from "Actions/ActionBase";

export class TransferAction extends ActionWithTarget<Creep | Structure> {
    constructor(creep: Creep, target: Creep | Structure, protected ResourceType: ResourceConstant = RESOURCE_ENERGY, protected Amount?: number) {
        super(creep, target);
    }
    ActionImplemented() {
        let result = this.AssignedCreep.transfer(this.Target, this.ResourceType, this.Amount);
        let actionResponse: SwarmEnums.CommandResponseType = SwarmEnums.CRT_None;
        switch(result) {
            case(OK): actionResponse = SwarmEnums.CRT_Condition_Empty; break;
            //case(ERR_NOT_OWNER): Not the owner of this object.
            //case(ERR_BUSY): Creep is still being spawned.
            case(ERR_NOT_ENOUGH_RESOURCES): actionResponse = SwarmEnums.CRT_Next; break;
            //case(ERR_INVALID_TARGET): Target is not a valid transfer object.
            case(ERR_FULL): actionResponse = SwarmEnums.CRT_NewTarget; break;
            case(ERR_NOT_IN_RANGE): actionResponse = SwarmEnums.CRT_Move; break;
            //case(ERR_INVALID_ARGS): The resources amount is incorrect.
        }

        return actionResponse;
    }

    ValidateAction() {
        let result = SwarmEnums.CRT_None;
        if(_.sum(this.AssignedCreep.carry) == this.AssignedCreep.carryCapacity) {
            result = SwarmEnums.CRT_Next;
        } else if((this.Target as Creep).carry) {
            let creepCarry = _.sum((this.Target as Creep).carry);
            if(creepCarry == (this.Target as Creep).carryCapacity) {
                result = SwarmEnums.CRT_NewTarget;
            }
        }
        else if(this.ResourceType == RESOURCE_ENERGY && (this.Target as StructureExtension).energy) {
            if((this.Target as StructureExtension).energy == (this.Target as StructureExtension).energyCapacity) {
                result = SwarmEnums.CRT_NewTarget;
            }
        } else if((this.Target as StructureContainer).store) {
            let storeCarry = _.sum((this.Target as StructureContainer).store);
            if(storeCarry == (this.Target as StructureContainer).storeCapacity){
                result = SwarmEnums.CRT_NewTarget;
            }
        } else {
            console.log('SHOULD NOT BE HERE');
            console.log('this.Target: ' + JSON.stringify(this.Target));
            result = SwarmEnums.CRT_Next;
        }
        return result as SwarmEnums.CommandResponseType;
    }
}