/*import { BasicProcess } from "Core/BasicTypes";

export const SimpleRoomPackage: IPackage<SpawnRegistry_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(PKG_SimpleOwnedRoom, SimpleOwnedRoom);
    }
}

import { RoomBase } from "Rooms/RoomBase";

class SimpleOwnedRoom extends RoomBase<SimpleOwnedRoom_Memory> {
    @extensionInterface(EXT_CreepRegistry)
    protected creepRegistry!: ICreepRegistryExtensions;
    protected get creepAssignments() {
        return this.memory.creepAssignments;
    }
    protected get controlLevel(): number {
        return this.room && this.room.controller && this.room.controller.owner && this.room.controller.level || 0;
    }
    protected get spawnCapacityAvailable(): number {
        return this.room!.energyCapacityAvailable;
    }

    

    protected activateRoom(roomData: RVD_RoomMemory, room?: Room): void {
        if (!room) {
            this.log.fatal(`Owned room not found (${this.memory.roomName})`);
            this.kernel.killProcess(this.pid);
            return;
        }

        if (roomData.cSites.length > 0) {
            let numBuilders = Math.ceil(roomData.cSites.length / 4);
            this.ensureCreeps(CT_Builder, numBuilders, PKG_CreepBuilder);
        }

        if (roomData.owner && roomData.owner == MY_USERNAME) {
            // Find a way to not die if my refiller dies with less than the min needed to spawn...
            if (this.controlLevel == 1) {
                this.ensureCreeps(CT_Refiller, 1, PKG_CreepRefiller, 0);
            } else {
                this.ensureCreeps(CT_Refiller, 1, PKG_CreepRefiller);
            }
            this.ensureCreeps(CT_Upgrader, 1, PKG_CreepUpgrader);


            for (let i = 0; i < roomData.sourceIDs.length; i++) {
                let sourceID = roomData.sourceIDs[i];

                let sourceProcess;
                let sourcePID = this.memory.sourcePIDs[sourceID];
                if (sourcePID) {
                    sourceProcess = this.kernel.getProcessById(sourcePID);
                }
                if (!sourceProcess) {
                    let spawnLevel = 0;
                    if (this.spawnCapacityAvailable > 300) {
                        for (let i = 0; i < CreepBodies.Harvester.length; i++) {
                            if (this.spawnCapacityAvailable >= CreepBodies.Harvester[i].cost) {
                                spawnLevel = i;
                            }
                        }
                    }
                    let sourceContext: Harvester_Memory = {
                        tar: sourceID,
                        loc: room.name,
                        home: room.name,
                        get: false,
                        SR: '0',
                    }
                    let newPID = this.kernel.startProcess(PKG_CreepHarvester, sourceContext);
                    if (!newPID || !newPID.pid || !newPID.process) {
                        this.log.error(`Room failed to create a harvester process (${room.name})`);
                    } else {
                        this.memory.sourcePIDs[sourceID] = newPID.pid;
                    }
                }
            }
        }

        // (TODO): Scale this
        this.sleeper.sleep(1);
    }
}*/