import * as SwarmCodes from "Consts/SwarmCodes";
import { HiveQueenBase } from "Queens/HiveQueenBase";
import { HarvestImperator } from "Imperators/HarvestImperator";
import { SpawnConsul } from "Consuls/SpawnConsul";
import { HarvestConsul } from "Consuls/HarvestConsul";
import * as _ from 'lodash';
import { ControllerConsul } from "Consuls/ControllerConsul";

export class BabyHiveQueen extends HiveQueenBase {
    protected CheckForSpawnRequirements(): void {
        if (this.Collector.Consul.RequiresSpawn()) {
            let newName = ('Harv' + Game.time);
            this.Spawner.AddSpawnToQueue({
                body: [WORK, WORK, MOVE, CARRY],
                creepName: newName,
                requestorID: this.Collector.Consul.consulType,
                targetTime: 0
            });
            this.Collector.Consul.CreepRequested = newName;
        }
        if (this.Upgrader.Consul.RequiresSpawn()) {
            let spawnArgs = this.Upgrader.Consul.GetSpawnDefinition();
            this.Spawner.AddSpawnToQueue(spawnArgs);
            this.Upgrader.Consul.CreepRequested = spawnArgs.creepName;
        }
        if (this.Builder.Consul.RequiresSpawn()) {
            let spawnArgs = this.Builder.Consul.GetSpawnDefinition();
            this.Spawner.AddSpawnToQueue(spawnArgs);
            this.Builder.Consul.CreepRequested = spawnArgs.creepName;
        }
    }
    InitializeNest(): void {
        // Don't think I need anything eh?
    }
    ReceiveCommand(): void {
        //Not implemented
    }
    protected GatherIdleCreeps(): Creep[] {
        let allCreeps: Creep[] = [];
        let idleCreeps = this.Collector.Consul.GetIdleCreeps();
        for (let i = 0, length = idleCreeps.length; i < length; i++) {
            allCreeps.push(idleCreeps[i]);
            this.Collector.Consul.ReleaseCreep(idleCreeps[i].name);
        }
        idleCreeps = this.Upgrader.Consul.GetIdleCreeps();
        for (let i = 0, length = idleCreeps.length; i < length; i++) {
            allCreeps.push(idleCreeps[i]);
            this.Upgrader.Consul.ReleaseCreep(idleCreeps[i].name);
        }
        idleCreeps = this.Builder.Consul.GetIdleCreeps();
        for (let i = 0, length = idleCreeps.length; i < length; i++) {
            allCreeps.push(idleCreeps[i]);
            this.Builder.Consul.ReleaseCreep(idleCreeps[i].name);
        }

        return allCreeps;
    }
    protected ReassignIdleCreeps(): void {
        for (let i = 0, length = this.IdleCreeps.length; i < length; i++) {
            if (this.IdleCreeps[i].carry[RESOURCE_ENERGY] == 0) {
                this.Collector.Consul.AssignCreep(this.IdleCreeps[i]);
            } else if (this.Builder.Consul.RequiresSpawn()) {
                this.Builder.Consul.AssignCreep(this.IdleCreeps[i]);
            } else {
                this.Upgrader.Consul.AssignCreep(this.IdleCreeps[i]);
            }
        }

        this.IdleCreeps = [];
    }

    MetamorphiseToFullGrownHiveQueen(): HiveQueenBase {
        throw new Error("Method not implemented.");
    }
}