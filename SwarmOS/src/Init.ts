import { posisInterface } from "Core/ExtensionRegistry"

interface IInitMemory {
    posisTestId?: PID,
    sleepTestId?: PID,
    msg?: string,
    services: { [id: string]: ServiceDefinition }
}

export interface ServiceDefinition {
    restart: boolean
    name: string
    context: any
    status: 'started' | 'stopped'
    pid?: PID
}

class Init implements IPosisProcess {
    constructor(private context: IPosisProcessContext) {
        //this.addService("sleeperTest", "ags131/SleeperTest", {}, true)
        this.addService("baseTest", "SwarmBase/PosisBaseTestProcess", { maxRunTime: 25 })
    }
    get id() {
        return this.context.id
    }
    get memory(): IInitMemory {
        return this.context.memory
    }
    get services(): { [id: string]: ServiceDefinition } {
        this.memory.services = this.memory.services || {}
        return this.memory.services
    }

    @posisInterface("kernel")
    private kernel!: IPosisKernel

    run() {
        Logger.info(`TICK! ${Game.time}`)
        this.manageServices()
    }

    addService(id: string, name: string, context?: any, restart: boolean = false) {
        if (this.services[id]) return
        Logger.warn(`Adding service ${id}`)
        this.services[id] = {
            name, context, restart,
            status: 'started'
        }
    }

    manageServices() {
        let ids = Object.keys(this.services)
        for (let i = 0, length = ids.length; i < length; i++) {
            let id = ids[i];
            let service = this.services[id]
            let proc: IPosisProcess | undefined
            if (service.pid) proc = this.kernel.getProcessById(service.pid)
            switch (service.status) {
                case "started":
                    if (!proc) {
                        if (service.restart || !service.pid) {
                            let result = this.kernel.startProcess(service.name, Object.assign({}, service.context));
                            if (result) {
                                service.pid = result.pid;
                            }
                            //service.pid = pid
                        } else {
                            service.status = 'stopped'
                        }
                    }
                    break
                case "stopped":
                    if (proc && service && service.pid) {
                        Logger.info(`Killing stopped process ${service.name} ${service.pid}`)
                        this.kernel.killProcess(service.pid)
                    }
                    break
            }
        }
    }
}

export const bundle: IPosisBundle<{}> = {
    install(registry: IPosisProcessRegistry) {
        registry.register("init", Init)
    }
}
