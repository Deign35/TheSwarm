import * as _ from "lodash"; // Compiler: IgnoreLine

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
        if(Memory['Roles']['buildTick'] > 15) { // Check every few ticks
            let sites = Game.rooms['E22N32'].find(FIND_MY_CONSTRUCTION_SITES);
            if(sites.length > 0) { // if any sites.
                Memory['Roles']['buildTick'] = 0;
                return 'Spawn2';
            }
        }
        Memory['Roles']['buildTick']++;
        return undefined;
    }

    static GetTarget(creep: Creep): RoomObject | undefined {
        if (creep.memory['building'] && creep.carry.energy == 0) {
            delete creep.memory['building'];
            delete creep.memory['movePath'];
        }
        let target: RoomObject = this.storage;
        if(creep.carry.energy != 0) {
            let targetCS = Game.getObjectById(creep.memory['CSTarget']) as ConstructionSite;
            if (!targetCS) {
                targetCS = creep.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES);
                if (!target) {
                    return undefined;
                }
                creep.memory['CSTarget'] = targetCS.id;
            }
        }

        return target;
    }

    static run(creep: Creep) {
        let hr = 0;
        let target = this.GetTarget(creep);
        if (!creep.memory['building']) {
            hr = creep.withdraw(target, RESOURCE_ENERGY);
            if(hr == OK) {
                creep.memory['building'] = true;
                delete creep.memory['movePath'];
            }
        } else if(target) {
            hr = creep.build(target);
        } else {
            delete creep.memory['building'];
            delete creep.memory['movePath'];
            delete creep.memory['CSTarget'];
            creep.memory['role'] = RoleDeliverer.roleId;
            hr = OK;
        }
        return hr;
    }
}