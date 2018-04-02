export class SwarmQueen {
    static ActivateTheSwarm() {
        DoTheSwarm((obj, controllerType) => {
            let swarmType = obj.GetSwarmType();
            if (swarmType == SwarmType.Any) {
                return;
            }
            obj.Activate();
        });
    }
}

const DoTheSwarm = function (swarmAction: (obj: TSwarmObject, controllerType: SwarmControllerDataTypes) => void) {
    let typeKeys = Object.keys(TheSwarm);
    for (let i = 0; i < typeKeys.length; i++) {
        let ids = Object.keys(TheSwarm[typeKeys[i]]);
        for (let j = 0; j < ids.length; j++) {
            swarmAction(TheSwarm[typeKeys[i]][ids[j]], typeKeys[i] as SwarmControllerDataTypes);
        }
    }
}