import { BasicProcess } from "Core/BasicTypes";

class EnergyTransferActivity extends BasicProcess<EnergyJob_Memory> {
    @extensionInterface(EXT_CreepRegistry)
    protected creepRegistry!: ICreepRegistryExtensions;

    RunThread(): ThreadState {
        let creep = this.creepRegistry.tryGetCreep(this.memory.c, this.parentPID);
        if (!creep) {
            this.CurrentJobComplete(false);
            return ThreadState_Done;
        }
        if (creep.spawning) {
            return ThreadState_Done;
        }

        let target: EnergyStructureType;
        let path: PathStep[];
        let amt: number;
        let actionIsTransfer: boolean = true;

        if (!this.memory.tGet) {
            target = Game.getObjectById(this.memory.tTo) as EnergyStructureType;
            if (!target) { // Target has died
                this.CurrentJobComplete(false);
                return ThreadState_Done;
            }
            amt = Math.min(target.energyCapacity - target.energy, this.memory.aTo, creep.carry.energy);
            path = this.memory.pTo;
        } else {
            actionIsTransfer = false;
            target = Game.getObjectById(this.memory.tGet) as EnergyStructureType;
            if (!target) { // Target has died
                delete this.memory.tGet;
                return ThreadState_Active;
            }
            amt = Math.min(target.energyCapacity - target.energy, this.memory.aGet || 10000, creep.carryCapacity - _.sum(creep.carry));
            path = this.memory.pGet!;
        }

        let moveResult = creep.moveByPath(path);
        if (moveResult == ERR_NOT_FOUND) {
            // Made it to where I want to be
            let result: ScreepsReturnCode = ERR_INVALID_ARGS;
            if (actionIsTransfer) {
                result = creep.transfer(target, RESOURCE_ENERGY, amt);
            } else {
                result = creep.withdraw(target, RESOURCE_ENERGY, amt);
            }
            switch (result) {
                case (ERR_FULL):
                    result = OK;
                case (OK):
                    break;
                case (ERR_NOT_ENOUGH_RESOURCES):
                case (ERR_INVALID_ARGS):
                    throw new Error(`UNEXPECTED ERROR: ${actionIsTransfer ? 'transfer' : 'withdraw'} failed due to resource count.\n` +
                        `target { capacity: ${target.energyCapacity}, energy: ${target.energy} }\n` +
                        `creep { capacity: ${creep.carryCapacity}, energy: ${creep.carry.energy} }\n` +
                        `request: ${actionIsTransfer ? this.memory.aTo : this.memory.aGet} --- amt: ${amt}`);
                case (ERR_NOT_OWNER):
                case (ERR_INVALID_TARGET):
                    this.CurrentJobComplete(false);
                    break;
                case (ERR_NOT_IN_RANGE):
                    throw new Error(`MoveByPath fell short...`);
            }

            if (result == OK) {
                if (actionIsTransfer) {
                    this.CurrentJobComplete(true);
                } else {
                    delete this.memory.tGet;
                    return ThreadState_Active;
                }
            }
        } else if (moveResult == ERR_INVALID_ARGS) {
            this.CurrentJobComplete(false);
        }

        return ThreadState_Done;
    }

    CurrentJobComplete(wasCompleted: boolean) {
        // Callback when not completed
        this.EndProcess(this.memory.c);
    }
}