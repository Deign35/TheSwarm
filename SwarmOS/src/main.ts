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
import { CreepsPackage } from "Creeps/index";
import { ManagersPackage } from "Managers/index";
import { RoomsPackage } from "Rooms/index";

kernel.installPackages([ActivitiesPackage, BattlePackage, CreepsPackage, ManagersPackage, RoomsPackage]);

import { GenerateWallDistanceMatrix, GetDistancePeaks, ShrinkRoom, GenerateDistanceMatrix } from "Tools/RoomAlgorithms";

let acc = 0;
let num = 0;
const testRoom = 'off';
export function loop() {
  try {
    kernel.loop();
    if (Game.rooms[testRoom]) {
      const terrain = new Room.Terrain(testRoom);
      const start = performance.now();
      //const matrix = GenerateWallDistanceMatrix(terrain);
      //ShrinkRoom(matrix, 3);
      //const peaks = GetDistancePeaks(matrix);
      const matrix = GenerateDistanceMatrix(terrain, Game.rooms[testRoom].find(FIND_SOURCES)[0].pos);
      const peaks: number[] = [];
      const roomVisual = Game.rooms[testRoom].visual;
      for (let i = 0; i < matrix.length; i++) {
        if (matrix[i] == Infinity) { continue; }
        const x = Math.floor(i / 50);
        const y = i % 50;
        if (peaks.includes(i)) {
          roomVisual.text(matrix[i], x, y + 0.25, {
            color: "red"
          });
        } else {
          roomVisual.text(matrix[i], x, y + 0.25);
        }
      }

      const end = performance.now();
      num++;
      acc += (end - start);
      console.log(`Perf: ${(end - start).toFixed(3)} -- Avg: ${(acc / num).toFixed(3)}`);
    }
  } finally {
    kernel.log.DumpLogToConsole();
    if (Game.cpu.bucket >= 9500 && Game.cpu.generatePixel) {
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
} else {
  console.log("Sim reset");
}