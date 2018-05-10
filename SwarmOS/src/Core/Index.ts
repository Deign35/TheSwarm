import { Kernel } from "Core/Kernel";
import { ExtensionRegistry } from "Core/ExtensionRegistry";
import { ProcessRegistry } from "Core/ProcessRegistry";

export var extensionRegistry = new ExtensionRegistry();
export var processRegistry = new ProcessRegistry();
export var kernel = new Kernel(processRegistry, extensionRegistry);

extensionRegistry.register(EXT_Kernel, kernel);
extensionRegistry.register(EXT_Sleep, kernel);