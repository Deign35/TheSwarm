import { ConsulBase } from "./ConsulBase";
import { OverseerBase } from "Overseers/OverseerBase";
import * as SwarmCodes from "Consts/SwarmCodes"
import _ from "lodash";
import { HarvestAction } from "Actions/HarvestAction";

const CONSUL_TYPE = 'H_Consul';
const SOURCE_DATA = 'S_DATA';
export class HarvestConsul extends ConsulBase implements IConsul {
    readonly consulType = CONSUL_TYPE;
    SourceData!: HarvestConsul_SourceData[];
    Save() {
        this.SetData(SOURCE_DATA, this.SourceData);
        super.Save();
    }

    Load() {
        if (!super.Load()) { throw 'Unable to load Harvest Consul for: ' + this.Overseer.Hive.name }

        this.SourceData = this.GetData(SOURCE_DATA);

        return true;
    }

    InitMemory() {
        super.InitMemory();
        this.ScanRoom();
    }

    ScanRoom(): void {
        if (!this.SourceData || this.SourceData.length == 0) {
            this.SourceData = [];
            let foundSources = this.Overseer.Hive.find(FIND_SOURCES);
            for (let i = 0, length = foundSources.length; i < length; i++) {
                this.SourceData.push(this.InitSourceData(foundSources[i]));
            }
        }

        for (let i = 0, length = this.SourceData.length; i < length; i++) {
            if (this.SourceData[i].harvester && !Game.creeps[this.SourceData[i].harvester as string]) {
                this.SourceData[i].harvester = undefined;
            }

            if (this.SourceData[i].constructionSite && !Game.getObjectById(this.SourceData[i].constructionSite)) {
                this.SourceData[i].constructionSite = undefined;
            }

            if (!this.SourceData[i].constructionSite) {
                // Find the right place to put the site.
            }

            if (this.SourceData[i].containerID && !Game.getObjectById(this.SourceData[i].containerID)) {
                this.SourceData[i].containerID = undefined;
            }
        }
    }

    DetermineRequirements(): void {
        // Calculates the distance to new sources
        // Orders creation of new screep so that they will arrive at the harvest node
        // just a few ticks before the previous one dies.
        throw new Error("Method not implemented.");
    }

    AssignCreepToSource(creepName: string): SwarmCodes.SwarmlingResponse {
        let index = 0;
        while (index < this.SourceData.length) {
            if (this.SourceData[index].harvester) {
                if (Game.getObjectById(this.SourceData[index].harvester) != undefined) {
                    continue;
                }
                // Release the creepName?
            }

            this.SourceData[index].harvester = creepName;
            return SwarmCodes.C_NONE;
        }

        return SwarmCodes.E_MISSING_TARGET;
    }

    CreateHarvestActionObject(data: HarvestConsul_SourceData) {
        let creep = Game.creeps[data.harvester as string];
        if (!creep) {
            return SwarmCodes.E_INVALID;
        }
        let source = Game.getObjectById(data.id);
        let action = new HarvestAction(creep, source as Source);

        return action;
    }

    protected InitSourceData(source: Source): HarvestConsul_SourceData {
        let sourceData = {} as HarvestConsul_SourceData;
        sourceData.x = source.pos.x;
        sourceData.y = source.pos.y;
        sourceData.id = source.id;
        sourceData.harvestRate = 0;
        sourceData.spawnBuffer = 0; // This is how soon a creep must be spawned to get to the source at the right moment.
        let structures = this.Overseer.Hive.lookForAtArea(LOOK_STRUCTURES,
            sourceData.y - 1, sourceData.x - 1,
            sourceData.y + 1, sourceData.x + 1, true);

        let container = _.filter(structures, (struct) => {
            return (struct.structure as Structure).structureType == STRUCTURE_CONTAINER;
        });

        sourceData.containerID = '';
        if (container.length > 0) {
            sourceData.containerID = (container[0].structure as Structure).id;
        } else {
            let constructionSites = this.Overseer.Hive.lookForAtArea(LOOK_CONSTRUCTION_SITES,
                sourceData.y - 1, sourceData.x - 1,
                sourceData.y + 1, sourceData.x + 1, true);
            let site = _.filter(constructionSites, (site) => {
                return (site.constructionSite as ConstructionSite).structureType == STRUCTURE_CONTAINER;
            });
            if (site.length > 0) {
                sourceData.constructionSite = (site[0].constructionSite as ConstructionSite).id;
            }
        }
        return sourceData;
    }

    protected PlaceConstructionSite(data: HarvestConsul_SourceData) {
        if (data.constructionSite || data.containerID) { return SwarmCodes.E_ACTION_UNNECESSARY; }
        // This should request the "designer" overseer to give it a location based on the rest of the rooms layout.
        return SwarmCodes.C_NONE;
    }

    static get ConsulType(): string { return CONSUL_TYPE; }
}