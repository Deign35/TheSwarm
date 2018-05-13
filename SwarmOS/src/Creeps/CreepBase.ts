import { ProcessBase } from "Core/BasicTypes";
import { ActionBase } from "Actions/ActionBase";
import { WithdrawAction } from "Actions/WithdrawAction";
import { HarvestAction } from "Actions/HarvestAction";
import { PickupAction } from "Actions/PickupAction";

export abstract class CreepBase<T extends CreepProcess_Memory> extends ProcessBase {
    @posisInterface(EXT_RoomView)
    RoomView!: IRoomDataExtension;

    OnLoad() {
        this._lastUpdate = Game.time;
        if (this.memory.creep) {
            this._creep = Game.creeps[this.memory.creep];
        }
        // Clean up any existing spawn requests
        if (this.memory.creep) {
            let creepStatus = this.spawner.getRequestStatus(this.memory.creep);
            if (creepStatus == SP_ERROR || creepStatus == SP_COMPLETE) {
                this.spawner.cancelRequest(this.memory.creep);
                if (!Game.creeps[this.memory.creep]) {
                    delete this.memory.creep;
                }
            }
        }
    }
    private _lastUpdate!: number;
    protected abstract get CreepPrefix(): string
    protected get SpawnPriority(): Priority {
        return Priority_Low;
    }
    protected get SpawnBody(): ISpawnDef {
        return {
            body: [WORK, WORK, CARRY, MOVE],
            cost: 300
        }
    }
    protected GetNewCreepName() {
        return this.CreepPrefix + GetSUID();
    }
    protected get memory(): T {
        return super.memory;
    }
    protected get creep() {
        if (this._lastUpdate != Game.time) {
            if (this.memory.creep) {
                this._creep = Game.creeps[this.memory.creep];
            }
            this._lastUpdate = Game.time;
        }

        return this._creep;
    }
    private _creep!: Creep;
    protected executeProcess(): void {
        if (this.creep) {
            this.activateCreep();
        } else {
            if (this.memory.creep) {
                let spawnStatus = this.spawner.getRequestStatus(this.memory.creep);
                if (!spawnStatus) {
                    this.memory.creep = undefined;
                    this.kernel.killProcess(this.pid);
                    return;
                } else {
                    if (spawnStatus != SP_QUEUED) {
                        if (spawnStatus != SP_SPAWNING) {
                            this.spawner.cancelRequest(this.memory.creep);
                            this.memory.creep = undefined;
                        }
                    }
                }
            }
            if (!this.memory.creep) {
                this.memory.creep = this.spawner.requestCreep({
                    body: this.SpawnBody,
                    creepName: this.GetNewCreepName(),
                    location: '',
                    spawnState: SP_QUEUED,
                    priority: this.SpawnPriority,
                    pid: this.pid
                });
            }
        }
    }
    protected abstract activateCreep(): void;
    protected getEnergy(minEnergy: number = 0) {
        let withdrawTarget = undefined;

        if (this.memory.targetID) {
            withdrawTarget = Game.getObjectById(this.memory.targetID) as StructureStorage | StructureContainer |
                StructureLink | Source | StructureTerminal | Resource;
            if (!withdrawTarget) {
                this.memory.targetID = undefined;
            } else {
                let available = 0;
                if ((withdrawTarget as StructureStorage).storeCapacity) {
                    available = (withdrawTarget as StructureStorage).store.energy;
                } else if ((withdrawTarget as StructureLink).energyCapacity) {
                    available = (withdrawTarget as Source).energy;
                } else if ((withdrawTarget as Resource).resourceType == RESOURCE_ENERGY) {
                    available = (withdrawTarget as Resource).amount;
                } else {
                    this.log.fatal(`Withdraw target unexpected ${JSON.stringify(withdrawTarget)}`);
                    this.memory.targetID = undefined;
                }

                if (minEnergy > available) {
                    this.memory.targetID = undefined;
                    withdrawTarget = undefined;
                }
            }
        }
        if (!withdrawTarget) {
            withdrawTarget = this.FindNearestEnergyDispenser(this.creep.room.name, minEnergy);
            if (!withdrawTarget) {
                this.log.fatal(`NO ENERGY!!!!!!!!!!!!!!!!!!!`);
                return;
            }
        }

        let action: ActionBase | undefined = undefined;
        if ((withdrawTarget as Structure).structureType) {
            action = new WithdrawAction(this.creep,
                (withdrawTarget as StructureStorage | StructureTerminal | StructureContainer | StructureLink),
                RESOURCE_ENERGY);
        } else if ((withdrawTarget as Source).energyCapacity) {
            action = new HarvestAction(this.creep, (withdrawTarget) as Source);
        } else if ((withdrawTarget as Resource).resourceType) {
            action = new PickupAction(this.creep, withdrawTarget as Resource);
        } else {
            this.log.error(`I dunno, will this ever happen?`);
            return;
        }

        action.Run();
    }

