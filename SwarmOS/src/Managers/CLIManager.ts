declare var Memory: {
  CLI: SwarmCLIMemory
}

export const OSPackage: IPackage = {
  install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
    processRegistry.register(PKG_CLIManager, CLIManager);
  }
}

import { BasicProcess } from "Core/BasicTypes";

class CLIManager extends BasicProcess<SwarmCLIMemory> {
  @extensionInterface(EXT_RoomManager)
  roomManager!: IRoomManagerExtension;
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

  RunThread(): ThreadState {
    const cmd = this.commands.shift();
    if (cmd) {
      try {
        this.log.info(`Processing CLI_${cmd.command}(${JSON.stringify(cmd.args)})`)
        switch (cmd.command) {
          case (CLI_Assimilate):
            if (cmd.args && cmd.args.length == 2) {
              this.Assimilate(cmd.args);
            }
            break;
          case (CLI_ClearLog):
            this.kernel.clearErrorLog();
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
          case (CLI_Kill):
            if (cmd.args && cmd.args.length == 1) {
              this.KillProcess(cmd.args[0]);
            }
            break;
          case (CLI_Launch):
            if (cmd.args && cmd.args.length == 2) {
              this.LaunchProcess(cmd.args[0], cmd.args[1]);
            }
            break;
          case (CLI_SetWallStrength):
            if (cmd.args && cmd.args.length == 3) {
              let roomData = this.roomManager.GetRoomData(cmd.args[0]);
              if (roomData) {
                if (typeof cmd.args[1] == 'number') {
                  roomData.wallStrength = cmd.args[1];
                }
                if (typeof cmd.args[2] == 'number') {
                  roomData.rampartStrength = cmd.args[2];
                }
              }
            }
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

  Assimilate(args: any[]) {
    if (args.length < 2) {
      this.log.warn(`Invalid number of arguments`);
      return;
    }
    const roomID: RoomID = args[0];
    const roomData = this.roomManager.GetRoomData(roomID);
    if (!roomData) {
      this.log.warn(`Cannot assimilate a room that has yet to be seen`);
      return;
    }

    const roomType: RoomType = args[1];
    if (roomType != 0 && roomData.roomType == roomType) {
      this.log.info(`Room already assimilated as ${roomType}`);
      return;
    }
    switch (roomType) {
      case (RT_Nuetral):
        break;
      case (RT_Home):
        roomData.roomType = RT_Home;
        break;
      case (RT_RemoteHarvest):
        if (args.length != 3) {
          this.log.warn(`Invalid number of arguments`);
          return;
        }
        roomData.roomType = RT_RemoteHarvest;
        const homeID: RoomID = args[2];
        const homeRoom = this.roomManager.GetRoomData(homeID);
        if (!homeRoom) { // || homeRoom.IsHomeRoom
          this.log.warn(`Cannot make ${roomID} into a harvest room for ${homeID}`);
          return;
        }
        // Add as remote harvest room to homeRoom
        break;
    }
  }

  ChangeFlagColors(priA: ColorConstant, priB: ColorConstant, secA?: ColorConstant, secB?: ColorConstant) {
    const flagIDs = Object.keys(Game.flags);
    for (let i = 0; i < flagIDs.length; i++) {
      const flag = Game.flags[flagIDs[i]];
      this.log.info(`Checking flag(${flag.name})`);
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
  KillProcess(pid: PID) {
    try {
      this.kernel.killProcess(pid);
    } catch (ex) {
      this.log.error(ex);
    }
  }
  LaunchProcess(pkg: ScreepsPackage, startMem: any) {
    try {
      this.kernel.startProcess(pkg, startMem);
    } catch (ex) {
      this.log.error(ex);
    }
  }
}

global['CLI'] = function (command: CLI_Command, ...args: any[]) {
  Memory.CLI.commands.push({ command, args });
  return OK;
}

const help = function () {
  let msg = "SwarmOS 2.0 commands:\n";
  msg += "CLI_Assimilate: Add the assimilated room to the Swarm.\n"
  msg += "ex: CLI(CLI_Assimilate, \"W57S27\", RT_Home)\n\n";

  msg += "CLIChangeFlag: Changes the color for all flags.\n";
  msg += "ex: CLI(CLI_ChangeFlag, COLOR_RED, COLOR_BLUE, COLOR_PURPLE, COLOR_ORANGE)\n";
  msg += "This will convert Red and Purple flags to Blue and Orange ones.\n\n";

  msg += "CLI_ClearLog: Clears the error log for the kernel.\n";
  msg += "CLI_Kill: Kills the provided process by PID.\n";
  msg += "CLI_Launch: Launches a program.\n";
  msg += "ex: CLI(CLI_Launch, CPKG_Scout, { roomID: \"W57S27\", targetRoom: \"W57S26\" })\n\n";

  msg += "CLI_SetWallStrength: Sets the walls and ramparts strength for a room.\n";
  msg += "ex: CLI(CLI_SetWallStrength, \"W57S26\", 1000, 2000)\n";
  msg += "This will set wall strength to 1000 and rampart strength to 2000.\n\n";

  return msg;
}
global['help'] = help();


global['qb'] = function () {
  CLI(CLI_Assimilate, 'sim', RT_Home);
}

/*
global['rb'] = function () {
  CLI(CLI_Assimilate, 'sim', RT_None);
}*/