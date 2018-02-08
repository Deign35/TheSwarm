import { HiveQueen } from "Managers/HiveQueen";
import { SwarmJob } from "Hivelords/SwarmJob";
import * as SwarmEnums from "SwarmEnums";

export class SwarmJobCreator {
    static CreateHarvester(hiveQueen: HiveQueen, body: BodyPartConstant[], targetSource?: string) {
        let newJobName = 'HA' + ('' + Game.time).slice(-3);
        let newJob = new SwarmJob(newJobName, hiveQueen);
        newJob.AddCommand(SwarmEnums.BasicCreepCommandType.C_Harvest, targetSource);
        newJob.AddCommand(SwarmEnums.BasicCreepCommandType.C_Transfer);
        newJob.AddCommand(SwarmEnums.BasicCreepCommandType.C_Build);
        newJob.AddCommand(SwarmEnums.BasicCreepCommandType.C_Upgrade);
        newJob.AddBodyDefinition(body);
        newJob.ActivateJob();
        hiveQueen.AddNewJob(newJob);
    }
}