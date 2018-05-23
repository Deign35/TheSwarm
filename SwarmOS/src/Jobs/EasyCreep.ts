export const OSPackage: IPackage<SpawnRegistry_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(PKG_CreepThread, EasyCreep);
    }
}

import { MoveToPositionAction } from "Actions/MoveToPositionAction";
import { ActionBase } from "Actions/ActionBase";
import { UpgradeAction } from "Actions/UpgradeAction";
import { BuildAction } from "Actions/BuildAction";
import { PickupAction } from "Actions/PickupAction";
import { RepairAction } from "Actions/RepairAction";
import { TransferAction } from "Actions/TransferAction";
import { WithdrawAction } from "Actions/WithdrawAction";
import { HarvestAction } from "Actions/HarvestAction";
import { RequestTransferAction } from "Actions/RequestTransfer";
import { BasicProcess } from "Core/BasicTypes";

export class EasyCreep<T extends CreepThread_JobMemory> extends BasicProcess<T> {
    @extensionInterface(EXT_CreepRegistry)
    protected creepRegistry!: ICreepRegistryExtensions;
    @extensionInterface(EXT_RoomView)
    RoomView!: IRoomDataExtension;

    protected get creep(): Creep {
        return this._creep!;
    }
    private _creep: Creep | undefined;
    PrepTick(): void {
        if (this.memory.c) {
            this._creep = this.creepRegistry.tryGetCreep(this.memory.c, this.pid);
            if (!this._creep) {
                this.log.info(`KillProcess (EasyCreep.PrepTick())`);
                this.kernel.killProcess(this.pid);
                this.sleeper.wake(this.parentPID);
                return;
            }
        }
    }
    protected GetActionType(): ActionType {
        return this.memory.a;
    }

    protected GetTargetID(): string | undefined {
        return this.memory.t;
    }
    protected GetBasicAction(actionType: ActionType, target: RoomObject | Creep) {
        switch (actionType) {
            case (AT_Build):
                return new BuildAction(this.creep, target as ConstructionSite);
            case (AT_Harvest):
                return new HarvestAction(this.creep, target as Source);
            case (AT_RequestTransfer):
                return new RequestTransferAction(this.creep, target as Creep);
            case (AT_Pickup):
                return new PickupAction(this.creep, target as Resource);
            case (AT_Repair):
                return new RepairAction(this.creep, target as Structure);
            case (AT_Transfer):
                return new TransferAction(this.creep, target as Structure | Creep);
            case (AT_Upgrade):
                return new UpgradeAction(this.creep, target as StructureController);
            case (AT_Withdraw):
                return new WithdrawAction(this.creep, target as StructureContainer);
            default:
                return undefined;
        }
    }

    protected RunAction(actionType: ActionType, id: string) {
        let target = Game.getObjectById(id) as RoomObject | Creep;
        if (!target) {
            this.log.info(`KillProcess (EasyCreep.RunAction())`);
            this.kernel.killProcess(this.pid);
            this.sleeper.wake(this.parentPID);
            return;
        }

        let action: ActionBase | undefined = this.GetBasicAction(this.GetActionType(), target);

        if (action) {
            action.Run();
        } else {
            this.log.error(`EasyCreep action not found ${this.creep.name} -- pid(${this.pid} -- actoin${this.GetActionType()}`);
            this.kernel.killProcess(this.pid);
            this.sleeper.wake(this.parentPID);
        }
    }
    RunThread(): ThreadState {
        if (!this.creep || this.creep.spawning) {
            return ThreadState_Done;
        }

        if (this.creep.room.name != this.memory.l) {
            new MoveToPositionAction(this.creep, new RoomPosition(25, 25, this.memory.l)).Run();
            return ThreadState_Done;
        }

        let targetID = this.GetTargetID();
        if (!targetID) {
            this.log.info(`KillProcess (EasyCreep.RunThread())`);
            this.kernel.killProcess(this.pid);
            this.sleeper.wake(this.parentPID);
            return ThreadState_Done;
        }
        this.RunAction(this.GetActionType(), targetID);

        return ThreadState_Done;
    }
}