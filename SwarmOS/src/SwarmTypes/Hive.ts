export class HiveNode extends Room {
    RoomSources: Source[];
    NodeInfo: { [name: string]: any };

    InitHiveNode() {
        let hr = 0;
        if (!this.NodeInfo) {
            this.NodeInfo = Memory.hives[this.name];

            if (!this.NodeInfo) {
                this.NodeInfo = {}
                let foundSources = this.find(FIND_SOURCES) as Source[];

                this.NodeInfo['sources'] = [];
                while (foundSources.length != 0) {
                    this.NodeInfo['sources'].push(foundSources.splice(0, 1)[0].id);
                }
                if (this.controller) {
                    this.NodeInfo['mineral'] = this.controller.pos.findClosestByRange(FIND_MINERALS);
                }
            }
        }
        return hr;
    }
}
export class Hive extends HiveNode {
    ControlledNodes: HiveNode[];

    CommandHive() {

    }
}