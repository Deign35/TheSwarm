declare var Memory: {
    VERSION: string,
    counter: number,
    creeps: SDictionary<any>
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
    Memory.VERSION = SWARM_VERSION_DATE;
    console.log(`Updating OS complete`)
}

import { kernel } from "Core/index";

import { CreepThreadsPackage } from "CreepThreads/index";
import { CreepGroupsPackage } from "CreepGroups/index";
import { bundle as SwarmManager } from "SwarmManagers/index";
import { flagBundle } from "Flags/index";
import { RegistriesPackage as Registries } from "Registries/index";

kernel.installPackages([SwarmManager, Registries, CreepThreadsPackage, flagBundle, CreepGroupsPackage]);

export function loop() {
    try {
        kernel.loop();
    } finally {
        kernel.log.DumpLogToConsole();
    }
};

let endLoad = Game.cpu.getUsed();
kernel.log.info(() => `SwarmOS reloaded - Begin: ${startLoad}cpu`);
kernel.log.info(() => `SwarmOS reloaded - Used: ${endLoad - startLoad}cpu`);