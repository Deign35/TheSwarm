export const OSPackage: IPackage<SpawnRegistry_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(CJ_Harvest, Harvester);
    }
}
import { SoloJob } from "./SoloJob";

class Harvester extends SoloJob<HarvesterMemory> {
    protected GetNewSpawnID(): string {
        return this.spawnRegistry.requestSpawn({
            l: this.memory.spLvl,
            c: CT_Harvester,
            n: (this.memory.src + '_Ha').slice(-6),
            p: this.pid
        }, this.memory.home, Priority_Lowest, 1, {
                ct: CT_Harvester,
                lvl: this.memory.spLvl,
                p: this.pid
            });
    }
    protected CreateCustomCreepActivity(creep: Creep): string | undefined {
        if (this.memory.helper && this.homeRoom.energyCapacityAvailable >= CreepBodies.Harvester[1].cost) {
            return;
        }
        if (creep.room.name != this.memory.rID) {
            let map = Game.map.findRoute(creep.room.name, this.memory.rID);
            let nextRoom = this.memory.home;
            if (map == ERR_NO_PATH) {
                delete this.memory.rID
                return this.creepActivity.CreateNewCreepActivity({
                    at: AT_MoveToPosition,
                    p: creep.pos,
                    c: creep.name
                }, this.pid);
            }
            if (map && map.length > 0) {
                nextRoom = map[0].room;
            }
            let path = creep.pos.findPathTo(new RoomPosition(25, 25, nextRoom), {
                ignoreCreeps: true
            });
            let lastPosition = path[path.length - 1];
            if (!lastPosition) {
                delete this.memory.rID
                return this.creepActivity.CreateNewCreepActivity({
                    at: AT_MoveToPosition,
                    p: creep.pos,
                    c: creep.name
                }, this.pid);
            }

            return this.creepActivity.CreateNewCreepActivity({
                at: AT_MoveToPosition,
                c: creep.name,
                p: { x: lastPosition.x, y: lastPosition.y, roomName: creep.room.name }
            }, this.pid);
        }

        let source = Game.getObjectById(this.memory.src) as Source;
        let moveTarget = Game.getObjectById<ConstructionSite | StructureContainer>(this.memory.supStr);
        if (!this.memory.helper && (!moveTarget || (moveTarget as ConstructionSite).progressTotal)) {
            // Convert this to a builderHarvester?
        }

        if (!this.memory.helper && moveTarget && !creep.pos.isEqualTo(moveTarget.pos)) {
            return this.creepActivity.CreateNewCreepActivity({
                at: AT_MoveToPosition,
                p: moveTarget.pos,
                c: creep.name,
            }, this.pid);
        }

        return this.creepActivity.CreateNewCreepActivity({
            at: AT_Harvest,
            c: creep.name,
            HC: 'HarvestSourceActivity',
            t: this.memory.src,
            e: [ERR_FULL, ERR_NOT_ENOUGH_RESOURCES],
        }, this.pid);
    }
}