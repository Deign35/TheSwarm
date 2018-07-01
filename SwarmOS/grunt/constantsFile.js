const primeFunctionality = require('./primes');
const bodyMaker = require('./creepBodies');

module.exports = {
    g_file: [],
    d_file: [],
    gObj: undefined,
    declareString: function (id, val, type, connectSymbol) {
        return 'declare ' + type + ' ' + id + connectSymbol + val;
    },

    setConst: function (id, val) {
        return "const " + id + " = " + val + ";";
    },
    setGlobal: function (id, val) {
        return "global[\"" + id + "\"] = " + val + "; ";
    },
    compileConstDef: function (id, constDef) {
        if (!constDef.enabled || constDef.entries.length == 0) {
            return;
        }

        if (constDef.comment) {
            this.g_file.push("/** " + constDef.comment + " */");
        }

        var entryIDs = [];
        for (var entryID in constDef.entries) {
            var constName = id + "_" + entryID;
            var constVal = constDef.entries[entryID];
            if (constDef.isArray) {
                constName = id + "_" + constVal;
            }
            entryIDs.push(constName);

            if (constDef.usePrefix) {
                constVal = id + "_" + constVal;
            }
            if (constDef.string) {
                constVal = "\"" + constVal + "\"";
            }

            this.g_file.push(this.setGlobal(constName, constVal));
            this.d_file.push(this.declareString(constName, constVal, 'const', ' = '));
            if (constDef.type) {
                this.d_file.push(this.declareString(constName, constVal, 'type', ' = '));
            }
        }
        if (constDef.combinedType) {
            var combinedTypeVal = "";
            for (var entryIndex = 0; entryIndex < entryIDs.length; entryIndex++) {
                combinedTypeVal += entryIDs[entryIndex] + " | ";
            }
            this.d_file.push(this.declareString(constDef.combinedType, combinedTypeVal.slice(0, -3), 'type', ' = '));
        }
        this.g_file.push('');
    },
    OutputBodyDefs: function (creepID, defEntries) {
        let combinedBodyTypeDef = '';

        let bodies = {};
        for (var entryID = 0; entryID < defEntries.length; entryID++) {
            var bodyID = creepID + '_' + entryID;
            var bodyEntry = defEntries[entryID];

            combinedBodyTypeDef += bodyID + ' | ';
            bodies[bodyID] = bodyEntry;

            this.d_file.push(this.declareString(bodyID, bodyEntry, 'const', ': '));
            this.d_file.push(this.declareString(bodyID, bodyEntry, 'type', ' = '));
        }

        this.d_file.push(this.declareString(creepID + '_ALL', combinedBodyTypeDef.slice(0, -3), 'type', ' = '));
    },
    OutputAllCreepDefinitions: function (globalFile, declarationsFile) {
        this.g_file = globalFile;
        this.d_file = declarationsFile;
        var creepBodies = require("../CreepBodies.json");
        var declIDs = Object.keys(creepBodies);
        if (declIDs.length == 0) {
            return;
        }
        this.g_file.push("// Begin creep definitions");

        var defs = {};
        var fullObjectString = '{';
        var fullObjectTypeString = '';
        var fullDefinitionsTypeString = '';
        var fullReferencesTypeString = '';

        for (var declID = 0; declID < declIDs.length; declID++) {
            var creepID = declIDs[declID];
            var quotedCreepID = "\"" + creepID + "\"";
            // Creep type ID corresponding to the definition id
            var CT_id = 'CT_' + creepID; // Const for the string
            // Definition id corresponding to the body definition
            var DEFINITION_id = 'DEFINITION_' + creepID;
            // Reference id corresponding to a specific DEFINITION_id and index
            var REFERENCE_id = 'CTREF_' + creepID;

            this.g_file.push(this.setGlobal(CT_id, quotedCreepID));

            this.d_file.push(this.declareString(CT_id, quotedCreepID, 'const', ' = '));
            this.d_file.push(this.declareString(CT_id, quotedCreepID, 'type', ' = '));
            fullObjectTypeString += CT_id + ' | ';

            fullObjectString += creepID + ':' + DEFINITION_id + ',';
            fullDefinitionsTypeString += DEFINITION_id + ' | ';

            defs[creepID] = bodyMaker.compileCreepDef(creepBodies[creepID], CT_id, REFERENCE_id);

            let combinedType = '';
            for (var entryIndex = 0; entryIndex < defs[creepID].length; entryIndex++) {
                var bodyID = bodyMaker.MakeNewRefID(REFERENCE_id, entryIndex);
                combinedType += bodyID + ' | ';

                var bodyAttributes = '{CT_id:' + CT_id + ', lvl:' + entryIndex + '}';
                this.g_file.push(this.setGlobal(bodyID, bodyAttributes));

                this.d_file.push(this.declareString(bodyID, bodyAttributes, 'const', ': '));
                this.d_file.push(this.declareString(bodyID, bodyAttributes, 'type', ' = '));
            }

            this.d_file.push(this.declareString(REFERENCE_id + '_ALL', combinedType.slice(0, -3), 'type', ' = '));
            fullReferencesTypeString += REFERENCE_id + '_ALL | ';
            this.g_file.push(this.setConst(DEFINITION_id, '[' + defs[creepID] + ']'));
            this.d_file.push(this.declareString(DEFINITION_id, '[' + defs[creepID] + ']', 'type', ' = '));
        }

        var globalID = 'CreepBodies';
        this.g_file.push(this.setGlobal(globalID, fullObjectString + 'get: function(id) { return this[id]; }}'));
        this.g_file.push("// End creep definitions");

        this.d_file.push(this.declareString('CT_ALL', fullObjectTypeString.slice(0, -2), 'type', ' = '));
        this.d_file.push(this.declareString('DEFINITION_ALL', fullDefinitionsTypeString.slice(0, -3), 'type', ' = '));
        this.d_file.push(this.declareString('CTREF_ALL', fullReferencesTypeString.slice(0, -3), 'type', ' = '));

        var interfaceID = 'I' + globalID;
        var typeID = 'T' + globalID;
        this.d_file.push(this.declareString(interfaceID, '{[id: string]: DEFINITION_ALL,' + fullObjectString.slice(1, -1) + '}', 'interface', ''));
        this.d_file.push(this.declareString(typeID, interfaceID + ' & {get<T extends keyof ' + interfaceID + '>(id: T): ' + interfaceID + '[T];}', 'type', ' = '));
        this.d_file.push(this.declareString(globalID, typeID, 'var', ': '));
    },
    OutputToFile: function () {
        var declarationContents = "";
        for (var contentIndex = 0; contentIndex < this.d_file.length; contentIndex++) {
            declarationContents += this.d_file[contentIndex] + '\n';
        }
        this.gObj.file.write("./decl/SwarmConsts.d.ts", declarationContents);

        var globalContents = "";
        for (contentIndex = 0; contentIndex < this.g_file.length; contentIndex++) {
            globalContents += this.g_file[contentIndex] + '\n';
        }
        this.gObj.file.write("./build/compiled/globalConstants.js", globalContents);
    },
    GenerateConstantsFile: function (gruntObj) {
        this.gObj = gruntObj;
        this.g_file = [];
        this.d_file = [];

        this.g_file.push("// Begin Consts");
        // Time stamp the compiled version
        this.g_file.push("global[\"SWARM_VERSION_DATE\"] = \"" + new Date().toLocaleString() + "\";\n");
        this.d_file.push("declare const SWARM_VERSION_DATE = \"CURRENT_VERSION\";");

        var constants = require("../SwarmDeclarations.json").Constants;
        for (var constGroup in constants) {
            var constDef = constants[constGroup];
            this.compileConstDef(constGroup, constDef);
        }

        this.g_file.push("// End Consts\n");
        this.d_file.push("");

        this.OutputAllCreepDefinitions(this.g_file, this.d_file);
        this.g_file.push("\n// Primes");
        this.d_file.push("");
        var primesLists = primeFunctionality.GeneratePrimes();

        for (var maxDigit in primesLists) {
            this.g_file.push(this.setGlobal('primes_' + maxDigit, primesLists[maxDigit]));
            this.d_file.push("declare const primes_" + maxDigit + ": " + primesLists[maxDigit] + '');
        }
        let mapping = require('./neighborMapping').GenerateMapping();

        this.g_file.push(this.setGlobal('neighborMapping', mapping));
        this.d_file.push("declare const neighborMapping: " + mapping);
        this.OutputToFile();
    }
}