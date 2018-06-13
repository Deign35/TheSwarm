export const OSPackage: IPackage<SpawnRegistry_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(CJ_Harvest, Harvester);
    }
}
import { SoloJob } from "./SoloJob";

class Harvester extends SoloJob<HarvesterMemory> {
    @extensionInterface(EXT_RoomView)
    protected View!: IRoomDataExtension;
    RunThread(): ThreadState {
        let homeRoomData = this.View.GetRoomData(this.memory.rID)!;
        let provider = this.kernel.getProcessByPID(homeRoomData.activityPID);
        if (provider && provider['RoomJobCheckin']) {
            provider['RoomJobCheckin'](this.pkgName);
        }
        let creep = Game.creeps[this.memory.c!];
        if (creep && !creep.spawning && creep.ticksToLive! < 80) {
            delete this.memory.c;
            delete this.memory.a;
        }
        return super.RunThread();
    }

    protected GetNewSpawnID(): string {
        let targetRoom = Game.rooms[this.memory.rID];
        let spawnLevel = 0; // (TODO): Update this value based on if targetRoom is reserved
        if (targetRoom.energyCapacityAvailable >= CreepBodies.Harvester[2].cost) {
            spawnLevel = 2;
        } else if (targetRoom.energyCapacityAvailable >= CreepBodies.Harvester[1].cost) {
            spawnLevel = 1;
        } else {
            this.SpawnSupportHarvester();
            this.SpawnSupportHarvester();
        }
        return this.spawnRegistry.requestSpawn({
            l: spawnLevel,
            c: CT_Harvester,
            n: this.memory.rID + '_H' + this.memory.src.slice(-1),
            p: this.pid
        }, this.memory.rID, Priority_Medium, 3, {
                ct: CT_Harvester,
                lvl: spawnLevel,
                p: this.pid
            });
    }
    protected CreateCustomCreepActivity(creep: Creep): string | undefined {
        let targetRoom = Game.rooms[this.memory.rID];
        if (!targetRoom) {
            let path = creep.pos.findPathTo(new RoomPosition(25, 25, this.memory.rID), {
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

        let source = Game.getObjectById<Source>(this.memory.src)!;
        if (source.pos.getRangeTo(creep.pos) > 1) {
            return this.creepActivity.CreateNewCreepActivity({
                at: AT_MoveToPosition,
                c: creep.name,
                p: source.pos,
                a: 1
            }, this.pid);
        }

        if (source.energy > 0) {
            return this.creepActivity.CreateNewCreepActivity({
                t: source.id,
                at: AT_Harvest,
                c: creep.name,
                e: [ERR_FULL]
            }, this.pid);
        }
        let container = Game.getObjectById<StructureContainer | ConstructionSite>(this.memory.sup);
        if (creep.carry.energy > 0) {
            if (container) {
                if ((container as StructureContainer).hitsMax) {
                    if (((container as StructureContainer).hits + (REPAIR_POWER * creep.getActiveBodyparts(WORK))) <= (container as StructureContainer).hitsMax) {
                        return this.creepActivity.CreateNewCreepActivity({
                            at: AT_Repair,
                            c: creep.name,
                            t: container.id
                        }, this.pid)
                    }
                } else if ((container as ConstructionSite).progressTotal) {
                    return this.creepActivity.CreateNewCreepActivity({
                        at: AT_Build,
                        c: creep.name,
                        t: container.id
                    }, this.pid);
                } else {
                    delete this.memory.sup;
                }
            } else {
                let sites = creep.pos.lookFor(LOOK_CONSTRUCTION_SITES);
                if (sites && sites.length > 0) {

                } else {
                    creep.room.createConstructionSite(creep.pos, STRUCTURE_CONTAINER);
                    return this.creepActivity.CreateNewCreepActivity({
                        at: AT_Harvest,
                        c: creep.name,
                        t: source.id
                    }, this.pid);
                }
            }
        }

        return;
    }
    HandleNoActivity() {
        // Do Nothing;
    }

    SpawnSupportHarvester() {
        let sID = this.spawnRegistry.requestSpawn({
            c: CT_Harvester,
            l: 0,
            n: 'SH' + GetRandomIndex(primes_100),
            p: this.pid
        }, this.memory.rID, Priority_High, 1, {
                ct: CT_Harvester,
                lvl: 0,
                p: this.pid
            });

        let newSpawnActivityMem: SpawnActivity_Memory = {
            sID: sID,
            HC: 'SupportHarvesterHC'
        }
        let newPID = this.kernel.startProcess(SPKG_SpawnActivity, newSpawnActivityMem);
        this.kernel.setParent(newPID, this.pid);
    }

    // (TODO): Set this up to auto refresh itself by checking energyCapacity
    // Problem right now with this is not spawning them over and over (use the RoomBooter?)
    SupportHarvesterHC(creepID: CreepID) {
        let newMem: RepetitiveCreepActivity_Memory = {
            a: [{
                at: AT_Harvest,
                e: [ERR_FULL, ERR_NOT_ENOUGH_ENERGY],
                t: this.memory.src,
            }],
            c: creepID,
        }

        let newPID = this.kernel.startProcess(SPKG_RepetitiveCreepActivity, newMem);
        this.kernel.setParent(newPID, this.pid);
    }
}