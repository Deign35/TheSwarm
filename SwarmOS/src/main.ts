declare var Memory: {
  VERSION: string;
  counter: number;
  lastPixel: number;
  
  roomData: RoomStateMemory;
}
const startLoad = Game.cpu.getUsed(); // Will not use any prototype defined version of getUsed
// Ensure all constants are initialized
require('globalConstants');

import "Tools/GlobalTools";
import "Tools/Prototypes";

// Update the OS as needed
const RESET_IN_SIM_ON_UPDATE = false;
if (!Memory.VERSION || Memory.VERSION != SWARM_VERSION_DATE) {
  console.log(`OS Version updated`);
  if (RESET_IN_SIM_ON_UPDATE && !!Game.rooms.sim) {
    console.log('SIM UPDATE RESET ENACTED');
    for (let id in Memory) {
      Memory[id] = undefined;
    }
    console.log(`SIM UPDATE RESET - Memory Cleaned`);
  }

  // Save the current memory to (segmented) Memory in case of a need to rollback.

  console.log(`Updating OS from ${Memory.VERSION} to ${SWARM_VERSION_DATE}`);
  Memory.counter = Memory.counter || 1;
  try {
    let oldVersion = Memory.VERSION;
    if (oldVersion) {
      const roomIDs = Object.keys(Memory.roomData.roomStateData);
      for (let i = 0; i < roomIDs.length; i++) {
        if(!Memory.roomData.roomStateData[roomIDs[i]].terminalRequests) {
          Memory.roomData.roomStateData[roomIDs[i]].terminalRequests = [];
        }
      }
      
    }
  } catch (ex) {
    console.log(`Failed to Update OS version ${ex}.`)
  }
  Memory.VERSION = SWARM_VERSION_DATE;
  console.log(`Updating OS complete`)
}

import { kernel } from "Core/index";

import { ActivitiesPackage } from "Activities/index";
import { BattlePackage } from "Battle/index";
import { JobsPackage } from "Jobs/index";
import { ManagersPackage } from "Managers/index";
import { RoomsPackage } from "Rooms/index";

kernel.installPackages([ActivitiesPackage, BattlePackage, JobsPackage, ManagersPackage, RoomsPackage]);

export function loop() {
  try {
    kernel.loop();
  } finally {
    kernel.log.DumpLogToConsole();
    if (Game.cpu.bucket >= 9500) {
      if (Game.cpu.generatePixel() == OK) {
        console.log(`Ticks between pixels: ${Game.time - Memory.lastPixel}`);
        Memory.lastPixel = Game.time;
      }
    }
  }
}

if (!Game.rooms['sim']) {
  kernel.log.info(() => `SwarmOS reloaded - Begin: ${startLoad}cpu`);
  kernel.log.info(() => `SwarmOS reloaded - Used: ${Game.cpu.getUsed() - startLoad}cpu`);
}