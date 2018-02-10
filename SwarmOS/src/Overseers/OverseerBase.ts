import { SwarmMemory } from "Memory/SwarmMemory";
import * as SwarmEnums from "SwarmEnums";
import * as _ from "lodash";

const ASSIGNED_CREEPS = 'AC';
export abstract class OverseerBase extends SwarmMemory {
    protected AssignedCreeps: {[name: string]: Creep}
    Save() {
        let AssignedCreeps = [];
        for(let index in this.AssignedCreeps) {
            AssignedCreeps.push(this.AssignedCreeps[index].id);
        }
        this.SetData(ASSIGNED_CREEPS, AssignedCreeps);
        super.Save();
    }
    Load() {
        super.Load();
        let AssignedCreeps = this.GetData(ASSIGNED_CREEPS) || [];
        for(let index in AssignedCreeps) {
            let foundCreep = Game.getObjectById(AssignedCreeps[index]);
            if(foundCreep) {
                this.AssignCreep(foundCreep as Creep);
            }
        }
    }

    AssignCreep(creep: Creep) {
        this.AssignedCreeps[creep.id] = creep;
    }
    GenericActionResponse(response:  SwarmEnums.CommandResponseType, creep: Creep, targetPos: RoomPosition): SwarmEnums.CommandResponseType {
        let result = SwarmEnums.CRT_None as SwarmEnums.CommandResponseType;

        switch(response) {
            case(SwarmEnums.CRT_Condition_Full): result = (_.sum(creep.carry) == creep.carryCapacity) ? SwarmEnums.CRT_Next : SwarmEnums.CRT_None;
            case(SwarmEnums.CRT_Condition_Empty): result = (_.sum(creep.carry) == 0) ? SwarmEnums.CRT_Next : SwarmEnums.CRT_None;
            case(SwarmEnums.CRT_Move): creep.moveTo(targetPos); break;
            case(SwarmEnums.CRT_NewTarget):
            case(SwarmEnums.CRT_Next):
            case(SwarmEnums.CRT_None):
            default:
                result = response; break;

        }
        return result;
    }
    abstract ValidateOverseer(): SwarmEnums.CommandResponseType;
    abstract ActivateOverseer(): SwarmEnums.CommandResponseType;
    abstract GetRequirements(): any; // Use this to inform needs long before actually needed.
                                     // This means we can plan out spawns and resource requirements ahead of time!
    abstract GetAvailable(): any; // This could be for asking what the overseer has available to give out.
    abstract GetRequestedSpawnBody(): any;
}