import { SwarmMemory } from "Memory/SwarmMemory";
import { BasicCreepCommandType } from "SwarmEnums";
import * as _ from "lodash";

const HIVE_TARGETS = 'HT';
const LAST_UPDATE = 'LU';
const TARGET_COUNTS = 'TC';

const BUILD_PROGRESS = 'BP';
const BUILD_TOTAL = 'BT';
const CARRY_DATA = 'CD';
const CONTROLLER_LEVEL = 'CL';
const CONTROLLER_PROGRESS = 'CP';
const COOLDOWN = 'CO';
const HELD_ENERGY = 'HE';
const HITS = 'Ht';
const HITS_MAX = 'HM';
const MINERAL_TYPE = 'MT';
const RESOURCE_THROUGHPUT = 'RT';
const RESOURCE_THROUGHPUT_RATE = 'RR';
const SPAWNING = 'Sp';
const TARGET_FACTOR = 'TF';
const TARGET_MAX = 'TM';
const TARGET_TOTAL = 'TT';
const TICKS_TO_DECAY = 'TD';

declare var Array: any;
export class Hivelord extends SwarmMemory { // One per room.
    // Targetting
    HiveTargets: { [id: number]: { [id: string]: any } };
    TargetCounts: { [id: string]: any };

    Save() {
        this.SetData(HIVE_TARGETS, this.HiveTargets);
        this.SetData(TARGET_COUNTS, this.TargetCounts);
        super.Save();
    }
    Load() {
        super.Load();
        this.HiveTargets = this.GetData(HIVE_TARGETS) || {};
        this.TargetCounts = this.GetData(TARGET_COUNTS) || {};
    }

    UpdateTargets(foundTargets: any[], findID: FindConstant) {
        let foundIDs = [];
        for (let i = 0, length = foundTargets.length; i < length; i++) {
            foundIDs.push(foundTargets[i].id);
            this.UpdateTarget(foundTargets[i], findID);
            if(!this.TargetCounts[foundTargets[i].id]) {
                let newTargetCounts: {[name: string]: any} = {};
                newTargetCounts[TARGET_TOTAL] = 0;
                newTargetCounts[TARGET_MAX] = 99;
                newTargetCounts[TARGET_FACTOR] = 1;
                this.TargetCounts[foundTargets[i].id] = newTargetCounts;
            }
        }
    }

    UpdateTarget(target: any, findID: FindConstant) {
        let targetData = this.HiveTargets[findID][target.id] || {};

        switch (findID) {
            case (FIND_CREEPS):  // FIND_CREEPS should split save to FIND_MY and FIND_HOSTILE.  Or error for this?
            case (FIND_MY_CREEPS):
            case (FIND_HOSTILE_CREEPS):
                targetData[TICKS_TO_DECAY] = (target as Creep).ticksToLive;
                break;
            case (FIND_SOURCES):
                targetData[HELD_ENERGY] = (target as Source).energy;
                targetData[RESOURCE_THROUGHPUT].push((target as Source).energy / (target as Source).ticksToRegeneration * 10);
                if (targetData[RESOURCE_THROUGHPUT].length > 10) {
                    targetData[RESOURCE_THROUGHPUT] = targetData[RESOURCE_THROUGHPUT].slice(1);
                }

                targetData[RESOURCE_THROUGHPUT_RATE] = _.sum(targetData[RESOURCE_THROUGHPUT]) / targetData[RESOURCE_THROUGHPUT].length;
                // A goal of <= 1 is desired.  Anything higher than that and it means we're not getting full utilization of the source.
                break;
            case (FIND_DROPPED_RESOURCES): console.log('NOT SETUP YET'); break;
            case (FIND_STRUCTURES):
            case (FIND_MY_STRUCTURES):
            case (FIND_HOSTILE_STRUCTURES):
                if (!this.HiveTargets[findID][target.structureType]) {
                    this.HiveTargets[findID][target.structureType] = {};
                }
                this.HiveTargets[findID][target.structureType][target.id] = this.UpdateStructureData(target);
                return; // Can't do the same as FIND_CREEPS because of roads and containers.
            case (FIND_CONSTRUCTION_SITES): // Same as FIND_CREEPS
            case (FIND_MY_CONSTRUCTION_SITES):
            case (FIND_HOSTILE_CONSTRUCTION_SITES):
                targetData[BUILD_PROGRESS] = (target as ConstructionSite).progress;
                targetData[BUILD_TOTAL] = (target as ConstructionSite).progressTotal;
                break;
            case (FIND_MY_SPAWNS):
            case (FIND_HOSTILE_SPAWNS):
                targetData[HELD_ENERGY] = (target as StructureSpawn).energy;
                targetData[SPAWNING] = (target as StructureSpawn).spawning;
                break;
            case (FIND_MINERALS):
                targetData[HELD_ENERGY] = (target as Mineral).mineralAmount;
                targetData[MINERAL_TYPE] = (target as Mineral).mineralType;
                break;
        }

        this.HiveTargets[findID][target.id] = targetData;
    }

