import { SwarmMemory } from "Memory/SwarmMemory";
import { BasicCreepCommand } from "Commands/BasicCreepCommand";

export abstract class JobBase implements IJob {
    constructor(public JobID: string) {

    }
    JobCommands: { [cmdId: string]: BasicCreepCommand; };
    MemoryID: string;

    static SaveJob(MemoryObj: IMemory, job: JobBase) {
        let jobMemory = {} as Dictionary;
        MemoryObj.SetData(job.JobID, jobMemory)
    }
    static LoadCommand(MemoryObj: IMemory, commandName: string) {
        let commandMemory = MemoryObj.GetData(commandName);
        let newCommand = new BasicCreepCommand(commandName, commandMemory['commandType']);
        newCommand.CreepCommandData = commandMemory['commandData'];
        newCommand.AssignedCreep = Game.getObjectById(commandMemory['assignedCreepId']) as Creep;
        // Creep doesn't have memory right now...
    }
}