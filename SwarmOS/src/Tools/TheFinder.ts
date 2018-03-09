export function FindStructureNextTo(position: RoomPosition, structureType: string, opts?: { [id: string]: any }) {
    let room = Game.rooms[position.roomName];
    if (!room) { throw 'Attempting to find a ' + LOOK_STRUCTURES + ' next to a position in ' + position.roomName + ', which we do not have access to' };
    let distance = opts ? opts['distance'] || 1 : 1;
    let lookResult = room.lookForAtArea(LOOK_STRUCTURES, position.y - distance, position.x - distance, position.y + distance, position.x + distance, true);
    let shape = opts ? opts['shape'] || 'square' : 'square';

    let filter;
    switch (shape) {
        case ('square'):
        default:
            filter = function (a: LookForAtAreaResultWithPos<Structure | undefined, "structure">) {
                return a.structure ? a.structure.structureType == structureType : false;
            };
            break;
    }

    return lookResult.filter(filter) as LookForAtAreaResultWithPos<Structure, "structure">[];
}

export function FindNextTo(position: RoomPosition, lookConstant: LookConstant, opts?: { [id: string]: any }) {
    let room = Game.rooms[position.roomName];
    if (!room) { throw 'Attempting to find a ' + lookConstant + ' next to a position in ' + position.roomName + ', which we do not have access to' };
    let distance = opts ? opts['distance'] || 1 : 1;
    let lookResult = room.lookForAtArea(lookConstant, position.y - distance, position.x - distance, position.y + distance, position.x + distance, true);

    return lookResult;
}