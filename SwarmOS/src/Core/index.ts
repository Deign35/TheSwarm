import { Kernel } from "Core/Kernel";
import { ExtensionRegistry } from "Registries/ExtensionRegistry";
import { ProcessRegistry } from "Registries/ProcessRegistry";
import { Logger } from "Core/Logger";

var OS_Logger = new Logger();
export var extensionRegistry = new ExtensionRegistry(OS_Logger);
export var processRegistry = new ProcessRegistry(OS_Logger);
export var kernel = new Kernel(processRegistry, extensionRegistry, OS_Logger);

extensionRegistry.register(EXT_Logger, OS_Logger);
extensionRegistry.register(EXT_Kernel, kernel);
extensionRegistry.register(EXT_Sleep, kernel);

import { OSPackage } from "Core/EmptyProcess";
OSPackage.install(processRegistry, extensionRegistry);