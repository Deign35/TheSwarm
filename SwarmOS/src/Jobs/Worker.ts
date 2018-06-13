export const OSPackage: IPackage<SpawnRegistry_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(CJ_Work, WorkerActivity);
    }
}
import { SoloJob } from "./SoloJob";

class WorkerActivity extends SoloJob<Worker_Memory> {
    @extensionInterface(EXT_RoomView)
    protected View!: IRoomDataExtension;

    private hasRun!: boolean;
    private hasNotified!: boolean;
    private _roomData!: RoomState;
    protected get roomData() {
        return this._roomData;
    }
    RunThread(): ThreadState {
        if (!this.hasNotified) {
            let provider = this.kernel.getProcessByPID(this.roomData.activityPID);
            if (provider && provider['RoomJobCheckin']) {
                provider['RoomJobCheckin'](this.pkgName);
            }
            this.hasNotified = true;
        }
        this.hasRun = true;
        super.RunThread();
        if (this.hasRun) {
            return ThreadState_Done;
        }

        this.hasRun = false;
        return ThreadState_Waiting;
    }

    PrepTick() {
        this.hasRun = false;
        this.hasNotified = false;
        this._roomData = this.View.GetRoomData(this.memory.rID)!;
    }

    protected GetNewSpawnID(): string {
        let targetRoom = Game.rooms[this.memory.tr];
        let homeRoom = Game.rooms[this.memory.rID];

        let spawnLevel = 0;
        let energyCapacity = homeRoom.energyCapacityAvailable;
        for (let i = 3; i > 0; i--) {
            if (energyCapacity >= CreepBodies.Worker[i].cost) {
                spawnLevel = i;
                break;
            }
        }
        return this.spawnRegistry.requestSpawn({
            l: spawnLevel,
            c: CT_Worker,
            n: this.memory.rID + (Game.time + '_WR').slice(-6),
            p: this.pid
        }, this.memory.rID, Priority_Low, 3, {
                ct: CT_Worker,
                lvl: spawnLevel,
                p: this.pid
            });
    }
    protected CreateCustomCreepActivity(creep: Creep): string | undefined {
        let targetRoom = Game.rooms[this.memory.tr];
        if (!targetRoom) {
            let path = creep.pos.findPathTo(new RoomPosition(25, 25, this.memory.tr), {
                ignoreCreeps: true,
                ignoreRoads: true
            });
            let lastPosition = path[path.length - 1];
            if (!lastPosition) {
                throw new Error(`Remote Harvester attempted to find a path to the next room, but failed`);
            }

            return this.creepActivity.CreateNewCreepActivity({
                at: AT_MoveToPosition,
                c: creep.name,
                p: { x: lastPosition.x, y: lastPosition.y, roomName: creep.room.name }
            }, this.pid);
        }

        let carryRatio = _.sum(creep.carry) / creep.carryCapacity;
        let roomData = this.View.GetRoomData(creep.room.name)!;
        if (roomData.targets.Other.t != TT_None && roomData.targets.Other.at != AT_NoOp) {
            let isValidTarget = false;
            if (roomData.targets.Other.en == 0) {
                return;
            }
            if (roomData.targets.Other.en > creep.carryCapacity) {
                isValidTarget = carryRatio > 0.25;
            }
            if (roomData.targets.Other.en <= creep.carryCapacity) {
                isValidTarget = creep.carry.energy >= roomData.targets.Other.en;
            }
            if (isValidTarget) {
                let nextTarget = Game.getObjectById<ObjectTypeWithID>(roomData.targets.Other.target);
                if (nextTarget) {
                    let newActivity = this.creepActivity.CreateNewCreepActivity({
                        at: roomData.targets.Other.at,
                        c: creep.name,
                        t: nextTarget.id,
                    }, this.pid);
                    if (newActivity) {
                        roomData.targets.Other.en -= creep.carry.energy;
                        return newActivity;
                    }
                }
            } else if (carryRatio > 0.5) {
                return;
            }
        }

        // This means that 98 / 100 energy = go get more energy when current target is done.  Ok for some, but not for repairs if energy needed is 99
        // (TODO): Fix this. ^^^
        if (creep.carry.energy < creep.carryCapacity) {
            let targetIDs = Object.keys(roomData.targets.CR_Work.energy);
            for (let i = 0; i < targetIDs.length; i++) {
                roomData.targets.CR_Work.energy[targetIDs[i]];
            }
        }

        return undefined;
    }
    HandleNoActivity() {
        this.hasRun = false;
    }
}