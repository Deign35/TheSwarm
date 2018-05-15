import { BasicProcess } from "Core/BasicTypes";

export const bundle: IPackage<SpawnerExtension_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(PKG_BasicOwnedRoom, BasicOwnedRoom);
    }
}

import { RoomBase } from "Rooms/RoomBase";

class BasicOwnedRoom extends RoomBase<BasicOwnedRoom_Memory> {
    protected activateRoom(roomData: RVD_RoomMemory, room?: Room): void {
        if (!room) {
            this.log.fatal(`Owned room not found (${this.memory.roomName})`);
            this.kernel.killProcess(this.pid);
            return;
        }
        if (roomData.cSites.length > 0) {
            let numBuilders = Math.ceil(4 / roomData.cSites.length);
            this.SpawnClass(this.memory.creeps.bui, numBuilders, PKG_CreepBuilder);
        }

        if (roomData.owner && roomData.owner == MY_USERNAME) {
            if (!this.memory.creeps.ref) {
                this.memory.creeps.ref = [];
            }
            this.SpawnClass(this.memory.creeps.ref, 1, PKG_CreepRefiller);

            if (!this.memory.creeps.upg) {
                this.memory.creeps.upg = [];
            }
            this.SpawnClass(this.memory.creeps.upg, 2, PKG_CreepUpgrader);

            for (let i = 0; i < roomData.sourceIDs.length; i++) {
                let sourceID = roomData.sourceIDs[i];

                let sourceProcess;
                let sourcePID = this.memory.sources[sourceID];
                if (sourcePID) {
                    sourceProcess = this.kernel.getProcessById(sourcePID);
                }
                if (!sourceProcess) {
                    let sourceContext: Harvester_Memory = {
                        tar: sourceID,
                        loc: room.name,
                        home: room.name,
                        get: false,
                        SR: '0',
                        en: true,
                        SB: CreepBodies[]
                    }
                    let newPID = this.kernel.startProcess(PKG_CreepHarvester, sourceContext);
                    if (!newPID || !newPID.pid || !newPID.process) {
                        this.log.error(`Room failed to create a harvester process (${room.name})`);
                    } else {
                        this.memory.sources[sourceID] = newPID.pid;
                    }
                }
            }

            /*if (!this.memory.creeps.harv) {
                this.memory.creeps.harv = [];
            }
            this.SpawnClass(this.memory.creeps.harv, roomData.sourceIDs.length, PKG_CreepHarvester);*/

            if (!this.memory.creeps.misc) {
                this.memory.creeps.misc = [];
            }
        }
    }

    SpawnClass(creepArr: PID[], numToHave: number, pkgType: string) {
        for (let i = 0; i < creepArr.length; i++) {
            let proc = this.kernel.getProcessById(creepArr[i]); {
                if (!proc) {
                    creepArr.splice(i--, 1);
                }
            }
        }
        if (creepArr.length < numToHave) {
            let newMemory: CreepProcess_Memory = {
                home: this.room!.name,
                loc: this.room!.name,
                get: true,
                SR: '0',
                en: true
            }
            let newPID = this.kernel.startProcess(pkgType, newMemory);
            if (!newPID || !newPID.pid || !newPID.process) {
                this.log.fatal(`Room failed to create a builder process (${this.room!.name})`);
                return;
            }
            creepArr.push(newPID.pid);
        }
    }
}