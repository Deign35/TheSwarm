import { OSPackage as RoomAnalyzer } from "./RoomAnalyzer";

export const GameAnalyzers: IPackage<{}> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        RoomAnalyzer.install(processRegistry, extensionRegistry);
    }
}