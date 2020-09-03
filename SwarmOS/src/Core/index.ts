import { Kernel } from "Core/Kernel";
import { ExtensionRegistry } from "Core/ExtensionRegistry";
import { ProcessRegistry } from "Core/ProcessRegistry";
import { Logger } from "Core/Logger";

const OS_Logger = new Logger();
export const extensionRegistry = new ExtensionRegistry(OS_Logger);
export const processRegistry = new ProcessRegistry(OS_Logger);
export const kernel = new Kernel(processRegistry, extensionRegistry, OS_Logger);

extensionRegistry.register(EXT_Logger, OS_Logger);
extensionRegistry.register(EXT_Kernel, kernel);
extensionRegistry.register(EXT_Sleep, kernel);

import { OSPackage } from "Core/EmptyProcess";
OSPackage.install(processRegistry, extensionRegistry);