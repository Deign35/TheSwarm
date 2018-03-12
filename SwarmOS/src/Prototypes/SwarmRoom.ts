import { SwarmItem } from "Prototypes/SwarmObject";

export class SwarmRoom extends SwarmItem<Room> {
    get RoomLocation(): RoomLocationFormat {
        return this.name;
    }
    get controller(): StructureController | undefined {
        return this._instance.controller;
    }
    get energyAvailable(): number {
        return 0;
    }
    get energyAvailableCapacity(): number {
        return 0;
    }
    get name(): string {
        return this._instance.name.slice();
    }
    get storage(): StructureStorage | undefined {
        return this._instance.storage;
    }
    get terminal(): StructureTerminal | undefined {
        return this._instance.terminal;
    }
    get visual(): RoomVisual {
        return this._instance.visual;
    }

    createConstructionSite(pos: RoomPosition, structureType: StructureConstant, name?: string) {
        return this._instance.createConstructionSite(pos, structureType, name);
    }
    createFlag(pos: RoomPosition, color?: ColorConstant, secondaryColor?: ColorConstant, name?: string, ) {
        return this._instance.createFlag(pos, name, color, secondaryColor);
    }
    find<T extends FindConstant>(type: T, opts?: FilterOptions<T>) {
        return this._instance.find(type, opts);
    }
    findExitTo(otherRoom: SwarmRoom) {
        this._instance.findExitTo(otherRoom._instance);
    }
    findPath(fromPos: RoomPosition, toPos: RoomPosition, opts?: FindPathOpts) {
        this._instance.findPath(fromPos, toPos, opts);
    }
    getPositionAt(x: number, y: number) {
        return this._instance.getPositionAt(x, y);
    }
    lookAt(targetPos: RoomPosition) {
        return this._instance.lookAt(targetPos);
    }
    lookAtArea(top: number, left: number, bottom: number, right: number, asArray: boolean = false) {
        return this._instance.lookAtArea(top, left, bottom, right, asArray);
    }
    lookForAt<T extends LookConstant>(type: T, pos: RoomPosition) {
        return this._instance.lookForAt(type, pos);
    }
    lookForAtArea<T extends LookConstant>(type: T, top: number,
        left: number, bottom: number, right: number, asArray: boolean = false) {
        if (asArray) { // Due to how lookForAtArea is set up in TS, this is the simplest way to get rid of the error.
            return this._instance.lookForAtArea<T>(type, top, left, bottom, right, true);
        } else {
            return this._instance.lookForAtArea<T>(type, top, left, bottom, right, false);
        }
    }
}
declare type RoomLocationFormat = string;