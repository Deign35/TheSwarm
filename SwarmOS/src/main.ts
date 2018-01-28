import { Role } from './roles/roles';

let creepPrototype: any = Creep.prototype;
if(!creepPrototype['_moveTo']) {
    creepPrototype['_moveTo'] = creepPrototype.moveTo;

    creepPrototype.moveTo = function(...args: any[]) {
        let pos: RoomPosition;
        let optsPos = 1;
        if(args.length == 3) {
            pos = new RoomPosition(args[0], args[1], this.room.name);
            optsPos = 2;
        } else {
            pos = args[0];
        }

        let options = args[optsPos];

        options['visualizePathStyle'] = {
            fill: 'transparent',
            stroke: '#fff',
            lineStyle: 'dashed',
            strokeWidth: .15,
            opacity: .1
        }
        this._moveTo(pos, options);
    }
}
const MainRoom = Game.rooms[Memory.MainRoom];
export const loop = function () {
    for(let name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
        }
    }

    let hostiles = MainRoom.find(FIND_HOSTILE_CREEPS);
    if(hostiles.length > 0) {
        towersAttack(hostiles[0]);
    }

    LinkTransfer();
    Role.trySpawn();
    for(let name in Memory.creeps) {
        let creep = Game.creeps[name];
        if(!creep) {
            delete Memory.creeps[name];
            continue;
        }

        Role.run(creep);
    }
}

const towersAttack = function(hostile: Creep) {
    let towers = MainRoom.find(FIND_STRUCTURES, {
        filter: function(structure) {
            return structure.structureType == STRUCTURE_TOWER;
        }
    }) as StructureTower[];

    for(let tower of towers) {
        tower.attack(hostile);
    }
}

const link1 = Game.getObjectById('5a33ad5609329d0b1cdcd9e4') as StructureLink;
const link2 = Game.getObjectById('5a49dd7442f5c9030aa46389') as StructureLink;
const link3 = Game.getObjectById('5a3a668823a1f6774fc58ac3') as StructureLink;
const link4 = Game.getObjectById('5a681644f6909e2eba20b8f9') as StructureLink;
const LinkTransfer = function() {
    if(link1.energy > 100) {
        link1.transferEnergy(link4);
    }
    if(link3.energy > 100) {
        link3.transferEnergy(link4);
    }

    if(link4.energy > 0) {
        link4.transferEnergy(link2);
    }
}