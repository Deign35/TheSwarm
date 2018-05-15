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

    protected get SpawnPriority(): Priority {
        return Priority_Low;
    }

    protected get creep(): Creep {
        return this._creep!;
    }
    private _creep: Creep | undefined;

    protected executeProcess(): void {
        if (!this.memory.en) {
            if (this.memory.SR) {
                this.creeper.releaseCreep(this.memory.SR);
            }
            return;
        }
        this.EnsureCreep();

        if (this.memory.SR) {
            let creepContext = this.creeper.getCreep(this.memory.SR, this.pid);
            if (creepContext && Game.creeps[creepContext.n]) {
                this._creep = Game.creeps[creepContext.n];
                if (this._creep.spawning) {
                    return;
                }

                this._creep.say(this.pkgName);
                this.activateCreep();
            }
        }
    }

    protected EnsureCreep() {
        let requestID: string | undefined = this.memory.SR;
        if (requestID) {
            let context = this.creeper.getCreep(requestID, this.pid);
            let spawnStatus = this.spawner.getRequestStatus(requestID);
            switch (spawnStatus) {
                case (SP_COMPLETE):
                case (SP_ERROR):
                    this.spawner.cancelRequest(requestID);
                case (undefined):
                    if (!context || !Game.creeps[context.n]) {

                        requestID = undefined;
                    }
                case (SP_QUEUED):
                case (SP_SPAWNING):
                default:
                    break;
            }
        }

        this.memory.SR = requestID || this.trySpawnCreep();
    }

    protected trySpawnCreep() {
        return this.spawner.requestSpawn(this.createNewCreepContext(), this.memory.loc, this.pid, this.SpawnPriority);
    }
    protected createNewCreepContext(): CreepContext {
        // Adjust this class for spawn context initialization?
        return {
            n: this.GetNewCreepName(),
            o: this.pid,
            b: this.memory.SB,
            l: this.memory.SL
        }
    }

    onProcessEnd() {
        if (this.memory.SR) {
            let req = this.spawner.getRequestStatus(this.memory.SR);
            if (req) {
                this.spawner.cancelRequest(this.memory.SR);
            }
            let creep = this.creeper.getCreep(this.memory.SR, this.pid);
            if (creep) {
                this.creeper.releaseCreep(this.memory.SR);
            }
        }
    }

    protected abstract activateCreep(): void;
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