import { BasicCreepGroup } from "./BasicCreepGroup";

export class BuilderGroup extends BasicCreepGroup<CreepGroup_Memory> {
    protected CreateNewCreepMemory(aID: string): Builder_Memory {
        return {
            get: false,
            home: this.memory.homeRoom,
            loc: this.memory.targetRoom,
        }
    }
    protected get CreepPackageID(): string { return PKG_CreepBuilder; }
    protected get GroupPrefix(): string { return 'Bld'; }

}