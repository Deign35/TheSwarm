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

import { Kernel } from "Core/Kernel";
import { ExtensionRegistry } from "Core/ExtensionRegistry";
import { ProcessRegistry } from "Core/ProcessRegistry";

import { bundle as ServiceBundle } from "./ServiceProvider";
import { bundle as TestBundle } from "PosisTest";

export let extensionRegistry = new ExtensionRegistry();
export let processRegistry = new ProcessRegistry();

let OSKernel = new Kernel(processRegistry, extensionRegistry);

extensionRegistry.register("kernel", OSKernel);
extensionRegistry.register("sleep", OSKernel);

processRegistry.install(ServiceBundle);
processRegistry.install(TestBundle);

export function loop() {
    OSKernel.loop();
};