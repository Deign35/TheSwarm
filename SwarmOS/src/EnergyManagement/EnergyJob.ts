import { BasicProcess } from "Core/BasicTypes";

class EnergyJob extends BasicProcess<EnergyJob_Memory> {
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
            this.EndProcess(this.memory.c);
            return ThreadState_Done;
        }
        if (this.creep.spawning) {
            return ThreadState_Done;
        }

        if (!this.memory.tGet) { // Has no target to retrieve from
            let target = Game.getObjectById<EnergyStructureType>(this.memory.tTo);
            if (!target) { // Target has died
                this.EndProcess(this.memory.c);
                return ThreadState_Done;
            }

            let moveResult = this.creep.moveByPath(this.memory.pTo);
            if (moveResult == ERR_NOT_FOUND) {
                // Made it to where I want to be
                let transferAmount = Math.min((target as EnergyStructureType).energyCapacity - (target as EnergyStructureType).energy,
                    this.memory.aTo, this.creep.carry.energy);
                let result = this.creep.transfer(target, RESOURCE_ENERGY, transferAmount);
                switch (result) {
                    case (OK):
                        break;
                    case (ERR_NOT_ENOUGH_RESOURCES):
                    case (ERR_INVALID_ARGS):
                        this.log.error(`UNEXPECTED ERROR: Transfer failed due to resource count.\n` +
                            `target { capacity: ${(target as EnergyStructureType).energyCapacity}, energy: ${(target as EnergyStructureType).energy} }\n` +
                            `creep { capacity: ${this.creep.carryCapacity}, energy: ${this.creep.carry.energy} }\n` +
                            `request: ${this.memory.aTo} --- transferAmount: ${transferAmount}`);
                        result = this.creep.transfer(target, RESOURCE_ENERGY);
                        if (result != OK) {
                            throw new Error(`UNEXPECTED ERROR: Transfer without amount actually failed...`);
                        }
                        break;
                    case (ERR_NOT_OWNER):
                    case (ERR_INVALID_TARGET):
                    case (ERR_FULL):
                        this.EndProcess(this.memory.c);
                        break;
                    case (ERR_NOT_IN_RANGE):
                        throw new Error(`MoveByPath fell short...`);
                }

                if (result == OK) {
                    // Some sort of notification back to the manager whenever transfer is successful and by how much.
                    this.EndProcess(this.memory.c);
                }
            } else if (moveResult == ERR_INVALID_ARGS) {
                this.EndProcess(this.memory.c);
            }
        } else {
            let target = Game.getObjectById<EnergyStructureType>(this.memory.tGet);
            if (!target) { // Target has died
                delete this.memory.tGet;
                return ThreadState_Active;
            }
            let moveResult = this.creep.moveByPath(this.memory.pGet || []);
            if (moveResult == ERR_NOT_FOUND) {
                // Made it to where I want to be
                let withdrawAmount = Math.min((target as EnergyStructureType).energyCapacity - (target as EnergyStructureType).energy,
                    this.memory.aGet || 10000, this.creep.carryCapacity - _.sum(this.creep.carry));
                let result = this.creep.withdraw(target, RESOURCE_ENERGY, withdrawAmount);
                switch (result) {
                    case (ERR_FULL):
                        result = OK;
                    case (OK):
                        break;
                    case (ERR_NOT_ENOUGH_RESOURCES):
                    case (ERR_INVALID_ARGS):
                        this.log.error(`UNEXPECTED ERROR: Transfer failed due to resource count.\n` +
                            `target { capacity: ${(target as EnergyStructureType).energyCapacity}, energy: ${(target as EnergyStructureType).energy} }\n` +
                            `creep { capacity: ${this.creep.carryCapacity}, energy: ${this.creep.carry.energy} }\n` +
                            `request: ${this.memory.aGet} --- withdrawAmount: ${withdrawAmount}`);
                        result = this.creep.withdraw(target, RESOURCE_ENERGY);
                        if (result != OK) {
                            throw new Error(`UNEXPECTED ERROR: Transfer without amount actually failed...`);
                        }
                        break;
                    case (ERR_NOT_OWNER):
                    case (ERR_INVALID_TARGET):
                        this.EndProcess(this.memory.c);
                        break;
                    case (ERR_NOT_IN_RANGE):
                        throw new Error(`MoveByPath fell short...`);
                }

                if (result == OK) {
                    this.EndProcess();
                }
            } else if (moveResult == ERR_INVALID_ARGS) {
                this.EndProcess(this.memory.c);
            }
        }

        return ThreadState_Done;
    }

    GetNextPositionFrom(pos: { x: number, y: number }, dir: DirectionConstant): { x: number, y: number } {
        let retVal = { x: pos.x, y: pos.y };
        switch (dir) {
            case (TOP):
                retVal.y -= 1;
                break;
            case (TOP_LEFT):
                retVal.x -= 1;
                retVal.y -= 1;
                break;
            case (TOP_RIGHT):
                retVal.x += 1;
                retVal.y -= 1;
                break;
            case (RIGHT):
                retVal.x += 1;
                break;
            case (LEFT):
                retVal.x -= 1;
                break;
            case (BOTTOM):
                retVal.y += 1;
                break;
            case (BOTTOM_LEFT):
                retVal.x -= 1;
                retVal.y += 1;
                break;
            case (BOTTOM_RIGHT):
                retVal.x += 1;
                retVal.y += 1;
                break;
        }

        return retVal;
    }
}