import * as _ from "lodash"; // Compiler: IgnoreLinedfefwvg
import { RoleSweeper } from './sweeper';

export class RoleBuilder {
    static roleId: string = "builder";
    static minBody = [WORK, MOVE, CARRY];
    static desiredBody: BodyPartConstant[] = [WORK, WORK, WORK, WORK, // need to reorg desired body
        CARRY, CARRY, CARRY, CARRY, CARRY,
        CARRY, CARRY, CARRY, CARRY, CARRY,
        MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE];
    static maxWorkers = 3;
    static storage = Game.getObjectById('5a4a2a803c7a852985513260') as StructureStorage;

    static GetSpawner(maxEnergy: number) {
        if(Memory['Roles']['buildTick'] > 10) {
            let sites = Game.rooms['E22N32'].find(FIND_MY_CONSTRUCTION_SITES);
            if(sites.length > 0) { // if any sites.
                Memory['Roles']['buildTick'] = 0;
                return 'Spawn2';
            }
        }
        Memory['Roles']['buildTick']++;
        return undefined;
    }

    static run(creep: Creep) {
        let hr = 0;
        if (creep.carry.energy == 0) {
            hr = creep.withdraw(this.storage, RESOURCE_ENERGY);
            if (hr == ERR_NOT_IN_RANGE) {
                hr = creep.moveTo(this.storage);
            } else if (hr != OK) {
                console.log('Withdraw failed with error: ' + hr);
            }
        } else {
            let targetCS = Game.getObjectById(creep.memory['CSTarget']) as ConstructionSite;
            if (!targetCS) {
                targetCS = creep.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES);
                if (!targetCS) {
                    creep.memory['role'] = RoleSweeper.roleId;
                    return RoleSweeper.run(creep);
                }
                creep.memory['RDTarget'] = targetCS.id;
            }

            hr = creep.build(targetCS);
            if (hr == ERR_NOT_IN_RANGE) {
                hr = creep.moveTo(targetCS);
            } else if (hr != OK) {
                console.log('Build failed with error: ' + hr);
            }
        }

        return hr;
    }
}