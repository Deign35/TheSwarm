/*export class StructureCreator {
    static CreateNewStructure(pos: RoomPosition, structureType: BuildableStructureConstant): boolean {
        let newFlagName = 'F:' + Memory.flagCount;
        let primaryColor = COLOR_WHITE;
        switch (structureType) {
            case (STRUCTURE_CONTAINER):
        }
        Game.rooms[pos.roomName].createFlag(pos, Memory.flagCount);
        for (let name in Game.flags) {
            let flag = Game.flags[name];
            let structureType = STRUCTURE_ROAD as BuildableStructureConstant;
            let numBuilders = 1;
            switch (flag.color) {
                case (COLOR_RED):
                    structureType = STRUCTURE_EXTENSION;
                    numBuilders = 4;
                    break;
                case (COLOR_WHITE):
                    structureType = STRUCTURE_ROAD
                    numBuilders = 1;
                    break;
                case (COLOR_BLUE):
                    structureType = STRUCTURE_TOWER;
                    numBuilders = 2;
                    break;
            }

            let createStructure = this.CreateNewStructure(structureType, flag.pos, numBuilders);
            if (createStructure == OK || createStructure == ERR_INVALID_ARGS) {
                flag.remove();
            }
        }

        return false;
    }


}
const StructColors = { }
StructColors[STRUCTURE_CONTAINER] = { primaryColor: COLOR_RED, secondaryColor: COLOR_RED }
StructColors[STRUCTURE_EXTENSION] = { primaryColor: COLOR_BLUE, secondaryColor: COLOR_BLUE }
export const StructureColors = StructColors;*/

// Perhaps a scheduler?  The flag thing maybe is backwards.  Go back to the construction overseer and have flags
// get saved as a future build based on time or RCL.