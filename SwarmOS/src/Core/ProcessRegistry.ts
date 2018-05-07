export class ProcessRegistry implements IPosisProcessRegistry {
    constructor() { }
    private registry: { [name: string]: IPosisProcessConstructor } = {};
    register(name: string, constructor: IPosisProcessConstructor): boolean {
        if (this.registry[name]) {
            Logger.error(`Name already registered: ${name}`);
            return false;
        }
        Logger.debug(`Registered ${name}`);
        this.registry[name] = constructor;
        return true;
    }
    getNewProcess(name: string, context: IPosisProcessContext): IPosisProcess | undefined {
        if (!this.registry[name]) return;
        Logger.debug(`Created ${name}`);
        return new this.registry[name](context);
    }
}
