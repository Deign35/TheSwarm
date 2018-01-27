export class RoomResources {
    roomName: string;
    controllerLevel: number;
    controller_progress: number;
    //controller_needed: number;
    //controller_downgrade: number;
    //controller_blocked: number;
    //controller_safemode: number;
    //controller_safemode_avail: number;
    //controller_safemode_cooldown: number;
    energy_avail: number;
    //energy_cap: number;
    //num_sources: number;
    //source_energy: number;
    mineral_type?: string; // Type, should make structure consts an enum or const or something.
    mineral_amount?: number;
    //has_storage: boolean;
    storage_energy?: number;
    //storage_minerals?: number;
    //has_terminal: boolean;
    terminal_energy?: number;
    //terminal_minerals?: number;
    //num_containers: number;
    //container_energy: number;
    //num_links: number;
    link_energy: number;
    num_creeps: number;
    //creep_counts: number;
    //creep_energy: number;
    num_enemies: number;
    //num_spawns: number;
    //spawns_spawning: number;
    //num_towers: number;
    tower_energy: number;
    //structure_info: number; //nope
    //num_construction_sites: number;
    //num_my_construction_sites: number;
    //ground_resources: number;
    //num_source_containers: number;
    
    constructor(room: Room) {
        this.roomName = room.name;
        let roomController: StructureController;
        if(room.controller) {
            roomController = room.controller;
        } else {
            return;
        }
        this.controllerLevel = roomController.level;
        this.controller_progress = roomController.progress;
        this.energy_avail = room.energyAvailable;

        let minerals = room.find(FIND_MINERALS);
        if(minerals && minerals.length > 0) {
            this.mineral_type = minerals[0].mineralType;
            this.mineral_amount = minerals[0].mineralAmount;
        } else {
            this.mineral_type = undefined;
            this.mineral_amount = undefined;
        }

        if(room.storage) {
            this.storage_energy = room.storage.store[RESOURCE_ENERGY];
        }
        if(room.terminal) {
            this.terminal_energy = room.terminal.store[RESOURCE_ENERGY];
        }
        let links = room.find(FIND_STRUCTURES, (structure) => {
            return structure.structureType == STRUCTURE_LINK;
        });
        if(links && links.length > 0) {
            for(let link in links) {
                this.link_energy += (<StructureLink> links[link]).energy;
            }
        }
        this.num_creeps = room.find(FIND_CREEPS).length;
        this.num_enemies = room.find(FIND_HOSTILE_CREEPS).length;
        let towers = room.find(FIND_STRUCTURES, (structure) => {
            return structure.structureType == STRUCTURE_TOWER;
        });
        if(towers && towers.length > 0) {
            for(let tower in towers) {
                this.tower_energy += (<StructureTower> towers[tower]).energy;
            }
        }
    }
}