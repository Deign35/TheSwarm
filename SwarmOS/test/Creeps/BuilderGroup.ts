import { BasicCreepGroup } from "./BasicCreepGroup";
export const OSPackage: IPackage<SpawnRegistry_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(CG_Builder, BuilderGroup);
    }
}


class BuilderGroup extends BasicCreepGroup<CreepGroup_Memory> {
    protected get CreepPackageID(): string { return PKG_CreepBuilder; }
    protected get GroupPrefix(): string { return 'Bld'; }

}