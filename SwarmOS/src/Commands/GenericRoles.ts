import { HiveQueen } from "Managers/HiveQueen";
import { Hivelord } from "Managers/Hivelord";
import { SwarmJob } from "Hivelords/SwarmJob";
import * as SwarmEnums from "SwarmEnums";

export class SwarmJobCreator {
    private static AttachToHiveQueen(hiveQueen: HiveQueen, newJob: SwarmJob) {
        let newHivelord 
    }
    static CreateHarvester(hiveQueen: HiveQueen, body: BodyPartConstant[], targetSource?: string) {
        let newHivelord = new Hivelord(('' + Game.time).slice(-3), hiveQueen);
        let newJob = new SwarmJob('HA', newHivelord);
        newJob.AddCommand(SwarmEnums.BasicCreepCommandType.C_Harvest, targetSource);
        newJob.AddCommand(SwarmEnums.BasicCreepCommandType.C_Transfer);
        newJob.AddCommand(SwarmEnums.BasicCreepCommandType.C_Build);
        newJob.AddCommand(SwarmEnums.BasicCreepCommandType.C_Upgrade);
        newJob.ActivateJob();
        newHivelord.InitHivelord(newJob, body);
        hiveQueen.AddNewHivelord(newHivelord);
    }
}