import { SwarmMemory } from "Memory/SwarmMemory";
import { DisposalDelegate } from "common/Disposable";
import * as _ from "lodash";
import { BasicCreepCommand } from "Commands/BasicCreepCommand";
import { HarvesterJob } from "JobRoles/HarvesterJob";

export class HiveQueen extends SwarmMemory implements IDisposable { // Controls a group of HiveNodes.
    dispose(): void {
        DisposeAll.unsubscribe(this.MemoryID);
        delete this.dispose; // Will cause an error if dispose is called again.
        // Save my memory, save children first.
    }
    constructor(hive: Room) {
        super(hive.name);

        if (!hive.controller) {
            throw 'THIS CANNOT HAPPEN!!!';
        }
        DisposeAll.subscribe(this.MemoryID, this);
        if (!this.GetData('RoomId')) {
            this.SetData('RoomId', hive.name);
            let sources: string[] = [];
            _.forEach(hive.find(FIND_SOURCES), function (source: Source) {
                sources.push(source.id);
            });
            this.SetData('Sources', sources);

            let mineral = hive.find(FIND_MINERALS);
            if (mineral) {
                this.SetData('Mineral', mineral[0].id);
            }
            // Set up required jobs
            for (let i = 0; i < hive.controller.level; i++) {
                this.GetNewRequiredJobs(i + 1);
            }
        }

        this.CurJobs = this.GetData('Jobs');
    }

    private CurJobs: { [jobName: string]: any } = {};
    GetNewRequiredJobs(level: number) {
        let jobs = this.CurJobs;
        if (level == 1) {
            let sourceIds = this.GetData('Sources');
            for (let i = 0, length = sourceIds.length; i < length; i++) {
                //jobs['S' + i] = new HarvesterJob('S' + i, sourceIds[i], true);
            }
            jobs['U1'] = CreepRole.Upgrader;
        } else /*if (level == 2) {
            // add more jobs.
        } else */ {
            throw 'Job level[' + level + '] is not configured';
        }
    }

    private HiveJobs = {
        1: [
            CreepRole.Harvester,
            CreepRole.Upgrader
        ],
        2: {

        },
        3: {

        },
        4: {

        },
        5: {

        },
        6: {

        },
        7: {

        },
        8: {

        },
    }
}