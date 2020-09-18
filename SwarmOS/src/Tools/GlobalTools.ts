declare var Memory: {
  counter: number,
}
import { Stopwatch } from "./Stopwatch";
global['Stopwatch'] = Stopwatch;

export class GlobalTools {
  static CopyObject<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }
  static GetSpawnCost(body: BodyPartConstant[]) {
    let bodyCost = 0;
    for (let i = 0; i < body.length; i++) {
      bodyCost += BODYPART_COST[body[i]]
    }

    return bodyCost;
  }
  static ConstructBodyArray(bodyPartsList: [BodyPartConstant, number][]): BodyPartConstant[] {
    const body: BodyPartConstant[] = [];
    for (let i = 0; i < bodyPartsList.length; i++) {
      for (let j = 0; j < bodyPartsList[i][1]; j++) {
        body.push(bodyPartsList[i][0]);
      }
    }

    return body;
  }

  static GetSUID() {
    return Memory.counter++;
  }

  static GetRandomIndex(list: any[]): number {
    if (!list || list.length == 0) {
      return 0;
    }

    return list[Math.floor(Math.random() * list.length)];
  }

  static GetRandomID<T>(dictionaryObject: SDictionary<T>): T | undefined {
    const index = this.GetRandomIndex(Object.keys(dictionaryObject));
    return (dictionaryObject && dictionaryObject[index]) || undefined;
  }
}

const boostResourceToPart: IDictionary<MineralBoostConstant, BodyPartConstant> = {
  [RESOURCE_UTRIUM_HYDRIDE]: ATTACK,
  [RESOURCE_UTRIUM_OXIDE]: WORK,
  [RESOURCE_KEANIUM_HYDRIDE]: CARRY,
  [RESOURCE_KEANIUM_OXIDE]: RANGED_ATTACK,
  [RESOURCE_LEMERGIUM_HYDRIDE]: WORK,
  [RESOURCE_LEMERGIUM_OXIDE]: HEAL,
  [RESOURCE_ZYNTHIUM_HYDRIDE]: WORK,
  [RESOURCE_ZYNTHIUM_OXIDE]: MOVE,
  [RESOURCE_GHODIUM_HYDRIDE]: WORK,
  [RESOURCE_GHODIUM_OXIDE]: TOUGH,

  [RESOURCE_UTRIUM_ACID]: ATTACK,
  [RESOURCE_UTRIUM_ALKALIDE]: WORK,
  [RESOURCE_KEANIUM_ACID]: CARRY,
  [RESOURCE_KEANIUM_ALKALIDE]: RANGED_ATTACK,
  [RESOURCE_LEMERGIUM_ACID]: WORK,
  [RESOURCE_LEMERGIUM_ALKALIDE]: HEAL,
  [RESOURCE_ZYNTHIUM_ACID]: WORK,
  [RESOURCE_ZYNTHIUM_ALKALIDE]: MOVE,
  [RESOURCE_GHODIUM_ACID]: WORK,
  [RESOURCE_GHODIUM_ALKALIDE]: TOUGH,

  [RESOURCE_CATALYZED_UTRIUM_ACID]: ATTACK,
  [RESOURCE_CATALYZED_UTRIUM_ALKALIDE]: WORK,
  [RESOURCE_CATALYZED_KEANIUM_ACID]: CARRY,
  [RESOURCE_CATALYZED_KEANIUM_ALKALIDE]: RANGED_ATTACK,
  [RESOURCE_CATALYZED_LEMERGIUM_ACID]: WORK,
  [RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE]: HEAL,
  [RESOURCE_CATALYZED_ZYNTHIUM_ACID]: WORK,
  [RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE]: MOVE,
  [RESOURCE_CATALYZED_GHODIUM_ACID]: WORK,
  [RESOURCE_CATALYZED_GHODIUM_ALKALIDE]: TOUGH,
}

global['ResourceToPart'] = boostResourceToPart;
global['CopyObject'] = GlobalTools.CopyObject;
global['GetSpawnCost'] = GlobalTools.GetSpawnCost;
global['ConstructBodyArray'] = GlobalTools.ConstructBodyArray;
global['GetSUID'] = GlobalTools.GetSUID;
global['GetRandomIndex'] = GlobalTools.GetRandomIndex;
global['GetRandomID'] = GlobalTools.GetRandomID;
global['MemoryCache'] = {};