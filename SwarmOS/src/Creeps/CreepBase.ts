import { BasicProcess } from "Core/BasicTypes";
import { ActionBase } from "Actions/ActionBase";
import { WithdrawAction } from "Actions/WithdrawAction";
import { HarvestAction } from "Actions/HarvestAction";
import { PickupAction } from "Actions/PickupAction";
import { SayAction } from "Actions/SayAction";

export abstract class CreepBase<T extends CreepProcess_Memory> extends BasicProcess<T> {
    @extensionInterface(EXT_CreepRegistry)
    protected creeper!: ICreepRegistry;
    @extensionInterface(EXT_RoomView)
    RoomView!: IRoomDataExtension;

    protected abstract get CreepPrefix(): string
    protected GetNewCreepName() {
        return this.CreepPrefix + GetSUID();
    }
    protected get creep(): Creep {
        if (this._lastUpdate != Game.time) {
            if (this.memory.CC) {
                this._creep = this.creeper.getCreep(this.memory.CC.n, this.pid);
            }
            this._lastUpdate = Game.time;
        }

        return this._creep!; // Little cheaty, but best way to get Typescript to compile the assumption that the program won't run without the creep
    }
    private _lastUpdate!: number;
    private _creep?: Creep;

    protected get SpawnPriority(): Priority {
        return Priority_Low;
    }

    protected executeProcess(): void {
        if (this.creep) {
            if (this.creep.spawning) {
                return;
            }
            if (this.memory.en) {
                if (this.creep.carry.energy == this.creep.carryCapacity) {
                    this.memory.tar = undefined;
                    this.memory.en = false;
                } else {
                    this.getEnergy(this.creep.carryCapacity / 2);
                }
            }
            this.activateCreep(this.creep);
        } else {
            if (this.memory.SR) {
                let spawnStatus = this.spawner.getRequestStatus(this.memory.SR);
                if (!spawnStatus) {
                    this.memory.SR = undefined;
                    this.kernel.killProcess(this.pid);
                    return;
                } else {
                    if (spawnStatus != SP_QUEUED) {
                        if (spawnStatus != SP_SPAWNING) {
                            this.spawner.cancelRequest(this.memory.SR);
                            this.memory.SR = undefined;
                        }
                    }
                }
            }
            if (!this.memory.SR) {
                this.memory.SR = this.spawner.requestSpawn(this.creepContext, this.memory.loc, this.pid, this.SpawnPriority);
            }
        }
    }
    protected get creepContext(): CreepContext {
        return {
            n: GetSUID(),
            o: this.pid,

            c: 1,
            m: 1,
            w: 2
        }
    }

    protected abstract activateCreep(creep: Creep): void;
    protected getEnergy(minEnergy: number = 0) {
        let withdrawTarget = undefined;

        if (this.memory.tar) {
            withdrawTarget = Game.getObjectById(this.memory.tar) as StructureStorage | StructureContainer |
                StructureLink | Source | StructureTerminal | Resource;
            if (!withdrawTarget) {
                this.memory.tar = undefined;
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
                    this.memory.tar = undefined;
                }

                if (minEnergy > available) {
                    this.memory.tar = undefined;
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
            action = new SayAction(this.creep, "I'm confused about my target...");
            this.memory.tar = undefined;
        }

        action.Run();
    }

    // (TODO): This needs to be extracted out to a seperate service, perhaps provided by the RoomViewData
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
            if (this.memory.home != targetRoom) {
                return this.FindNearestEnergyDispenser(this.memory.home, minEnergy);
            } else if (minEnergy > 0) {
                return this.FindNearestEnergyDispenser(this.memory.home, 0);
            }
        }

        this.memory.loc = targetRoom;
        return closestTarget;
    }
}