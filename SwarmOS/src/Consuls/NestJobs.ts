//import * as SwarmCodes from "Consts/SwarmCodes"
import * as SwarmConsts from "Consts/SwarmConsts";
import { CalculateBodyCost } from "Tools/QuickCalculations";
import { ChildMemory } from "Tools/SwarmMemory";
import { NestQueenBase } from "Queens/NestQueenBase";

const ARBITRARY_SPAWN_CONSTANT = 100;
const JOB_BOARD = 'Job_Board';
export class NestJobs extends ChildMemory {
    protected JobBoard!: { [requestId: string]: CreepRequestData };
    Save() {
        this.SetData(JOB_BOARD, this.JobBoard);
        super.Save();
    }

    Load() {
        if (!super.Load()) { return false; }
        this.JobBoard = this.GetData(JOB_BOARD);
        return true;
    }

    InitMemory() {
        super.InitMemory();
        this.JobBoard = {};
    }

    AddOrUpdateJobPosting(requestData: CreepRequestData) {
        this.JobBoard[requestData.requestID] = requestData;
    }

    ScheduleOneTimer(requestId: string, creepName: string, body: BodyPartConstant[], consul: string, time: number = Game.time, priority: SwarmConsts.SpawnPriority = SwarmConsts.SpawnPriority.Low) {
        let newRequest: CreepRequestData = {
            requestID: requestId,
            creepSuffix: creepName,
            body: body,
            priority: priority,
            requestor: consul,
            terminationType: SwarmConsts.SpawnRequest_TerminationType.OneOff,
            targetTime: time
        };

        this.AddOrUpdateJobPosting(newRequest);
    }
    RemoveJobRequest(requestId: string) {
        delete this.JobBoard[requestId];
    }
    GetJobRequest(requestId: string) {
        return this.JobBoard[requestId];
    }

    DetermineNextJobs(count: number, maxCapacity: number = -1): CreepRequestData[] {
        let requests = Object.keys(this.JobBoard);
        if (requests.length == 0) {
            return [];
        }

        requests.sort((a, b) => {
            // check if they either are disabled
            let reqA = this.JobBoard[a];
            if (reqA.disabled) { return 1; }
            let reqB = this.JobBoard[b];
            if (reqB.disabled) { return -1; }

            // Check that the body can even be spawned
            let bodyA = CalculateBodyCost(reqA.body);
            if (maxCapacity > 0 && bodyA > maxCapacity) { return 1; }
            let bodyB = CalculateBodyCost(reqB.body);
            if (maxCapacity > 0 && bodyB > maxCapacity) { return -1; }

            // Compare target time
            if (!!reqA.targetTime) {
                if (!reqB.targetTime) {
                    if (reqA.targetTime < ARBITRARY_SPAWN_CONSTANT) {
                        return -1; // don't let future creeps clog up one off requests.
                    }
                } else {
                    if (reqA.priority < reqB.priority) { return 1; }
                    if (reqB.priority < reqA.priority) { return -1; }
                    if (reqA.targetTime != reqB.targetTime) {
                        return reqA.targetTime < reqB.targetTime ? -1 : 1;
                    }
                }
            } else if (!!reqB.targetTime && reqB.targetTime < ARBITRARY_SPAWN_CONSTANT) {
                return 1;
            }

            // Check priority
            if (reqA.priority < reqB.priority) { return 1; }
            if (reqB.priority < reqA.priority) { return -1; }

            // return the more expensive one (as it is harder to spawn and therefore higher priority to get rid of)
            return bodyA > bodyB ? -1 : 1;
        });
        let topRequests = [];
        for (let i = 0, length = requests.length; i < length && topRequests.length < count; i++) {
            if (this.JobBoard[requests[i]].disabled) { continue; }
            topRequests.push(this.JobBoard[requests[i]]);
        }

        return topRequests;
    }
}