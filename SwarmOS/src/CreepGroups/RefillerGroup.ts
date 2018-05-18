import { BasicCreepGroup } from "./BasicCreepGroup";
export const OSPackage: IPackage<SpawnRegistry_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(CG_Refiller, RefillerGroup);
    }
}

export class RefillerGroup extends BasicCreepGroup<CreepGroup_Memory> {
    protected get CreepPackageID(): OSPackage { return PKG_CreepRefiller; }
    protected get GroupPrefix(): string { return 'Ref'; }

}