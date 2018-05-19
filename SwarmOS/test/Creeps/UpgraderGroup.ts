import { BasicCreepGroup } from "./BasicCreepGroup";
export const OSPackage: IPackage<SpawnRegistry_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(CG_Upgrader, UpgraderGroup);
    }
}
export class UpgraderGroup extends BasicCreepGroup<CreepGroup_Memory> {
    protected get CreepPackageID(): OSPackage { return PKG_CreepUpgrader; }
    protected get GroupPrefix(): string { return 'Upg'; }

}