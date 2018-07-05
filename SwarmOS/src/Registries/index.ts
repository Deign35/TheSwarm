import { OSPackage as MapDirectory } from "Registries/MapDirectory";

import { PackageProviderBase } from "Core/BasicTypes";
class SwarmManager extends PackageProviderBase<PackageProviderMemory> {
    protected get RequiredServices(): SDictionary<ProviderService> {
        return this._reqServices;
    }
    private _reqServices: SDictionary<ProviderService> = {}
}

export const RegistriesPackage: IPackage<{}> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        MapDirectory.install(processRegistry, extensionRegistry);
        processRegistry.register(PKG_SwarmManager, SwarmManager);
    },
}