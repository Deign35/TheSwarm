import { BasicCreepGroup } from "./BasicCreepGroup";

export class RefillerGroup extends BasicCreepGroup<CreepGroup_Memory> {
    protected CreateNewCreepMemory(aID: string): SpawnRefiller_Memory {
        return {
            get: false,
            home: this.memory.homeRoom,
            loc: this.memory.targetRoom,
        }
    }
    protected get CreepPackageID(): string { return PKG_CreepRefiller; }
    protected get GroupPrefix(): string { return 'Ref'; }

}