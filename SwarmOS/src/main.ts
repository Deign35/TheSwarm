require('globalConstants');
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
    Logger.fatal(`Begin tick ${Game.time}`);
    kernel.loop();
    Logger.debug(`End tick.  Used CPU: ${Game.cpu.getUsed()}`);
};