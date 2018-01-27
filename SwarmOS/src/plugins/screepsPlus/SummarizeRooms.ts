import { RoomResources } from './RoomResources';
export function summarize_rooms() {
    const now = Game.time;

    // First check if we cached it
    if (global.summarized_room_timestamp == now) {
        return global.summarized_rooms;
    }

    let retval = {} as any;

    for (let r in Game.rooms) {
        let summary = new RoomResources(Game.rooms[r]);
        retval[r] = summary;
    }

    global.summarized_room_timestamp = now;
    global.summarized_rooms = retval;
} // summarize_rooms