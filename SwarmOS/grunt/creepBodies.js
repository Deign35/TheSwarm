module.exports = {
    compileCreepDef: function (creepDef, ctID, refPrefix) {
        var compiled = []
        var creepEntries = creepDef.entries.length;
        for (var bodyIndex = 0; bodyIndex < creepEntries; bodyIndex++) {
            var bodyEntry = creepDef.entries[bodyIndex];

            compiled.push(this.compileCreepBody(bodyEntry, ctID, bodyIndex, this.MakeNewRefID(refPrefix, bodyIndex), creepDef.packageID));
        }
        return compiled;
    },
    compileCreepBody: function (bodyDef, ctID, lvl, refPrefix, packageID) {
        var bodyString = '{';
        var components = Object.keys(bodyDef);
        var bodyCost = 0;
        for (var compIndex = 0; compIndex < components.length; compIndex++) {
            var compID = components[compIndex];
            bodyString += compID + ':' + bodyDef[compID] + ',';
            if (this.BODYPART_COST[compID]) {
                bodyCost += bodyDef[compID] * this.BODYPART_COST[compID];
            }
        }

        bodyString += 'cost:' + bodyCost + ',lvl:' + lvl + ',ct_ID:' + ctID + ',ctref_ID:' + refPrefix + '}';
        return bodyString;
    },

    MakeNewRefID: function (prefix, bodyIndex) {
        return prefix + '_' + bodyIndex;
    },
    BODYPART_COST: {
        "m": 50,
        "w": 100,
        "a": 80,
        "c": 50,
        "h": 250,
        "r": 150,
        "t": 10,
        "cl": 600
    }
};