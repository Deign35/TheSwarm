declare var Memory: {
    energyData: EnergyDist_Memory
}

import { ExtensionBase, ServiceProviderBase, InitData } from "Core/BasicTypes";

export const bundle: IPosisBundle<EnergyDist_Memory> = {
    install(processRegistry: IPosisProcessRegistry, extensionRegistry: IPosisExtensionRegistry) {
        processRegistry.register(PKG_EnergyDistribution, EnergyDistributionManager);
        extensionRegistry.register(EXT_EnergyDist, EnergyDistributionExtension);
    },
    rootImageName: PKG_EnergyDistribution
}
const PKG_EnergyDistribution_LogContext: LogContext = {
    logID: PKG_EnergyDistribution,
    logLevel: LOG_DEBUG
}

class EnergyDistributionManager extends ServiceProviderBase<ServiceProviderMemory> {
    constructor(protected context: IPosisProcessContext) {
        super(context);
        Logger.CreateLogContext(PKG_EnergyDistribution_LogContext);
    }

    @posisInterface(EXT_EnergyDist)
    DistributionExtensions!: EnergyDistributionExtension;

    protected get RequiredServices(): SDictionary<InitData> {
        return {}
    }
    protected OnLoad(): void { }
    protected get log() {
        return this._logger;
    }

    private _logger: ILogger = {
        alert: (message: (string | (() => string))) => { Logger.alert(message, PKG_EnergyDistribution); },
        debug: (message: (string | (() => string))) => { Logger.debug(message, PKG_EnergyDistribution); },
        error: (message: (string | (() => string))) => { Logger.error(message, PKG_EnergyDistribution); },
        fatal: (message: (string | (() => string))) => { Logger.fatal(message, PKG_EnergyDistribution); },
        info: (message: (string | (() => string))) => { Logger.info(message, PKG_EnergyDistribution); },
        trace: (message: (string | (() => string))) => { Logger.trace(message, PKG_EnergyDistribution); },
        warn: (message: (string | (() => string))) => { Logger.warn(message, PKG_EnergyDistribution); },
        CreateLogContext: Logger.CreateLogContext,
        DumpLogToConsole: Logger.DumpLogToConsole
    }

    handleMissingMemory() {
        if (!Memory.energyData) {
            Memory.energyData = {
                distributors: [],
                activeRequests: {},
                inActiveRequests: {}
            };
        }
        return Memory.energyData;
    }
    executeProcess(): void {
        this.log.warn(`${PKG_EnergyDistribution} has not been implemented.`);
    }
}

class EnergyDistributionExtension extends ExtensionBase {
    protected get memory(): EnergyDist_Memory {
        return Memory.energyData;
    }


}
/*
declare type EnergyDist_Data = {
    ass: number; // Currently assigned energy being delivered
    pri: Priority; // Priority of the requestor.
    req: number; // requested energy to be delivered
    loc: string; // location of the request by roomID
    ref: boolean; // Should this request automatically refresh itself
}
*/
