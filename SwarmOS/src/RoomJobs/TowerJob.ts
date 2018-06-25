export const OSPackage: IPackage<SpawnRegistry_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(RJ_Tower, TowerJob);
    }
}
import { BasicProcess } from "Core/BasicTypes";
import { RoomMonitorBase } from "./RoomMonitors";

class TowerJob extends RoomMonitorBase<RoomMonitor_Memory> {
    get room() {
        return Game.rooms[this.memory.rID];
    }
    get roomData() {
        return this.roomView.GetRoomData(this.memory.rID)!;
    }
    MonitorRoom(): ThreadState {
        let homeRoomData = this.roomView.GetRoomData(this.memory.rID)!;
        let provider = this.kernel.getProcessByPID(homeRoomData.activityPID);
        if (provider && provider['RoomJobCheckin']) {
            provider['RoomJobCheckin'](this.pkgName);
        }

        let towerIDs = this.roomData.structures.tower!;
        if (!towerIDs || towerIDs.length == 0) {
            this.EndProcess();
            return ThreadState_Done;
        }
        for (let i = 0; i < towerIDs.length; i++) {
            if (!homeRoomData.targets.CR_SpawnFill.targets[towerIDs[i]]) {
                homeRoomData.targets.CR_SpawnFill.targets[towerIDs[i]] = {
                    a: AT_Transfer,
                    p: Priority_High,
                    t: TT_StorageContainer
                }
            }
        }
        let otherCreeps = this.room.find(FIND_HOSTILE_CREEPS);
        if (otherCreeps.length == 0) {
            //this.sleeper.sleep(this.pid, 6);
            return ThreadState_Done;
        }

        // (TODO): Add in heal targets if there are hostiles.
        let hostiles = this.GetHostileTargets(otherCreeps);
        if (hostiles.length == 0) {
            //this.sleeper.sleep(this.pid, 6);
            return ThreadState_Done;
        }
        for (let i = 0; i < towerIDs.length; i++) {
            let tower = Game.getObjectById<StructureTower>(towerIDs[i])!;
            if (tower.energy > 0) {
                let closestCreep = 0
                let distance = tower.pos.getRangeTo(hostiles[closestCreep]);
                for (let j = 1; j < hostiles.length; j++) {
                    if (distance <= 5) {
                        break;
                    }
                    let dist = tower.pos.getRangeTo(hostiles[j]);
                    if (dist < distance) {
                        closestCreep = j;
                        distance = dist;
                    }
                }

                tower.attack(hostiles[closestCreep]);

                if (hostiles.length > 0) { // This works only because we kill the healers one at a time.
                    let damage = TOWER_POWER_ATTACK;
                    if (distance > TOWER_OPTIMAL_RANGE) {
                        if (distance > TOWER_FALLOFF_RANGE) {
                            distance = TOWER_FALLOFF_RANGE
                        }
                        damage -= damage * TOWER_FALLOFF * (distance - TOWER_OPTIMAL_RANGE) / (TOWER_FALLOFF_RANGE - TOWER_OPTIMAL_RANGE)
                    }
                    let expectedDamage = Math.floor(damage);
                    if (expectedDamage > hostiles[closestCreep].hits) {
                        hostiles.splice(closestCreep, 1);
                    }
                }
            }
        }

        return ThreadState_Done;
    }

    GetHostileTargets(possibleTargets: Creep[]): Creep[] {
        let hostiles: Creep[] = [];
        let workers: Creep[] = [];
        let claimers: Creep[] = [];
        for (let i = 0; i < possibleTargets.length; i++) {
            let creep = possibleTargets[i];
            if (creep.getActiveBodyparts(HEAL) > 0) {
                return [creep];
            }
            if (creep.getActiveBodyparts(ATTACK) > 0) {
                hostiles.push(creep);
            } else if (creep.getActiveBodyparts(WORK) > 0) {
                workers.push(creep);
            } else if (creep.getActiveBodyparts(RANGED_ATTACK) > 0) {
                hostiles.push(creep);
            } else if (creep.getActiveBodyparts(CLAIM) > 0) {
                claimers.push(creep);
            }
        }

        if (claimers.length > 0) {
            return claimers;
        } else if (workers.length > 0) {
            return workers;
        }
        return hostiles;
    }
}