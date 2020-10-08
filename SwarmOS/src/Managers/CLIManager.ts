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
                const labOrder = roomData.labOrders[cmd.args[1]];
                if (!labOrder) {
                  this.log.info(`CancelLabOrder failed to find the provided lab order`);
                }
                const lab2 = labOrder.lab_2;
                const lab3 = labOrder.lab_3;
                roomData.labOrders[cmd.args[1]] = {
                  amount: 0,
                  resourceType: RESOURCE_ENERGY
                }

                if (lab2) {
                  roomData.labOrders[lab2] = {
                    amount: 0,
                    resourceType: RESOURCE_ENERGY
                  }
                }

                if (lab3) {
                  roomData.labOrders[lab3] = {
                    amount: 0,
                    resourceType: RESOURCE_ENERGY
                  }
                }
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
            if (cmd.args && cmd.args.length >= 3) {
              const roomData = this.roomManager.GetRoomData(cmd.args[0]);
              if (roomData) {
                roomData.labRequests.push({
                  amount: cmd.args[2],
                  resourceType: cmd.args[1],
                  reverseReaction: cmd.args.length == 4 ? cmd.args[3] : false
                });
              }
            }
            break;
          case (CLI_Launch):
            if (cmd.args && cmd.args.length == 2) {
              this.LaunchProcess(cmd.args[0], cmd.args[1]);
            }
            break;
          case (CLI_RemoveBoostAssignemnt):
            if (cmd.args && cmd.args.length == 2) {
              const roomData = this.roomManager.GetRoomData(cmd.args[0]);
              if (roomData) {
                const pkg = cmd.args[1];
                delete roomData.boostAssignments[pkg];
              }
            }
            break;
          case (CLI_SetBoostAssignment):
            if (cmd.args && cmd.args.length == 3) {
              const roomData = this.roomManager.GetRoomData(cmd.args[0]);
              if (roomData) {
                const pkg = cmd.args[1];
                const boost = cmd.args[2];
                if (!roomData.boostAssignments[pkg]) {
                  roomData.boostAssignments[pkg] = [];
                }
                roomData.boostAssignments[pkg].push(boost);
              }
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
        case (RT_Home):
        roomData.roomType = roomType;
        break;
      case (RT_RemoteHarvest):
      case (RT_InProgress):
        if (args.length != 3) {
          this.log.warn(`Must provide a home room`);
          return;
        }
        const homeID: RoomID = args[2];
        const homeRoom = this.roomManager.GetRoomData(homeID);
        if (!homeRoom) {
          this.log.warn(`Couldn't find roomData for ${roomID}`);
          return;
        }

        roomData.roomType = roomType;
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
  msg += "ex: CLI(CLI_CancelLabOrder, \"W57S27\", \"5f656c1592b2f35a3b3e4c73\")\n";
  msg += "This will delete the lab order for the specified lab.\n\n";

  msg += "CLIChangeFlag: Changes the color for all flags.\n";
  msg += "ex: CLI(CLI_ChangeFlag, COLOR_RED, COLOR_BLUE, COLOR_PURPLE, COLOR_ORANGE)\n";
  msg += "This will convert Red and Purple flags to Blue and Orange ones.\n\n";

  msg += "CLI_ClearLog: Clears the error log for the kernel.\n";
  msg += "CLI_Kill: Kills the provided process by PID.\n";
  msg += "CLI_LabOrder: Sets up an order for the labs of the specified room.\n";
  msg += "ex: CLI(CLI_LabOrder, \"sim\", RESOURCE_GHODIUM_OXIDE, 500, false)\n";
  msg += "This will set up a lab order to create 500 ghodium oxide.\n\n";

  msg += "CLI_Launch: Launches a program.\n";
  msg += "ex: CLI(CLI_Launch, CPKG_Scout, { homeRoom: \"W57S27\", targetRoom: \"W57S26\" })\n\n";

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