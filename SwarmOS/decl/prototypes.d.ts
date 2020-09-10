interface Room {
  id: RoomID;
  SwarmOS: boolean;
}
interface Flag {
  id: FlagID;
  SwarmOS: boolean;
}

interface Creep {
  bodyCost: number;
  SwarmOS: boolean;
}

interface RoomPosition {
  SwarmOS: boolean;
  isEdge: () => boolean;
  isExit: () => boolean;
  getTerrain: () => number;
}