    private FindNearestEnergyDispenser(targetRoom: string, minEnergy: number = 0): StructureContainer | StructureStorage |
        StructureTerminal | StructureLink | Source | Resource | undefined {
        let view = this.RoomView.GetRoomData(targetRoom);
        if (!view) {
            this.log.fatal(`This should not be possible`);
            this.kernel.killProcess(this.pid);
            return;
        }
        let closestTarget = undefined;
        let { crX, crY, dist } = {
            crX: this.creep.pos.x,
            crY: this.creep.pos.y,
            dist: 100
        }

        for (let i = 0; i < view.resources.length; i++) {
            let resource = Game.getObjectById(view.resources[i]) as Resource
            if (resource && resource.resourceType == RESOURCE_ENERGY) {
                if (resource.amount > minEnergy) {
                    // (TODO): Fix this!
                    closestTarget = resource;
                    break;
                }
            }
        }

        if (this.creep.room.storage) {
            let storage = this.creep.room.storage;
            if (storage.store.energy >= minEnergy) {
                dist = this.creep.pos.getRangeTo(storage.pos.x, storage.pos.y);
                closestTarget = storage;
            }
        }
        for (let i = 0; i < view.structures.container.length; i++) {
            let container = Game.getObjectById(view.structures.container[i].id) as StructureContainer;
            if (!container) { continue; }
            if (container.store.energy >= minEnergy) {
                let containerDist = this.creep.pos.getRangeTo(container);
                if (containerDist < dist) {
                    dist = containerDist;
                    closestTarget = container;
                }
            }
        }
        if (view.structures.link) {
            for (let i = 0; i < view.structures.link.length; i++) {
                let link = Game.getObjectById(view.structures.link[i].id) as StructureLink;
                if (!link) { continue; }
                if (link.energy >= minEnergy) {
                    let linkDist = this.creep.pos.getRangeTo(link);
                    if (linkDist < dist) {
                        dist = linkDist;
                        closestTarget = link;
                    }
                }
            }
        }
        if (!closestTarget) {
            if (this.creep.getActiveBodyparts(WORK) > 0) {
                for (let i = 0; i < view.sourceIDs.length; i++) {
                    let source = Game.getObjectById(view.sourceIDs[i]) as Source;
                    if (!source) { continue; } // If its cause its in another room.  then what?
                    if (source.energy >= minEnergy) {
                        let sourceDist = this.creep.pos.getRangeTo(source);
                        if (sourceDist < dist) {
                            dist = sourceDist;
                            closestTarget = source;
                        }
                    }
                }
            }
            if (this.creep.room.terminal) {
                let terminal = this.creep.room.terminal;
                if (terminal.store.energy >= minEnergy) {
                    let terminalDist = this.creep.pos.getRangeTo(terminal);
                    if (terminalDist < dist) {
                        dist = terminalDist;
                        closestTarget = terminal;
                    }
                }
            }
        }

        if (!closestTarget) {
            if (this.memory.homeRoom != targetRoom) {
                return this.FindNearestEnergyDispenser(this.memory.homeRoom, minEnergy);
            } else if (minEnergy > 0) {
                return this.FindNearestEnergyDispenser(this.memory.homeRoom, 0);
            }
        }

        this.memory.targetRoom = targetRoom;
        return closestTarget;
    }
}