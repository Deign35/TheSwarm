import { BasicCreepGroup } from "./BasicCreepGroup";
export const OSPackage: IPackage<SpawnRegistry_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(CG_Harvester, HarvesterGroup);
    }
}

class HarvesterGroup extends BasicCreepGroup<HarvesterGroup_Memory> {
    protected EnsureAssignments(): IterableIterator<number> {
        let self = this;
        return (function* () {
            let count = 0;
            for (let i = 0; i < self.memory.sIDs.length; i++) {
                if (!self.assignments[self.memory.sIDs[i]]) {
                    self.createNewAssignment(self.memory.sIDs[i]);
                }
                yield count++;
            }
            return count;
        })();
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