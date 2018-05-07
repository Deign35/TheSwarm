import { profile } from "Tools/Profiler";
import { OwnedSwarmStructure } from "SwarmTypes/SwarmStructures/SwarmStructure";
import { SwarmLoader } from "../SwarmLoader";

const FLASH_CAN_SPAWN = 'canSpawn';
const FLASH_CURRENT_REQUEST = 'curRequest';

const TEST_SPAWN_NAME = 'testCreep';
declare interface SpawnData {
    [FLASH_CAN_SPAWN]: any
    [FLASH_CURRENT_REQUEST]: any
}
declare interface SpawnRequest {
    requestor: string,
    requestorType: string,
    priority: Priority,
    body: BodyPartConstant[],
    chosenName?: string,
    energyStructures?: Array<(StructureSpawn | StructureExtension)>,
    directions?: DirectionConstant[],
    startMemory?: TCreepData
}
@profile
export class SwarmSpawn extends OwnedSwarmStructure<STRUCTURE_SPAWN, StructureSpawn>
    implements AISpawn, StructureSpawn, SpawnData {
    RefreshObject(): void {
        throw new Error("Method not implemented.");
    }
    FinalizeObject(): void {
        throw new Error("Method not implemented.");
    }
    AssignCreep(name: string): boolean {
        throw new Error("Method not implemented.");
    }
    Activate() {
        if (this.memory.HasData(FLASH_CURRENT_REQUEST)) {
            let request = this.memory.GetData<SpawnRequest>(FLASH_CURRENT_REQUEST);
            let newName = GetSUID();
            if (this._instance.spawnCreep(request.body, newName, request) == OK) {
                let requestor = SwarmLoader.GetObject(request.requestor, request.requestorType);
                requestor.AssignCreep(newName);
            } else {
                //RecycleSUID(newName);
            }
            this.memory.DeleteData(FLASH_CURRENT_REQUEST);
        }
    }
    get canSpawn() {
        return this.memory.GetData<boolean>(FLASH_CAN_SPAWN);
    }
    get energy() { return this._instance.energy; }
    get energyCapacity() { return this._instance.energyCapacity; }
    get name() { return this._instance.id; }
    get spawning() { return this._instance.spawning; }
    get curRequest() { return this.memory.GetData<SpawnRequest>(FLASH_CURRENT_REQUEST); }

    spawnCreep(body: BodyPartConstant[], name: string | undefined, opts: {
        memory?: TCreepData,
        energyStructures?: Array<(StructureSpawn | StructureExtension)>,
        directions?: DirectionConstant[],
        priority: Priority,
        requestorType: string,
        requestorID: string
    }) {
        if (this._instance.spawnCreep(body, TEST_SPAWN_NAME, { dryRun: true }) == OK) {
            let replaceCurSpawn = true;
            if (this.memory.HasData(FLASH_CURRENT_REQUEST)) {
                replaceCurSpawn = opts.priority > this.curRequest.priority;
            }

            if (replaceCurSpawn) {
                this.memory.SetData(FLASH_CURRENT_REQUEST, {
                    body: body,
                    chosenName: name,
                    priority: opts.priority,
                    requestor: opts.requestorID,
                    requestorType: opts.requestorType,
                    directions: opts.directions,
                    energyStructures: opts.energyStructures,
                    startMemory: opts.memory
                }, false);
                return OK;
            }
        }
        return E_REQ_REJECTED as ScreepsReturnCode;
    }
    recycleCreep(target: Creep) { return this._instance.recycleCreep(target); }
    renewCreep(target: Creep) { return this._instance.renewCreep(target); }
}