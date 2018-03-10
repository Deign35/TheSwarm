import * as _ from 'lodash';
import * as SwarmCodes from 'Consts/SwarmCodes'
import { NestQueenBase } from 'Queens/NestQueenBase';
import { ControllerConsul } from 'Consuls/ControllerConsul';
import { ConstructionConsul } from 'Consuls/ConstructionConsul';
import { DistributionConsul } from 'Consuls/DistributionConsul';
import { NestJobs } from 'Consuls/NestJobs';
import { CalculateBodyCost } from 'Tools/QuickCalculations';
import { SpawnPriority } from 'Consts/SwarmConsts';
import { HiveQueenBase } from './HiveQueenBase';

const ARBITRARY_SPAWN_CONSTANT = 200;
export class NestQueen extends NestQueenBase {
    get ParentQueen() { return this.Parent as HiveQueenBase }
    constructor(id: string, hiveQueen: HiveQueenBase) {
        super(id, hiveQueen);
    }
    get SpawnCapacity(): number {
        return this.ParentQueen.SpawnCapacity;
    }
    InitializeNest(): void {
        throw new Error("Method not implemented.");
    }
    ReleaseControl(creep: string): void {
        throw new Error("Method not implemented.");
    }
    protected CheckForSpawnRequirements(): void {
        throw new Error("Method not implemented.");
    }
    ActivateNest() {
        this.ActivateCouncil();
        let nextSpawnTime = Game.time + ARBITRARY_SPAWN_CONSTANT;
        let nextIndex = -1;
        for (let i = 0, length = this.CreepConsulList.length; i < length; i++) {
            let next = this.CreepConsulList[i].GetNextSpawnTime();
            if (next != 0 && next < nextSpawnTime) {
                if (nextIndex < 0 || this.CreepConsulList[i].GetSpawnPriority() > this.CreepConsulList[nextIndex].GetSpawnPriority()) {
                    nextSpawnTime = next;
                    nextIndex = i;
                }
            }
        }

        if (nextSpawnTime < Game.time + ARBITRARY_SPAWN_CONSTANT) {
            let nextSpawn = this.CreepConsulList[nextIndex].CreateDefaultJobTemplate('' + Game.time);

        }
    }
}