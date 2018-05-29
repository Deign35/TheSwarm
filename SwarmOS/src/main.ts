declare var Memory: {
    VERSION: string,
    counter: number,
    creeps: SDictionary<any>,
    kernel: KernelMemory
}
let startLoad = Game.cpu.getUsed(); // Will not use any prototype defined version of getUsed
// Ensure all constants are initialized
require('globalConstants');

import * as Profiler from "Tools/Profiler";
global['Profiler'] = Profiler.init();

import "Tools/GlobalTools";
import "Tools_Prototypes";

// Update the OS as needed
const RESET_IN_SIM_ON_UPDATE = false;
if (!Memory.VERSION || Memory.VERSION != SWARM_VERSION_DATE) {
    console.log(`OS Version updated`);
    if (RESET_IN_SIM_ON_UPDATE && !!Game.rooms.sim) {
        console.log('SIM UPDATE RESET ENACTED');
        for (let id in Memory) {
            Memory[id] = undefined;
        }
        console.log(`SIM UPDATE RESET - Memory Cleaned`);
    }

    // Save the current memory to (segmented) Memory in case of a need to rollback.

    console.log(`Updating OS to ${SWARM_VERSION_DATE}`);
    Memory.counter = Memory.counter || 1;
    try {
        if (Memory.VERSION && Memory.VERSION == "2018-5-28 15:10:15") {
            const oldName = 'Spawnfiller';
            const newName = 'SpawnFiller';
            console.log('First attempt to update the OS')
            let pids = Object.keys(Memory.kernel.processMemory);
            for (let i = 0; i < pids.length; i++) {
                let mem = Memory.kernel.processMemory[pids[i]];
                if (mem) {
                    if ((mem as CreepGroup_Memory).assignments && (mem as CreepGroup_Memory).assignments[oldName]) {
                        (mem as CreepGroup_Memory).assignments[newName] = (mem as CreepGroup_Memory).assignments[oldName];
                        delete (mem as CreepGroup_Memory).assignments[oldName];
                    } else if ((mem as CreepJob_Memory).cID && (mem as CreepJob_Memory).id && (mem as CreepJob_Memory).id == oldName) {
                        (mem as CreepJob_Memory).id = newName;
                    }
                }
            }
        }
    } catch (ex) {
        console.log(`Failed to Update OS version ${ex}.`)
    }
    Memory.VERSION = SWARM_VERSION_DATE;
    console.log(`Updating OS complete`)
}

import { kernel } from "Core/index";

import { CreepGroupsPackage } from "Groups/index";
import { CreepJobsPackage } from "Jobs/index";
import { FlagPackage } from "Flags/index";
import { RegistriesPackage } from "Registries/index";

kernel.installPackages([CreepGroupsPackage, CreepJobsPackage, FlagPackage, RegistriesPackage]);

export function loop() {
    try {
        kernel.loop();
    } finally {
        kernel.log.DumpLogToConsole();
    }
}

let endLoad = Game.cpu.getUsed();
//kernel.log.info(() => `SwarmOS reloaded - Begin: ${startLoad}cpu`);
//kernel.log.info(() => `SwarmOS reloaded - Used: ${endLoad - startLoad}cpu`);