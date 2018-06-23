import { RoomStateActivity } from "./RoomStateActivities";

class RoomEnergyMonitor extends RoomStateActivity<RoomEnergyMonitor_Memory> {
    protected get room(): Room {
        return super.room!;
    }

    RunThread(): ThreadState {

        return ThreadState_Done;
    }
}

declare interface RoomEnergyState {
    withdraw: { [id in ObjectID]: RoomEnergyNode };
    transfer: { [id in ObjectID]: RoomEnergyNode };

    paths: RoomEnergyPath[];
}
declare interface RoomEnergyNode {
    x: number;
    y: number;
    res: number;    // Reserved amount for this node and can only be withdrawn for a single action.
    exp: number;    // Number currently being delivered.
    amt: number;    // Amount in the node.
}

declare interface RoomEnergyPath {
    wNode: RoomEnergyNode;
    tNode: RoomEnergyNode;
    path: PathStep[];
}

declare interface RoomEnergyRequest {
    x: number;
    y: number;
    amt: number;
    pid?: PID;
}