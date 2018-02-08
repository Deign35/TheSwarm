import { SwarmMemory } from "Memory/SwarmMemory";
import * as SwarmEnums from "SwarmEnums";
import { SwarmJob } from "Hivelords/SwarmJob";
import { SwarmJobCreator } from "Commands/GenericRoles";
import { BasicCreepCommandType } from "SwarmEnums";

const JOB_IDS = 'JI';
const RCL_VAL = 'RV';
export class HiveQueen extends SwarmMemory { // Controls a group of HiveNodes.
    Hive: Room;
    // Should change this to be an interface and different levels or configurations can have different kinds of HiveQueens
    // Each hive queen can have it's own objective.
    Jobs: { [name: string]: SwarmJob };
    RCL: number;
    Save() {
        let jobIDs = [];
        for (let name in this.Jobs) {
            this.Jobs[name].Save();
            jobIDs.push(name);
        }
        this.SetData(JOB_IDS, jobIDs);
        this.SetData(RCL_VAL, this.RCL);
        super.Save();
    }

    Load() {
        super.Load();
        this.Hive = Game.rooms[this.MemoryID];
        this.Jobs = {};
        let jobData = this.GetData(JOB_IDS) || [] as string[];
        for (let i = 0, length = jobData.length; i < length; i++) {
            this.Jobs[jobData[i]] = new SwarmJob(jobData[i], this);
        }
        this.RCL = this.GetData(RCL_VAL) || 0;
    }

    Activate() {
        for (let index in this.Jobs) {
            let result = this.Jobs[index].ValidateJob();
            if (result != OK) {
                // respond and fix the problems.  Like spawning
                if (result == SwarmEnums.HL_REQUIRE_CREEP) {
                    let foundExisting = false;
                    for (let name in Memory.creeps) {
                        if (!Memory.creeps[name]['Assigned']) {
                            this.Jobs[index].SetCreep(name);
                            foundExisting = true;
                            break;
                        }
                    }
                    if (!foundExisting) {
                        //Spawn a new creep.
                        if (this.Hive.controller) {
                            let spawn = this.Hive.controller.pos.findClosestByRange(FIND_MY_SPAWNS);
                            if (spawn.spawnCreep(this.Jobs[index].BodyDefinition, 'TestWorker', { dryRun: true }) == OK) {
                                let newName = this.MemoryID + '_' + this.Jobs[index].MemoryID;
                                spawn.spawnCreep(this.Jobs[index].BodyDefinition, newName, { memory: { Assigned: index } });
                                this.Jobs[index].SetCreep(newName);
                            }
                        }
                    }
                }
            }

            if (result == OK) {
                result = this.Jobs[index].Activate();
                if (result != OK) {
                    console.log('Failed action');
                }
            }
        }
        /*if(this.RCL < (this.Hive.controller as StructureController).level) {
            this.RCL = (this.Hive.controller as StructureController).level;
            delete this.Jobs;
            switch(this.RCL) {
                case(1): {
                    let newJobName = SwarmJobCreator.CreateJob(this, [BasicCreepCommandType.C_Harvest, BasicCreepCommandType.C_Transfer, BasicCreepCommandType.C_Upgrade], [MOVE, WORK, CARRY]);
                    this.Jobs[newJobName].Copy(newJobName + '_1');
                    this.Jobs[newJobName].Copy(newJobName + '_2');
                    this.Jobs[newJobName].Copy(newJobName + '_3');
                    break;
                }
                case(2):{
                    let newJobName = SwarmJobCreator.CreateJob(this, [BasicCreepCommandType.C_Harvest, BasicCreepCommandType.C_Transfer, BasicCreepCommandType.C_Upgrade], [MOVE, WORK, CARRY]);
                    this.Jobs[newJobName].Copy(newJobName + '_1');
                    newJobName = SwarmJobCreator.CreateJob(this, [BasicCreepCommandType.C_Harvest, BasicCreepCommandType.C_Transfer, BasicCreepCommandType.C_Build, BasicCreepCommandType.C_Upgrade], [MOVE, WORK, CARRY]);
                    this.Jobs[newJobName].Copy(newJobName + '_1');
                    this.Jobs[newJobName].Copy(newJobName + '_2');
                    this.Jobs[newJobName].Copy(newJobName + '_3');
                    newJobName = SwarmJobCreator.CreateJob(this, [BasicCreepCommandType.C_Harvest, BasicCreepCommandType.C_Transfer, BasicCreepCommandType.C_Upgrade], [MOVE, MOVE, WORK, WORK, CARRY]);
                    this.Jobs[newJobName].Copy(newJobName + '_1');
                    this.Jobs[newJobName].Copy(newJobName + '_2');
                    this.Jobs[newJobName].Copy(newJobName + '_3');
                    break;
                }
                case(3): {
                    let newJobName = SwarmJobCreator.CreateJob(this, [BasicCreepCommandType.C_Harvest, BasicCreepCommandType.C_Transfer, BasicCreepCommandType.C_Upgrade], [MOVE, MOVE, WORK, WORK, CARRY]);
                    this.Jobs[newJobName].Copy(newJobName + '_1');
                    this.Jobs[newJobName].Copy(newJobName + '_2');
                    this.Jobs[newJobName].Copy(newJobName + '_3');
                }
            }
        }*/
    }

    AddNewJob(job: SwarmJob) {
        this.Jobs[job.MemoryID] = job;
    }
}