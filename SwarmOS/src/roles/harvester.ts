import { Role } from './roles';

export class RoleHarvester implements Role {
    desiredBody: BodyPartConstant[];
    maxWorkers: number;
    run(creep: Creep) {
        if (creep.memory && creep.memory['harvesting']) {
            
        }
        return OK;
    }
}