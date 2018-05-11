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

const DIST_REQ_RATIO = 10;
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
                requests: {}
            };
        }
        return Memory.energyData;
    }
    executeProcess(): void {
        this.log.warn(`${PKG_EnergyDistribution} has not been implemented.`);

        this.log.trace(`Begin by checking if there are available distributors`);
        this.log.trace(`If imablanced, create distributors as needed`);

        this.log.trace(`For each available distributor, find a dist target`);
        this.log.trace(`Careful not to bury a request such that it never gets fulfilled`);

        this.log.trace(`Done???`);
    }
}

class EnergyDistributionExtension extends ExtensionBase {
    protected get memory(): EnergyDist_Memory {
        return Memory.energyData;
    }
    DisableRequest(id: string) {
        if (this.memory.requests[id]) {
            this.memory.requests[id].act = false;
        }
    }
    GetRequestStatus(id: string) {
        // shrug...
    }

    UpdateDistRequest(id: string, amount: number, location: string, priority: Priority = Priority.Low, autoRefresh: boolean = false) {
        let newReq = {
            act: true,
            ass: this.memory.requests[id] ? this.memory.requests[id].ass : 0,
            loc: location,
            pri: priority,
            ref: autoRefresh,
            req: amount
        }
        this.memory.requests[id] = newReq;
    }
}
/*
declare type EnergyDist_Data = {
    act: active
    ass: number; // Currently assigned energy being delivered
    pri: Priority; // Priority of the requestor.
    req: number; // requested energy to be delivered
    loc: string; // location of the request by roomID
    ref: boolean; // Should this request automatically refresh itself
}
*/