    UpdateStructureData(target: Structure) {
        let targetData: { [name: string]: any } = {};
        targetData[HITS] = target.hits;
        targetData[HITS_MAX] = target.hitsMax;
        switch (target.structureType) {
            case (STRUCTURE_CONTAINER):
                targetData[TICKS_TO_DECAY] = (target as StructureContainer).ticksToDecay;
                targetData[CARRY_DATA] = (target as StructureContainer).store;
                targetData[HELD_ENERGY] = (target as StructureContainer).store.energy;
                break;
            case (STRUCTURE_CONTROLLER):
                targetData[TICKS_TO_DECAY] = (target as StructureController).ticksToDowngrade;
                targetData[CONTROLLER_LEVEL] = (target as StructureController).level;
                targetData[CONTROLLER_PROGRESS] = (target as StructureController).progress;
                break;
            case (STRUCTURE_EXTENSION):
                targetData[HELD_ENERGY] = (target as StructureExtension).energy;
                break;
            case (STRUCTURE_LINK):
                targetData[HELD_ENERGY] = (target as StructureLink).energy;
                targetData[COOLDOWN] = (target as StructureLink).cooldown;
                break;
            case (STRUCTURE_ROAD):
                targetData[TICKS_TO_DECAY] = (target as StructureRoad).ticksToDecay;
                break;
            case (STRUCTURE_SPAWN):
                targetData[SPAWNING] = (target as StructureSpawn).spawning;
                targetData[HELD_ENERGY] = (target as StructureSpawn).energy;
                break;
            case (STRUCTURE_STORAGE):
                targetData[CARRY_DATA] = (target as StructureStorage).store;
                targetData[HELD_ENERGY] = (target as StructureStorage).store.energy;
                break;
            case (STRUCTURE_TOWER):
                targetData[HELD_ENERGY] = (target as StructureTower).energy;
                break;
            default: console.log('NOT IMPLEMENTED');
        }

        return targetData;
    }

    FindTarget(forPos: RoomPosition, findID: FindConstant, structureType?: StructureConstant) {
        if (!this.HiveTargets[findID] || (this.HiveTargets[findID][LAST_UPDATE] - Game.time < -5)) { // Updates at most once every 6 ticks.  CAREFUL WHEN CHANGING
            this.HiveTargets[findID][LAST_UPDATE] = Game.time;
            let foundTargets = Game.rooms[this.ParentMemoryID].find(findID);
            if(foundTargets.length == 0) {
                return undefined;
            }
            this.UpdateTargets(foundTargets, findID);
        }

        let sortFunc = (a: any, b: any) => {
            let aData = this.TargetCounts[a.id] ;
            let countA = aData[TARGET_TOTAL];
            if (countA >= aData[TARGET_MAX]) {
                return 1;
            }
            if (aData[TARGET_FACTOR]) {
                countA *= aData[TARGET_FACTOR];
                countA += aData[TARGET_FACTOR];
            }
            let bData = this.TargetCounts[b.id]
            let countB = bData[TARGET_TOTAL];
            if (countB >= bData[TARGET_MAX]) {
                return 1;
            }
            if (bData[TARGET_FACTOR]) {
                countB *= bData[TARGET_FACTOR];
                countB += bData[TARGET_FACTOR];
            }
            if (countA > countB) {
                return 1
            } else if (countA < countB) {
                return -1;
            }
            var distA = forPos.findPathTo(a).length;
            var distB = forPos.findPathTo(b).length;
            if(distA == 0) {
                return 1;
            }
            if(distB == 0) {
                return -1;
            }
            return distA < distB ? -1 : (distA > distB ? 1 : 0);
        }

        let targets;
        if ((findID == FIND_STRUCTURES || findID == FIND_MY_STRUCTURES || findID == FIND_HOSTILE_STRUCTURES) && structureType) {
            targets = this.HiveTargets[findID][structureType];
        } else {
            targets = this.HiveTargets[findID];
        }

        let possibleTargets: any[] = Array.from(targets);
        switch (findID) {
            case (FIND_CREEPS):
            case (FIND_MY_CREEPS):
            case (FIND_HOSTILE_CREEPS): break;
            case (FIND_SOURCES): console.log('Better load balancing required'); break;
            case (FIND_DROPPED_RESOURCES): console.log('NOT SETUP YET'); break;
            case (FIND_STRUCTURES):
            case (FIND_MY_STRUCTURES):
            case (FIND_HOSTILE_STRUCTURES): console.log('NOT SETUP YET'); break;
            case (FIND_CONSTRUCTION_SITES): // Same as FIND_CREEPS
            case (FIND_MY_CONSTRUCTION_SITES):
            case (FIND_HOSTILE_CONSTRUCTION_SITES): console.log('NOT SETUP YET'); break;
            case (FIND_MY_SPAWNS):
            case (FIND_HOSTILE_SPAWNS): console.log('NOT SETUP YET'); break;
            case (FIND_MINERALS): break;
        }

        possibleTargets.sort(sortFunc);
        return possibleTargets[0];
    }
}