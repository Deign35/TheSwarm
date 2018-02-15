/*import { HiveQueen } from "Managers/HiveQueen";
import { OverseerBase } from "./OverseerBase";

const ROUTE_MAP = 'RM';
export class RoutingOverseer extends OverseerBase { // One per room for sure.
    RouteMap: any;
    Save() {
        this.SetData(ROUTE_MAP, this.RouteMap);
        super.Save();
    }
    Load() {
        super.Load();
        this.RouteMap = this.GetData(ROUTE_MAP);
    }
    ValidateOverseer(): void {
        throw new Error("Method not implemented.");
    }
    HasResources(): boolean {
        throw new Error("Method not implemented.");
    }
    AssignCreep(creepName: string): void {
        throw new Error("Method not implemented.");
    }
    ActivateOverseer(): void {
        throw new Error("Method not implemented.");
    }
    ReleaseCreep(name: string, releaseReason: string): void {
        throw new Error("Method not implemented.");
    }
    AssignOrder(orderID: string): boolean {
        throw new Error("Method not implemented.");
    }
    // Routing Overseer can handle repairs.

    CreateRoute(fromPos: RoomPosition, toPos: RoomPosition) {

    }
}*/