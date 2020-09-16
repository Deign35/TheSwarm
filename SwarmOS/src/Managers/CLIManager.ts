declare var Memory: {
  CLI: SwarmCLIMemory;
  kernel: KernelMemory;
}

export const OSPackage: IPackage = {
  install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
    processRegistry.register(PKG_CLIManager, CLIManager);
  }
}

const PKG_CLIManager_LogContext: LogContext = {
  logID: PKG_CLIManager,
  logLevel: LOG_INFO
}

import { BasicProcess } from "Core/BasicTypes";

class CLIManager extends BasicProcess<SwarmCLIMemory, MemCache> {
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
  protected get logID(): string {
    return PKG_CLIManager_LogContext.logID;
  }
  protected get logLevel(): LogLevel {
    return PKG_CLIManager_LogContext.logLevel;
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
            if (cmd.args && cmd.args.length >= 2) {
              this.Assimilate(cmd.args);
            }
            break;
          case (CLI_CancelLabOrder):
            if (cmd.args && cmd.args.length == 2) {
              const roomData = this.roomManager.GetRoomData(cmd.args[0]);
              if (roomData) {
                roomData.labOrders.splice(cmd.args[1], 1);
              }
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
          case (CLI_LabOrder):
            if (cmd.args && cmd.args.length == 6) {
              const roomData = this.roomManager.GetRoomData(cmd.args[0]);
              if (roomData) {
                const lab1 = Game.getObjectById<StructureLab>(cmd.args[1]);
                if (!lab1 || lab1.structureType != STRUCTURE_LAB) {
                  this.log.error(`Couldn't find lab ${cmd.args[1]}.`);
                  break;
                }
                const lab2 = Game.getObjectById<StructureLab>(cmd.args[2]);
                if (!lab2 || lab2.structureType != STRUCTURE_LAB) {
                  this.log.error(`Couldn't find lab ${cmd.args[2]}.`);
                  break;
                }
                const lab3 = Game.getObjectById<StructureLab>(cmd.args[3]);
                if (!lab3 || lab3.structureType != STRUCTURE_LAB) {
                  this.log.error(`Couldn't find lab ${cmd.args[3]}.`);
                  break;
                }

                const mineral1 = cmd.args[4] as MineralConstant | MineralCompoundConstant;
                const mineral2 = cmd.args[5] as MineralConstant | MineralCompoundConstant;

                roomData.labOrders.push({
                  input_1: {
                    lab_id: cmd.args[1],
                    mineral: mineral1
                  },
                  input_2: {
                    lab_id: cmd.args[2],
                    mineral: mineral2
                  },
                  output_id: cmd.args[3]
                });
              }
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
        roomData.roomType = RT_Nuetral;
        break;
      case (RT_Home):
        roomData.roomType = RT_Home;
        break;
      case (RT_RemoteHarvest):
        if (args.length != 3) {
          this.log.warn(`Must provide a home room`);
          return;
        }
        const homeID: RoomID = args[2];
        const homeRoom = this.roomManager.GetRoomData(homeID);
        if (!homeRoom) {
          this.log.warn(`Cannot make ${roomID} into a harvest room for ${homeID}`);
          return;
        }

        roomData.roomType = RT_RemoteHarvest;
        roomData.homeRoom = homeID;
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
      const pid = this.kernel.startProcess(pkg, startMem);
      this.log.info(`New process(${pid}) created -- ${pkg}`)
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
  msg += "CLI_Assimilate: Add the assimilated room to the Swarm.\n";
  msg += "ex: CLI(CLI_Assimilate, \"W57S27\", RT_Home)\n\n";

  msg += "CLI_CancelLabOrder: Cancels a lab order from executing anymore.\n";
  msg += "ex: CLI(CLI_CancelLabOrder, \"W57S27\", 1)\n\n";
  msg += "This will delete the lab order at index 1 of the lab orders array.\n";

  msg += "CLIChangeFlag: Changes the color for all flags.\n";
  msg += "ex: CLI(CLI_ChangeFlag, COLOR_RED, COLOR_BLUE, COLOR_PURPLE, COLOR_ORANGE)\n";
  msg += "This will convert Red and Purple flags to Blue and Orange ones.\n\n";

  msg += "CLI_ClearLog: Clears the error log for the kernel.\n";
  msg += "CLI_Kill: Kills the provided process by PID.\n";
  msg += "CLI_LabOrder: Sets up an order for the labs of the specified room.\n";
  msg += "ex: CLI(CLI_LabOrder, \"sim\", 'b4963f6662d40cd168e27620', '106618ac400ab8a87fad9385', 'b66721e4563a947b63dd9b37', RESOURCE_HYDROGEN, RESOURCE_LEMERGIUM)\n\n"

  msg += "CLI_Launch: Launches a program.\n";
  msg += "ex: CLI(CLI_Launch, CPKG_Scout, { homeRoom: \"W57S27\", targetRoom: \"W57S26\", expires: true })\n\n";

  msg += "CLI_SetWallStrength: Sets the walls and ramparts strength for a room.\n";
  msg += "ex: CLI(CLI_SetWallStrength, \"W57S26\", 1000, 2000)\n";
  msg += "This will set wall strength to 1000 and rampart strength to 2000.\n\n";

  return msg;
}
global['help'] = help();


global['qb'] = function () {
  for (let roomID in Game.rooms) {
    if (Game.rooms[roomID].controller && Game.rooms[roomID].controller!.my) {
      CLI(CLI_Assimilate, roomID, RT_Home);
    }
  }
}