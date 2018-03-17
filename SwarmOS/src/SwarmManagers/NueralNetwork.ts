const PRIMES = [
    2, 3, 5, 7, 11, 13, 17, 19, 23, 29,
    31, 37, 41, 43, 47, 53, 59, 61, 67, 71,
    73, 83, 89, 91, 97, 101, 103, 107, 109, 113,
    127, 131, 137, 139, 149, 151, 157, 163, 167, 173,
    179, 181, 191, 193, 197, 199, 211, 223, 227, 229
]

var CurIDConstant = Game.time;
var CurIndex = 0;

function GetNewJobID() {
    let newID = 'J_' + (Game.time % 10000) + (CurIDConstant % PRIMES[CurIndex++]);
    if (CurIndex >= PRIMES.length) { CurIndex = 0; }
    return newID;
}

export class NeuralNetwork {
    protected jobs!: { [jobID: string]: any };

    CreateNewJob(job: any) {
        let newJobID;
        let lastIndex = CurIndex - 1;
        while (!newJobID) {
            if (CurIndex == lastIndex) {
                // COULDN'T CREATE A NEW ID, WTF...
                newJobID = 'J_' + Math.random() + Game.time;
            } else {
                let createdID = GetNewJobID();
                if (!this.jobs[createdID]) {
                    newJobID = createdID;
                }
            }
        }

        this.ProcessNewJob(job, newJobID);

        return newJobID;
    }

    protected ProcessNewJob(job: any, jobID: string) {
        let jobObj = {
            job: job
        }

        jobObj['TargetPos'];
        this.jobs[jobID] = jobObj;
    }
}

