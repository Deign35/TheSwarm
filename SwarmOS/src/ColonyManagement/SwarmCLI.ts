declare var Memory: {
    CLI: SwarmCLIMemory
}

export const OSPackage: IPackage<CreepRegistry_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(PKG_SwarmCLI, SwarmCLI);
    }
}

import { BasicProcess } from "Core/BasicTypes";
import { RoomActivityUtils } from "ColonyManagement/RoomUtils";

class SwarmCLI extends BasicProcess<SwarmCLIMemory> {
    @extensionInterface(EXT_CreepActivity)
    protected creepActivity!: ICreepActivityExtensions;
    @extensionInterface(EXT_CreepRegistry)
    protected creepRegistry!: ICreepRegistryExtensions;
    @extensionInterface(EXT_RoomView)
    protected View!: IRoomDataExtension;

    get memory(): SwarmCLIMemory {
        if (!Memory.CLI) {
            this.log.warn(`Initializing Command Line Interface memory`);
            Memory.CLI = {
                commands: []
            }
        }
        return Memory.CLI;
    }
    protected get commands() {
        return this.memory.commands;
    }

    // (TODO): Reset room.
    RunThread(): ThreadState {
        let cmd = this.commands.shift();
        if (cmd) {
            try {
                this.log.info(`Processing CLI_${cmd.command}(${JSON.stringify(cmd.args)})`)
                switch (cmd.command) {
                    case (CLI_Launch):
                        if (cmd.args && cmd.args.length == 2) {
                            this.LaunchProcess(cmd.args[0], cmd.args[1]);
                        }
                        break;
                    case (CLI_ChangeFlag):
                        if (cmd.args) {
                            if (cmd.args.length == 2) {
                                cmd.args.push(undefined);
                            }
                            if (cmd.args.length == 3) {
                                cmd.args.push(undefined);
                            }
                            this.ChangeFlagColors(cmd.args[0], cmd.args[1], cmd.args[2], cmd.args[3]);
                        }
                        break;
                    case (CLI_Assimilate):
                        this.Assimilate(cmd.args);
                        break;
                    default:
                        break;
                }

            } catch (ex) {
                this.log.warn(`CLI Command(${cmd.command}) failed with args {${JSON.stringify(cmd.args)}} `);
            }
        }
        return this.commands.length > 0 ? ThreadState_Active : ThreadState_Done;
    }
    LaunchProcess(pkg: ScreepsPackage, startMem: any) {
        try {
            this.kernel.startProcess(pkg, startMem);
        } catch (ex) {
            this.log
        }
    }
    ChangeFlagColors(priA: ColorConstant, priB: ColorConstant, secA?: ColorConstant, secB?: ColorConstant) {
        let flagIDs = Object.keys(Game.flags);
        for (let i = 0; i < flagIDs.length; i++) {
            let flag = Game.flags[flagIDs[i]];
            this.log.info(`Checking flag(${flag.name}`);
            if (flag.color == priA) {
                if (!secA || flag.secondaryColor == secA) {
                    this.log.info(`PrimaryMatch`)
                    if (secB) {
                        flag.setColor(priB, secB);
                    } else {
                        flag.setColor(priB, flag.secondaryColor);
                    }
                }
            }
        }
    }

    Assimilate(args: any[]) {
        if (args.length < 2) {
            this.log.warn(`Invalid number of arguments`);
            return;
        }
        let roomID: RoomID = args[0];
        let roomData = this.View.GetRoomData(roomID);
        if (!roomData) {
            this.log.warn(`Cannot assimilate a room that has yet to be seen`);
            return;
        }

        let roomType: RoomType = args[1];
        if (roomData.RoomType.type == roomType) {
            this.log.info(`Room already assimilated as ${roomType}`);
            return;
        }
        switch (roomType) {
            case (RT_None):
                if (roomID == 'sim') {
                    this.View.BootRoom('sim', true);
                }
                break;
            case (RT_Home):
                let bootMem: BootstrapRefiller_Memory = {
                    exp: true,
                    rID: roomID,
                    tr: roomID,
                }
                this.kernel.startProcess(CJ_BootRefill, bootMem);
                // Add home room
                roomData.RoomType = {
                    type: RT_Home,
                    other: {
                        tr: roomID
                    }
                }
                // (TODO): Doesn't work if i can't see the room.  Should make this an activity to be launched.
                RoomActivityUtils.BootRoom(Game.rooms[roomID]);
                break;
            case (RT_RemoteHarvest):
                if (args.length != 3) {
                    this.log.warn(`Invalid number of arguments`);
                    return;
                }
                let homeID: RoomID = args[2];
                let homeRoom = this.View.GetRoomData(homeID);
                if (!homeRoom) { // || homeRoom.IsHomeRoom
                    this.log.warn(`Cannot make ${roomID} into a harvest room for ${homeID}`);
                    return;
                }
                // Add as remote harvest room to homeRoom
                break;
        }
    }
}

global['CLI'] = function (command: CLI_Command, ...args: any[]) {
    Memory.CLI.commands.push({ command, args });
    return OK;
}

global['qb'] = function () {
    CLI(CLI_Assimilate, 'sim', RT_Home);
}

global['rb'] = function () {
    CLI(CLI_Assimilate, 'sim', RT_None);

}