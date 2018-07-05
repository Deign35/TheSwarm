import { Logger } from "Core/Logger";
var OS_Logger = new Logger();

import { ExtensionRegistry } from "Registries/ExtensionRegistry";
export var extensionRegistry = new ExtensionRegistry(OS_Logger);
extensionRegistry.register(EXT_Logger, OS_Logger);

import { ProcessRegistry } from "Registries/ProcessRegistry";
export var processRegistry = new ProcessRegistry(OS_Logger);

import { Kernel } from "Core/Kernel";
export var kernel = new Kernel(processRegistry, extensionRegistry, OS_Logger);

extensionRegistry.register(EXT_Kernel, kernel);
extensionRegistry.register(EXT_Sleep, kernel);

import { OSPackage } from "Core/EmptyProcess";
OSPackage.install(processRegistry, extensionRegistry);