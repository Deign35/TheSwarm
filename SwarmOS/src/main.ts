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

import { extensionRegistry, processRegistry, kernel } from "Core";
import { bundle as ServiceBundle } from "Core/ServiceProvider";
import { bundle as TestBundle } from "PosisTest";
import { processBundle as ManagerBundle } from "SwarmManagers";


ManagerBundle.install(processRegistry, extensionRegistry);
ServiceBundle.install(processRegistry, extensionRegistry);

processRegistry.install(TestBundle);

export function loop() {
    kernel.loop();
};