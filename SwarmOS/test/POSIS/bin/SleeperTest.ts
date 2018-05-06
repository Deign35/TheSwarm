class SleeperTest implements IPosisProcess {
    constructor(private context: IPosisProcessContext) { }
    run() {
        this.context.logger.info(`Last ran ${Game.time - this.context.memory.lastRun} ticks ago`)
        this.context.logger.info(`Sleeping for 5 ticks (${Game.time})`)
        let sleeper = this.context.queryPosisInterface("sleep")
        sleeper.sleep(5)
        this.context.memory.lastRun = Game.time
    }

}

export const bundle: IPosisBundle<{}> = {
    install(registry: IPosisProcessRegistry) {
        registry.register("Example/SleeperTest", SleeperTest);
    }
}
