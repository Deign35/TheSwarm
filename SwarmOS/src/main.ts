require('globalConstants');
import { SwarmLogger } from "Tools/SwarmLogger";
global['Logger'] = new SwarmLogger();
declare var Memory: {
    VERSION: string,
    counter: number,
    testAlgorithms: Dictionary
}
const RESET_IN_SIM_ON_UPDATE = true;
if (!Memory.VERSION || Memory.VERSION != SWARM_VERSION_DATE) {
    Logger.alert(`OS Version updated`);
    if (RESET_IN_SIM_ON_UPDATE && !!Game.rooms.sim) {
        Logger.fatal('SIM UPDATE RESET ENACTED');
        for (let id in Memory) {
            Memory[id] = undefined;
        }
        Logger.error(`SIM UPDATE RESET - Memory Cleaned`);
    }

    Logger.warn(`Updating OS to ${SWARM_VERSION_DATE}`);
    Memory.counter = Memory.counter || 1;
    Memory.testAlgorithms = Memory.testAlgorithms || {};
    Memory.VERSION = SWARM_VERSION_DATE;
    Logger.info(`Updating OS complete`)
}

import * as Profiler from "Tools/Profiler";
global.Profiler = Profiler.init();

import "Tools/GlobalTools";

/*import "SwarmMemory/Swarmlord";
import { SwarmLoader } from "SwarmTypes/SwarmLoader";
import { SwarmQueen } from "SwarmBehaviour/SwarmQueen";

export const loop = function () {
    //debugger;
    Swarmlord.ValidateMemory();
    SwarmLoader.LoadTheSwarm();

    SwarmQueen.PrepTheSwarm();
    SwarmQueen.ActivateTheSwarm();
    SwarmQueen.SaveTheSwarm();
    SwarmLoader.SaveTheSwarm();
}*/

/*import { Kernel } from "Core/Kernel";
import { ExtensionRegistry } from "Core/ExtensionRegistry";
import { ProcessRegistry } from "Core/ProcessRegistry";

export let extensionRegistry = new ExtensionRegistry();
export let processRegistry = new ProcessRegistry();

let OSKernel = new Kernel(processRegistry, extensionRegistry);
extensionRegistry.register("kernel", kernel);
extensionRegistry.register("sleep", kernel);

*/

import { kernel } from "Core/index";
import { bundle as ServiceBundle } from "Core/ServiceProvider";
import { processBundle as ManagerBundle } from "SwarmManagers/index";

kernel.installBundles([ManagerBundle, ServiceBundle]);

export function loop() {
    Logger.debug(`Begin tick ${Game.time}`);
    kernel.loop();
    Logger.trace(`End tick.  Used CPU: ${Game.cpu.getUsed()}`);
};