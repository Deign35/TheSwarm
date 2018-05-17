import { Kernel } from "Core/Kernel";
import { ExtensionRegistry } from "Core/ExtensionRegistry";
import { ProcessRegistry } from "Core/ProcessRegistry";
import { Logger } from "Core/Logger";
import { SchedulerExtension } from "Core/Scheduler";

var OS_Logger = new Logger();
export var extensionRegistry = new ExtensionRegistry(OS_Logger);
var OS_Scheduler = new SchedulerExtension(extensionRegistry);
export var processRegistry = new ProcessRegistry(OS_Logger);
export var kernel = new Kernel(processRegistry, extensionRegistry, OS_Logger, OS_Scheduler);

extensionRegistry.register(EXT_Kernel, kernel);
extensionRegistry.register(EXT_Sleep, kernel);
extensionRegistry.register(EXT_Interrupt, kernel);
extensionRegistry.register(EXT_Logger, OS_Logger);