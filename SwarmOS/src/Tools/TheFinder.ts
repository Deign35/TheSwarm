export function FindStructureNextTo(position: RoomPosition, structureType: string, opts?: { [id: string]: any }) {
  const room = Game.rooms[position.roomName];
  if (!room) { throw 'Attempting to find a ' + LOOK_STRUCTURES + ' next to a position in ' + position.roomName + ', which we do not have access to' };
  const distance = opts ? opts['distance'] || 1 : 1;
  const lookResult = room.lookForAtArea(LOOK_STRUCTURES, position.y - distance, position.x - distance, position.y + distance, position.x + distance, true);
  const shape = opts ? opts['shape'] || 'square' : 'square';

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
  const room = Game.rooms[position.roomName];
  if (!room) { throw 'Attempting to find a ' + lookConstant + ' next to a position in ' + position.roomName + ', which we do not have access to' };
  const distance = opts ? opts['distance'] || 1 : 1;
  const lookResult = room.lookForAtArea(lookConstant, position.y - distance, position.x - distance, position.y + distance, position.x + distance, true);

  return lookResult;
}

declare type ExamineGround = (x: number, y: number, terrain: number) => void;
export function LookAtGround(roomID: RoomID, positionTopLeft: RoomPosition, positionBottomRight: RoomPosition, func: ExamineGround) {
  if (Game.rooms[roomID]) {
    const terrain = Game.rooms[roomID].getTerrain();
    for (let x = positionTopLeft.x; x <= positionBottomRight.x; x++) {
      for (let y = positionTopLeft.y; y >= positionBottomRight.y; y--) {
        func(x, y, terrain.get(x, y));
      }
    }
  }
}