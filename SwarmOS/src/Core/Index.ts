import { Kernel } from "Core/Kernel";
import { ExtensionRegistry } from "Core/ExtensionRegistry";
import { ProcessRegistry } from "Core/ProcessRegistry";

export var extensionRegistry = new ExtensionRegistry();
export var processRegistry = new ProcessRegistry();
export var kernel = new Kernel(processRegistry, extensionRegistry);

extensionRegistry.register("kernel", kernel);
extensionRegistry.register("sleep", kernel);