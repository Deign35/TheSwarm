import { SwarmMemory } from "Memory/SwarmMemory";
import * as SwarmEnums from "SwarmEnums";
import { HiveHarvestOverseer } from "Overseers/HiveHarvestOverseer";
import { Hivelord } from "Overseers/Hivelord";

const RCL_VAL = 'RV';
const HIVE_HARVESTER = 'HH';
const HIVELORD = 'HL';
export class HiveQueen extends SwarmMemory {
    Hive: Room;
    RCL: number;
    HiveHarvester: HiveHarvestOverseer;
    Overseers: IOverseer[];
    hivelord: Hivelord;
    Save() {
        this.HiveHarvester.Save();
        this.hivelord.Save();
        this.SetData(RCL_VAL, this.RCL);
        super.Save();
    }

    Load() {
        super.Load();
        this.Hive = Game.rooms[this.MemoryID];
        this.RCL = this.GetData(RCL_VAL) || 0;
        this.hivelord = new Hivelord(HIVELORD, this);
        this.Overseers = [];

        this.HiveHarvester = new HiveHarvestOverseer(HIVE_HARVESTER, this);
        this.Overseers.push(this.HiveHarvester);
    }

    Activate() {
        for (let i = 0, length = this.Overseers.length; i < length; i++) {
            this.Overseers[i].ValidateOverseer();
            if (this.Overseers[i].HasRequirements()) {
                let requirements = this.Overseers[i].GetRequirements();
                if (requirements.Creeps.length > 0) {
                    // Try to spawn here...Add multiple spawns when I get there.
                    let spawn = this.hivelord.FindTarget((this.Hive.controller as StructureController).pos, FIND_MY_SPAWNS)[0] as StructureSpawn;
                    if (spawn && !spawn.spawning) {
                        let bodyDefinition = requirements.Creeps[i].creepBody;
                        if(spawn.spawnCreep(bodyDefinition.min, 'TEST_SPAWN', { dryRun: true}) == OK) {
                            let bodyToSpawn = bodyDefinition.min;
                            if(spawn.spawnCreep(bodyDefinition.best, 'TEST_SPAWN', {dryRun: true}) == OK) {
                                bodyToSpawn = bodyDefinition.best;
                            } else if(spawn.spawnCreep(bodyDefinition.mid, 'TEST_SPAWN', {dryRun: true}) == OK) {
                                bodyToSpawn = bodyDefinition.mid;
                            }
                            let spawnName = this.MemoryID + '_' + ('' + Game.time).slice(-4);
                            spawn.spawnCreep(bodyToSpawn, spawnName, { memory: { Assigned: true } });
                            this.Overseers[i].AssignCreep(spawnName);
                        }
                    }
                }
            }
            this.Overseers[i].ActivateOverseer();
        }
    }


}