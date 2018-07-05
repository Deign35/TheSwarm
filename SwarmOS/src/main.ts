declare var Memory: {
    VERSION: string;
    counter: number;
}
let startLoad = Game.cpu.getUsed(); // Will not use any prototype defined version of getUsed
// Ensure all constants are initialized
require('globalConstants');

import * as Profiler from "Tools/Profiler";
global['Profiler'] = Profiler.init();
import * as Stats from "Tools/Stats";
Stats.setup();

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

    console.log(`Updating OS from ${Memory.VERSION} to ${SWARM_VERSION_DATE}`);
    Memory.counter = Memory.counter || 1;
    try {
        let oldVersion = Memory.VERSION;
        if (oldVersion) {

        }
    } catch (ex) {
        console.log(`Failed to Update OS version ${ex}.`)
    }
    Memory.VERSION = SWARM_VERSION_DATE;
    console.log(`Updating OS complete`)
}

import { kernel } from "Core/index";

/*import { ActivitiesPackage } from "Activities/index";
import { CreepJobsPackage } from "Jobs/index";
import { FlagPackage } from "Flags/index";
import { RegistriesPackage } from "Registries/index";
import { RoomJobs } from "RoomJobs/index";

kernel.installPackages([ActivitiesPackage, CreepJobsPackage, FlagPackage, RegistriesPackage, RoomJobs]);*/

export function loop() {
    try {
        GStats.reset();
        kernel.loop();
    } finally {
        kernel.log.DumpLogToConsole();
        GStats.commit();
    }
}

let endLoad = Game.cpu.getUsed();
if (!Game.rooms['sim']) {
    kernel.log.info(() => `SwarmOS reloaded - Begin: ${startLoad}cpu`);
    kernel.log.info(() => `SwarmOS reloaded - Used: ${endLoad - startLoad}cpu`);
}