import { SwarmItem } from "SwarmObjects/SwarmObject";
import { SwarmCreep } from "SwarmObjects/SwarmCreep";
import { MakeSwarmStorage } from "./SwarmStructure";
import { MakeSwarmSite } from "./SwarmSite";

export class SwarmCreator {
    CreateSwarmObject<T extends Source | Creep
        | Structure | Mineral | Resource
        | ConstructionSite | Nuke | Tombstone>(obj: T): TSwarmObject<T> {
        if ((obj as Structure).hits) {
            return (MakeSwarmSite(obj as ConstructionSite) as TSwarmObject<T>);
        }

        throw "poo";
    }
}