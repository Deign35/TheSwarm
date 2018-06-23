import { BasicProcess } from "Core/BasicTypes";

class EnergyTransferActivity extends BasicProcess<EnergyJob_Memory> {
    @extensionInterface(EXT_CreepRegistry)
    protected creepRegistry!: ICreepRegistryExtensions;

    protected creep: Creep | undefined;
    protected roomData!: RoomState;

    PrepTick() {
        this.creep = this.creepRegistry.tryGetCreep(this.memory.c, this.pid);
        this.roomData = this.View.GetRoomData(this.memory.rID)!;
    }

    RunThread(): ThreadState {
        if (!this.creep) {
            this.CurrentJobComplete();
            return ThreadState_Done;
        }
        if (this.creep.spawning) {
            return ThreadState_Done;
        }

        let target: ObjectTypeWithID;
        let path: PathStep[];
        let amt: number;
        let actionIsTransfer: boolean = true;

        if (!this.memory.tGet) {
            target = Game.getObjectById<EnergyStructureType>(this.memory.tTo)!;
            if (!target) { // Target has died
                this.CurrentJobComplete();
                return ThreadState_Done;
            }
            amt = Math.min((target as EnergyStructureType).energyCapacity - (target as EnergyStructureType).energy,
                this.memory.aTo, this.creep.carry.energy);
            path = this.memory.pTo;
        } else {
            actionIsTransfer = false;
            target = Game.getObjectById<EnergyStructureType>(this.memory.tGet)!;
            if (!target) { // Target has died
                delete this.memory.tGet;
                return ThreadState_Active;
            }
            amt = Math.min((target as EnergyStructureType).energyCapacity - (target as EnergyStructureType).energy,
                this.memory.aGet || 10000, this.creep.carryCapacity - _.sum(this.creep.carry));
            path = this.memory.pGet!;
        }

        let moveResult = this.creep.moveByPath(path);
        if (moveResult == ERR_NOT_FOUND) {
            // Made it to where I want to be
            let result: ScreepsReturnCode = ERR_INVALID_ARGS;
            if (actionIsTransfer) {
                result = this.creep.transfer(target, RESOURCE_ENERGY, amt);
            } else {
                result = this.creep.withdraw(target, RESOURCE_ENERGY, amt);
            }
            switch (result) {
                case (ERR_FULL):
                    result = OK;
                case (OK):
                    break;
                case (ERR_NOT_ENOUGH_RESOURCES):
                case (ERR_INVALID_ARGS):
                    throw new Error(`UNEXPECTED ERROR: ${actionIsTransfer ? 'transfer' : 'withdraw'} failed due to resource count.\n` +
                        `target { capacity: ${(target as EnergyStructureType).energyCapacity}, energy: ${(target as EnergyStructureType).energy} }\n` +
                        `creep { capacity: ${this.creep.carryCapacity}, energy: ${this.creep.carry.energy} }\n` +
                        `request: ${actionIsTransfer ? this.memory.aTo : this.memory.aGet} --- amt: ${amt}`);
                case (ERR_NOT_OWNER):
                case (ERR_INVALID_TARGET):
                    this.CurrentJobComplete();
                    break;
                case (ERR_NOT_IN_RANGE):
                    throw new Error(`MoveByPath fell short...`);
            }

            if (result == OK) {
                if (actionIsTransfer) {
                    this.CurrentJobComplete();
                } else {
                    delete this.memory.tGet;
                    return ThreadState_Active;
                }
            }
        } else if (moveResult == ERR_INVALID_ARGS) {
            this.CurrentJobComplete();
        }

        return ThreadState_Done;
    }

    CurrentJobComplete() {
        this.EndProcess(this.memory.c);
    }
}