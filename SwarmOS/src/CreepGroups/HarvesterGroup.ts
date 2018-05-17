import { BasicCreepGroup } from "./BasicCreepGroup";
export const OSPackage: IPackage<SpawnRegistry_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(CG_Harvester, HarvesterGroup);
    }
}

class HarvesterGroup extends BasicCreepGroup<HarvesterGroup_Memory> {
    protected EnsureAssignments(): void {
        for (let i = 0; i < this.memory.sIDs.length; i++) {
            if (!this.assignments[this.memory.sIDs[i]]) {
                this.createNewAssignment(this.memory.sIDs[i]);
            }
        }
    }
    protected CreateNewCreepMemory(aID: string): Harvester_Memory {
        return {
            get: false,
            home: this.memory.homeRoom,
            loc: this.memory.targetRoom,
            SR: this.assignments[aID].SR,
            tar: aID
        }
    }
    protected get CreepPackageID(): string { return PKG_CreepHarvester; }
    protected get GroupPrefix(): string { return 'Harv'; }

}