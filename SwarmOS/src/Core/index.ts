import { Logger } from "Core/Logger";
var OS_Logger = new Logger();

import { ExtensionRegistry } from "Core/ExtensionRegistry";
export var extensionRegistry = new ExtensionRegistry(OS_Logger);
//extensionRegistry.register(EXT_Logger, OS_Logger);

import { ProcessRegistry } from "Core/ProcessRegistry";
export var processRegistry = new ProcessRegistry(OS_Logger);

import { Kernel } from "Core/Kernel";
export var kernel = new Kernel(processRegistry, extensionRegistry, OS_Logger);

extensionRegistry.register(EXT_Kernel, kernel);

import { OSPackage } from "Core/EmptyProcess";
OSPackage.install(processRegistry, extensionRegistry);
import { CLIPackage } from "./CLI/index";
import { Folder } from "./FileSystem/Folder";
CLIPackage.install(processRegistry, extensionRegistry);