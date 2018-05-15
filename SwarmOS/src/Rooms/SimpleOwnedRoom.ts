import { BasicProcess } from "Core/BasicTypes";

export const SimpleRoomPackage: IPackage<SpawnerExtension_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(PKG_BasicOwnedRoom, SimpleOwnedRoom);
    }
}

import { RoomBase } from "Rooms/RoomBase";

class SimpleOwnedRoom extends RoomBase<SimpleOwnedRoom_Memory> {
    @extensionInterface(EXT_CreepRegistry)
    protected creeper!: ICreepRegistry;
    protected get creepAssignments() {
        return this.memory.creepAssignments;
    }
    protected get controlLevel(): number {
        return this.room && this.room.controller && this.room.controller.owner && this.room.controller.level || 0;
    }
    protected get spawnCapacityAvailable(): number {
        return this.room!.energyCapacityAvailable;
    }

    protected ensureCreeps(creepType: CT_ALL, desired: number, creepPackage: string, spawnLevel: number = -1) {
        if (!this.memory.creepAssignments[creepType]) {
            this.memory.creepAssignments[creepType] = [];
        }

        if (spawnLevel < 0) {
            for (let i = 0; i < CreepBodies[creepType].length; i++) {
                if (this.spawnCapacityAvailable >= CreepBodies[creepType][i].cost) {
                    spawnLevel = i;
                }
            }
        }
        let curAssignments = this.memory.creepAssignments[creepType];
        for (let i = 0; i < curAssignments.length; i++) {
            if (!curAssignments[i].pid) {
                curAssignments.splice(i--, 1);
                continue;
            }
            // (TODO): Use en somehow?
            if (curAssignments[i].lvl != spawnLevel || i > desired) {
                this.kernel.killProcess(curAssignments[i].pid!);
                curAssignments.splice(i--, 1);
                continue;
            }
        }

        while (curAssignments.length < desired) {
            let newCreepContext: CreepProcess_Memory = {
                en: true,
                get: false,
                home: this.room!.name,
                loc: this.room!.name,
                SB: creepType,
                SL: spawnLevel,
            }

            let newProcess = this.kernel.startProcess(creepPackage, newCreepContext);
            if (!newProcess || !newProcess.pid) {
                this.log.error(`Process failed to start: ${creepType}:${spawnLevel}`);
                return;
            }
            curAssignments.push({
                pid: newProcess.pid,
                lvl: spawnLevel,
                CT: creepType
            });
        }

        this.memory.creepAssignments[creepType] = curAssignments;
    }

    protected activateRoom(roomData: RVD_RoomMemory, room?: Room): void {
        if (!room) {
            this.log.fatal(`Owned room not found (${this.memory.roomName})`);
            this.kernel.killProcess(this.pid);
            return;
        }

        if (roomData.cSites.length > 0) {
            let numBuilders = Math.ceil(4 / roomData.cSites.length);
            this.ensureCreeps(CT_Builder, numBuilders, PKG_CreepBuilder);
        }

        if (roomData.owner && roomData.owner == MY_USERNAME) {
            if (this.controlLevel == 1) {
                this.ensureCreeps(CT_Refiller, 1, PKG_CreepRefiller, 0);
            } else {
                this.ensureCreeps(CT_Refiller, 1, PKG_CreepRefiller);
            }
            this.ensureCreeps(CT_Upgrader, 1, PKG_CreepUpgrader);


            for (let i = 0; i < roomData.sourceIDs.length; i++) {
                let sourceID = roomData.sourceIDs[i];

                let sourceProcess;
                let sourcePID = this.memory.sources[sourceID];
                if (sourcePID) {
                    sourceProcess = this.kernel.getProcessById(sourcePID);
                }
                if (!sourceProcess) {

                    let spawnLevel = 0;
                    for (let i = 0; i < CreepBodies.Harvester.length; i++) {
                        if (this.spawnCapacityAvailable >= CreepBodies.Harvester[i].cost) {
                            spawnLevel = i;
                        }
                    }
                    let sourceContext: Harvester_Memory = {
                        tar: sourceID,
                        loc: room.name,
                        home: room.name,
                        get: false,
                        SR: '0',
                        en: true,
                        SB: CT_Harvester,
                        SL: spawnLevel
                    }
                    let newPID = this.kernel.startProcess(PKG_CreepHarvester, sourceContext);
                    if (!newPID || !newPID.pid || !newPID.process) {
                        this.log.error(`Room failed to create a harvester process (${room.name})`);
                    } else {
                        this.memory.sources[sourceID] = newPID.pid;
                    }
                }
            }
        }

        // (TODO): Scale this
        this.sleeper.sleep(1);
    }
}