import { SwarmMemory } from "Memory/SwarmMemory";
import * as SwarmEnums from "SwarmEnums";
import * as _ from "lodash";
/**
        this.ValidateOverseer(); */
const ASSIGNED_CREEPS = 'AC';
export abstract class OverseerBase extends SwarmMemory {
    protected AssignedCreeps: { [name: string]: Creep }
    protected _registry: IOverseer_Registry;
    protected get Registry(): IOverseer_Registry {
        if (!this.registryInit) {
            this.registryInit = true;
            this._registry = this.InitOverseerRegistry();
        }
        return this._registry;
    }
    private registryInit = false;

    Save() {
        let AssignedCreeps = [];
        for (let index in this.AssignedCreeps) {
            AssignedCreeps.push(this.AssignedCreeps[index].id);
        }
        this.SetData(ASSIGNED_CREEPS, AssignedCreeps);
        super.Save();
    }
    Load() {
        super.Load();
        let AssignedCreeps = this.GetData(ASSIGNED_CREEPS) || [];
        for (let index in AssignedCreeps) {
            let foundCreep = Game.getObjectById(AssignedCreeps[index]);
            if (foundCreep) {
                this.AssignCreep(foundCreep as Creep);
            } else {
                this.ReleaseCreep(AssignedCreeps[index]);
            }
        }
    }
    static CreateEmptyOverseerRegistry(): IOverseer_Registry {
        return {
            Available: {
                Resources: []
            },
            Requirements: {
                Creeps: [],
                Resources: []
            }
        }
    };
    protected abstract InitOverseerRegistry(): IOverseer_Registry;

    abstract HasResources(): IOverseerAvailable[];
    GetAvailableResources(): IOverseerData_Resource[] {
        return this.Registry.Available.Resources;
    }
    abstract HasRequirements(): boolean;
    GetRequirements(): IOverseerRequirements {
        return this.Registry.Requirements;
    }

    AssignCreep(creep: Creep) {
        this.AssignedCreeps[creep.id] = creep;
    }
    GenericActionResponse(response: SwarmEnums.CommandResponseType, creep: Creep, targetPos: RoomPosition): SwarmEnums.CommandResponseType {
        let result = SwarmEnums.CRT_None as SwarmEnums.CommandResponseType;

        switch (response) {
            case (SwarmEnums.CRT_Condition_Full): result = (_.sum(creep.carry) == creep.carryCapacity) ? SwarmEnums.CRT_Next : SwarmEnums.CRT_None;
            case (SwarmEnums.CRT_Condition_Empty): result = (_.sum(creep.carry) == 0) ? SwarmEnums.CRT_Next : SwarmEnums.CRT_None;
            case (SwarmEnums.CRT_Move): creep.moveTo(targetPos); break;
            case (SwarmEnums.CRT_NewTarget):
            case (SwarmEnums.CRT_Next):
            case (SwarmEnums.CRT_None):
            default:
                result = response; break;

        }
        return result;
    }
    abstract ValidateOverseer(): SwarmEnums.CommandResponseType;
    abstract ActivateOverseer(): SwarmEnums.CommandResponseType;
    abstract ReleaseCreep(releaseReason: string): any;
}