import { BasicProcess, ThreadProcess } from "Core/BasicTypes";
import { ActionBase } from "Actions/ActionBase";
import { WithdrawAction } from "Actions/WithdrawAction";
import { HarvestAction } from "Actions/HarvestAction";
import { PickupAction } from "Actions/PickupAction";
import { SayAction } from "Actions/SayAction";

export abstract class CreepThread<T extends CreepProcess_Memory> extends ThreadProcess<T> {
    @extensionInterface(EXT_CreepRegistry)
    protected creepRegistry!: ICreepRegistryExtensions;
    @extensionInterface(EXT_RoomView)
    RoomView!: IRoomDataExtension;

    protected get creep(): Creep {
        return this._creep!;
    }
    private _creep: Creep | undefined;

    protected refreshSpawnRequest(context: CreepContext) {
        context.n = context.n.slice(0, 5) + GetSUID();
        context.o = this.pid;
    }
    protected executeProcess(): void {
        if (this.memory.CR) {
            this._creep = this.creepRegistry.tryGetCreep(this.memory.CR, this.pid);
            if (!this._creep) {
                delete this.memory.CR;
                if (this.memory.SR) {
                    let curContext = this.spawnRegistry.getRequestContext(this.memory.SR);
                    if (curContext) {
                        if (!curContext.r) {
                            this.kernel.killProcess(this.pid);
                            return;
                        }
                        this.refreshSpawnRequest(curContext);
                    }
                    if (!curContext || !this.spawnRegistry.tryResetRequest(this.memory.SR, curContext)) {
                        this.kernel.killProcess(this.pid);
                        return;
                    }
                }
            }
        }

        if (!this.memory.CR && this.memory.SR) {
            let reqStatus = this.spawnRegistry.getRequestStatus(this.memory.SR);
            switch (reqStatus) {
                case (SP_COMPLETE):
                // (TODO): Need to make sure that we dont end up in an inf loop.
                case (SP_SPAWNING):
                    let context = this.spawnRegistry.getRequestContext(this.memory.SR);
                    if (context) {
                        this.creepRegistry.tryRegisterCreep(context)
                        this.creepRegistry.tryReserveCreep(context.n, this.pid);
                        this.memory.CR = context.n;
                        this._creep = this.creepRegistry.tryGetCreep(this.memory.CR, this.pid);

                        if (this._creep && !context.r) {
                            this.spawnRegistry.cancelRequest(this.memory.SR);
                            delete this.memory.SR;
                            break;
                        }
                    }
                    if (reqStatus == SP_COMPLETE && !this._creep) {
                        if (!context || !context.r) {
                            this.kernel.killProcess(this.pid);
                            return;
                        }
                        this.refreshSpawnRequest(context);
                        this.spawnRegistry.tryResetRequest(this.memory.SR, context);
                    }
                    break;
                case (undefined):
                case (SP_ERROR):
                    this.kernel.killProcess(this.pid);
                case (SP_QUEUED):
                    return;
            }
        }
    }

    protected getEnergy(minEnergy: number = 0): ThreadState {
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
                return ThreadState_Done;
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
        return ThreadState_Done;
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
            let container = Game.getObjectById(view.structures.container[i]) as StructureContainer;
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
                let link = Game.getObjectById(view.structures.link[i]) as StructureLink;
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

        return closestTarget;
    }
}