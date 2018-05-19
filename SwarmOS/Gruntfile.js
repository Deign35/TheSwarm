var gObj;
var lineCount;
var charCount;
var fileCount;
var BODYPART_COST = {
    "m": 50,
    "w": 100,
    "a": 80,
    "c": 50,
    "h": 250,
    "r": 150,
    "t": 10,
    "cl": 600
}
module.exports = function (grunt) {
    gObj = grunt;
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-file-append');
    grunt.loadNpmTasks('grunt-screeps');
    grunt.loadNpmTasks("grunt-ts");

    let startDate = new Date();

    // Output the current date and branch.
    grunt.log.subhead('Task Start: ' + startDate.toLocaleString());
    var gruntConfig = {};
    gruntConfig['pkg'] = grunt.file.readJSON('package.json');
    gruntConfig['screeps'] = InitGruntScreepsConfig();
    gruntConfig['ts'] = InitTSConfig();
    gruntConfig['clean'] = InitCleanConfig();
    gruntConfig['copy'] = InitCopyConfig();
    gruntConfig['uglify'] = InitUglifyConfig();
    gruntConfig['string-replace'] = InitStringReplaceConfig();

    grunt.initConfig(gruntConfig);

    grunt.registerTask('screepsBranch', 'Sets the grunt-screeps options.branch config', function (branchID) {
        grunt.config.set('screeps.options.branch', branchID);
    });

    grunt.registerTask('DirStats', 'Counts the number of TS lines in current repository.', function () {
        var startTime = new Date();
        let fileExt = grunt.option('fileExt');
        let srcDir = grunt.option('srcDir');
        lineCount = 0;
        charCount = 0;
        fileCount = 0;
        try {
            grunt.file.recurse(srcDir, (abspath, rootdir, subdir, filename) => {
                let reg = new RegExp(('/([^\.\\n]*)\.($1)([ ;\\n])*/i').replace('$1', fileExt));
                reg.compile();
                if (abspath.match(reg) == null) {
                    return;
                }
                var file = gObj.file.read(abspath);
                fileCount += 1;
                charCount += file.length;
                lineCount += file.split('\n').length;
            });
        } catch (e) {
            console.log(e);
        }
        console.log('Files: ' + fileCount);
        console.log('Lines: ' + lineCount);
        console.log('Chars: ' + charCount);
        var endTime = new Date();
        console.log('EndTime: ' + (endTime - startTime));
    });
    grunt.registerTask('replace', 'Replaces file paths with _', function () {
        grunt.file.recurse('./build/compiled', ReplaceImports);
    });
    grunt.registerTask('time', 'Outputs the current time', function () {
        let currentdate = new Date();
        // Output the current date and branch.
        grunt.log.subhead('Task End: ' + currentdate.toLocaleString());
    });

    grunt.registerTask('generateGlobals', 'Outputs the needed files for screeps and declarations', function () {
        GenerateConstantsFile();
    });

    grunt.registerTask('help', 'Help info', function () {
        let output = 'Grunt Help Menu *******************';
        output += '\nclean: Cleans the build and dist directories';
        output += '\ncopy: Copies the final files into the dist folder for staging';
        output += '\nts: Compiles the TypeScript';
        output += '\nreplace: Replaces marked lines with appropriate replacements.';
        output += '\nDirStats: Counts the files, lines and chars of the provided directory';
        output += '\n\tParams(srcDir,fileExt)';
        output += '\ngenerateGlobals: Creates the consts, types, and enums for TheSwarm';
        output += '\n----------------------------------';
        output += '\ncommitMain: Commits to SwarmOS_Main';
        output += '\ncommitSim: Commits to SwarmOS_Sim';
        output += '\ncompileDefs: Compiles all of the constants';
        output += '\ncompile: Compiles the Typescript';
        console.log(output);
    });
    grunt.registerTask('commitMain', ['compileComplete', 'screepsBranch:SwarmOS_Main', 'screeps', 'time']);
    grunt.registerTask('commitSim', ['compileComplete', 'screepsBranch:SwarmOS_Sim', 'screeps', 'time']);
    grunt.registerTask('compileComplete', ['compile', 'replace', 'copy'])
    grunt.registerTask('compile', ['clean', 'compileDefs', 'ts']);
    grunt.registerTask('compileDefs', ['generateGlobals']);
    grunt.registerTask('default', ['help']);
}

let InitGruntScreepsConfig = function () {
    let loginInfo = require('./screeps.json')

    let screepsTask = {};
    screepsTask['options'] = {
        email: loginInfo.email,
        password: loginInfo.password,
        ptr: false,
        branch: 'SwarmOS_Sim'
    };

    screepsTask['dist'] = {
        src: ['dist/*.js', 'dist/*.json']
    };

    return screepsTask;
}

let InitTSConfig = function () {
    return {
        default: {
            tsconfig: true,
        }
    };
}

let InitCleanConfig = function () {
    return {
        default: ['dist', 'build', '.tmp']
    };
}

let InitCopyConfig = function () {
    let copyTask = {};

    copyTask['default'] = {
        files: [{
            expand: true,
            cwd: 'build/compiled',
            src: '**/*.js',
            dest: 'dist/',
            filter: 'isFile',
            rename: function (dest, src) {
                return dest + src.replace(/\//g, '_');
            }
        }]
    }

    copyTask['json'] = {
        files: [{
            expand: true,
            cwd: './src/',
            src: '**/*.json',
            dest: 'dist/',
            filter: 'isFile',
            rename: function (dest, src) {
                return dest + src.substring(0, src.length - 4).replace(/\//g, '_') + 'js';
            }
        }]
    }

    return copyTask;
}

let InitUglifyConfig = function () {
    let uglifyConfig = {};

    uglifyConfig['options'] = {
        mangle: true,
        nameCache: '.tmp/grunt-uglify-cache.json',
    };
    uglifyConfig['default'] = {
        files: [{
            expand: true,
            cwd: '.',
            src: 'build/compiled/**/*.js',
            dest: 'dist/main.js',
            rename: function (dest, src) {
                return dst + '/' + src.replace('.js', '.min.js');
            }
        }]
    };
    return uglifyConfig;
}

let InitStringReplaceConfig = function () {
    let stringReplaceConfig = {};
    stringReplaceConfig['files'] = {
        cwd: '.',
        src: './build/compiled/main.js',
        dest: './build/compiled2/main.js',
    };
    stringReplaceConfig['options'] = {
        replacements: [{
            pattern: /((?:require\(")[.|/]*([^"]*))"\);/,
            replacement: '$1',
        }]
    };

    return stringReplaceConfig;
}

let ReplaceImports = function (abspath, rootdir, subdir, filename) {
    if (abspath.match(/.js$/) == null) {
        return;
    }
    let file = gObj.file.read(abspath);
    let updatedFile = '';

    //let path = subdir ? subdir.split('/') : [];
    let lines = file.split('\n');
    for (let line of lines) {
        // Compiler: IgnoreLine
        if ((line).match(/[.]*\/\/ Compiler: IgnoreLine[.]*/)) {
            continue;
        }
        if ((line).match(/[.]*require\("lodash"\);[.]*/)) {
            console.log(line);
            continue;
        }
        let reqStr = line.match(/(?:require\(")([^_a-zA-Z0-9]*)([^"]*)/);
        if (reqStr && reqStr != "") {
            let reqPath = subdir ? subdir.split('/') : []; // relative path
            let upPaths = line.match(/\.\.\//gi);
            if (upPaths) {
                for (let i in upPaths) {
                    reqPath.splice(reqPath.length - 1);
                }
            } else {
                let isRelative = line.match(/\.\//gi);
                if (!isRelative || isRelative == "") {
                    // absolute path
                    reqPath = [];
                }
            }

            let rePathed = "";
            if (reqPath && reqPath.length > 0) {
                while (reqPath.length > 0) {

                    rePathed += reqPath.shift() + "_";
                }
            }
            line = line.replace(/require\("([\.\/]*)([^"]*)/, "require\(\"" + rePathed + "$2").replace(/\//gi, '_');
        }

        updatedFile += (line + '\n');
    }

    gObj.file.write((rootdir + '/' + (subdir ? subdir + '/' : '') + filename), updatedFile);
}

var GenerateConstantsFile = function () {
    var g_file = [];
    var d_file = [];

    var declareString = function (id, val, type, connectSymbol) {
        return 'declare ' + type + ' ' + id + connectSymbol + val;
    };

    var setConst = function (id, val) {
        return "const " + id + " = " + val + ";";
    };
    var setGlobal = function (id, val) {
        return "global[\"" + id + "\"] = " + val + "; ";
    };

    var compileConstDef = function (id, constDef) {
        if (!constDef.enabled || constDef.entries.length == 0) {
            return;
        }

        if (constDef.comment) {
            g_file.push("/** " + constDef.comment + " */");
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

            g_file.push(setGlobal(constName, constVal));
            d_file.push(declareString(constName, constVal, 'const', ' = '));
            if (constDef.type) {
                d_file.push(declareString(constName, constVal, 'type', ' = '));
            }
        }
        if (constDef.combinedType) {
            var combinedTypeVal = "";
            for (var entryIndex = 0; entryIndex < entryIDs.length; entryIndex++) {
                combinedTypeVal += entryIDs[entryIndex] + " | ";
            }
            d_file.push(declareString(constDef.combinedType, combinedTypeVal.slice(0, -3), 'type', ' = '));
        }
        g_file.push('');
    };

    var OutputBodyDefs = function (creepID, defEntries) {
        let combinedBodyTypeDef = '';

        let bodies = {};
        for (var entryID = 0; entryID < defEntries.length; entryID++) {
            var bodyID = creepID + '_' + entryID;
            var bodyEntry = defEntries[entryID];

            combinedBodyTypeDef += bodyID + ' | ';
            bodies[bodyID] = bodyEntry;

            d_file.push(declareString(bodyID, bodyEntry, 'const', ': '));
            d_file.push(declareString(bodyID, bodyEntry, 'type', ' = '));
        }

        d_file.push(declareString(creepID + '_ALL', combinedBodyTypeDef.slice(0, -3), 'type', ' = '));
    }

    var compileCreepDef = function (creepDef, ctID, refPrefix) {
        var compiled = []
        var creepEntries = creepDef.entries.length;
        for (var bodyIndex = 0; bodyIndex < creepEntries; bodyIndex++) {
            var bodyEntry = creepDef.entries[bodyIndex];

            compiled.push(compileCreepBody(bodyEntry, ctID, bodyIndex, MakeNewRefID(refPrefix, bodyIndex), creepDef.packageID));
        }
        return compiled;
    };

    var compileCreepBody = function (bodyDef, ctID, lvl, refPrefix, packageID) {
        var bodyString = '{';
        var components = Object.keys(bodyDef);
        var bodyCost = 0;
        for (var compIndex = 0; compIndex < components.length; compIndex++) {
            var compID = components[compIndex];
            bodyString += compID + ':' + bodyDef[compID] + ',';
            if (BODYPART_COST[compID]) {
                bodyCost += bodyDef[compID] * BODYPART_COST[compID];
            }
        }

        bodyString += 'cost:' + bodyCost + ',lvl:' + lvl + ',ct_ID:' + ctID + ',ctref_ID:' + refPrefix + ', pkg_ID:' + packageID + '}';
        return bodyString;
    };

    var MakeNewRefID = function (prefix, bodyIndex) {
        return prefix + '_' + bodyIndex;
    }

    var OutputAllCreepDefinitions = function () {
        var creepBodies = require("./CreepBodies.json");
        var declIDs = Object.keys(creepBodies);
        if (declIDs.length == 0) {
            return;
        }
        g_file.push("// Begin creep definitions");

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

            g_file.push(setGlobal(CT_id, quotedCreepID));

            d_file.push(declareString(CT_id, quotedCreepID, 'const', ' = '));
            d_file.push(declareString(CT_id, quotedCreepID, 'type', ' = '));
            fullObjectTypeString += CT_id + ' | ';

            fullObjectString += creepID + ':' + DEFINITION_id + ',';
            fullDefinitionsTypeString += DEFINITION_id + ' | ';

            defs[creepID] = compileCreepDef(creepBodies[creepID], CT_id, REFERENCE_id);

            let combinedType = '';
            for (var entryIndex = 0; entryIndex < defs[creepID].length; entryIndex++) {
                var bodyID = MakeNewRefID(REFERENCE_id, entryIndex);
                combinedType += bodyID + ' | ';

                var bodyAttributes = '{CT_id:' + CT_id + ', lvl:' + entryIndex + '}';
                g_file.push(setGlobal(bodyID, bodyAttributes));

                d_file.push(declareString(bodyID, bodyAttributes, 'const', ': '));
                d_file.push(declareString(bodyID, bodyAttributes, 'type', ' = '));
            }

            d_file.push(declareString(REFERENCE_id + '_ALL', combinedType.slice(0, -3), 'type', ' = '));
            fullReferencesTypeString += REFERENCE_id + '_ALL | ';
            g_file.push(setConst(DEFINITION_id, '[' + defs[creepID] + ']'));
            d_file.push(declareString(DEFINITION_id, '[' + defs[creepID] + ']', 'type', ' = '));
        }

        var globalID = 'CreepBodies';
        g_file.push(setGlobal(globalID, fullObjectString + 'get: function(id) { return this[id]; }}'));
        g_file.push("// End creep definitions");

        d_file.push(declareString('CT_ALL', fullObjectTypeString.slice(0, -2), 'type', ' = '));
        d_file.push(declareString('DEFINITION_ALL', fullDefinitionsTypeString.slice(0, -3), 'type', ' = '));
        d_file.push(declareString('CTREF_ALL', fullReferencesTypeString.slice(0, -3), 'type', ' = '));

        var interfaceID = 'I' + globalID;
        var typeID = 'T' + globalID;
        d_file.push(declareString(interfaceID, '{[id: string]: DEFINITION_ALL,' + fullObjectString.slice(1, -1) + '}', 'interface', ''));
        d_file.push(declareString(typeID, interfaceID + ' & {get<T extends keyof ' + interfaceID + '>(id: T): ' + interfaceID + '[T];}', 'type', ' = '));
        d_file.push(declareString(globalID, typeID, 'var', ': '));
    };

    var primeLists = {
        100: "",
        300: "",
        500: "",
        1000: "",
        1500: "",
        2000: "",
        2500: "",
        3000: "",
    };
    var GeneratePrimes = function () {
        g_file.push("// Primes");
        d_file.push("");

        var primes = [3, 5, 7, 11];
        var curNum = 13;
        while (primes.length < 3000) {
            for (var primeIndex = 0, length = primes.length; primeIndex < length; primeIndex++) {
                if (curNum % primes[primeIndex] == 0) {
                    curNum += 2;
                    continue;
                }
            }
            primes.push(curNum);
            curNum += 2;
        }
        primes = [2].concat(primes);

        for (var primeListIndex = 0; primeListIndex < primes.length; primeListIndex++) {
            for (var maxNumber in primeLists) {
                if (maxNumber > primes[primeListIndex]) {
                    primeLists[maxNumber] += primes[primeListIndex] + ', ';
                }
            }
        }

        for (var maxDigit in primeLists) {
            primeLists[maxDigit] = '[' + primeLists[maxDigit].slice(0, -2) + ']';
            g_file.push(setGlobal('primes_' + maxDigit, primeLists[maxDigit]));
            d_file.push("declare const primes_" + maxDigit + ": " + primeLists[maxDigit] + '');
        }
    };

    var OutputToFile = function () {
        var declarationContents = "";
        for (var contentIndex = 0; contentIndex < d_file.length; contentIndex++) {
            declarationContents += d_file[contentIndex] + '\n';
        }
        gObj.file.write("./decl/SwarmConsts.d.ts", declarationContents);

        var globalContents = "";
        for (contentIndex = 0; contentIndex < g_file.length; contentIndex++) {
            globalContents += g_file[contentIndex] + '\n';
        }
        gObj.file.write("./build/compiled/globalConstants.js", globalContents);
    };

    var run = function () {
        g_file = [];
        d_file = [];

        g_file.push("// Begin Consts");
        // Time stamp the compiled version
        g_file.push("global[\"SWARM_VERSION_DATE\"] = \"" + new Date().toLocaleString() + "\";\n");
        d_file.push("declare const SWARM_VERSION_DATE = \"CURRENT_VERSION\";");

        var constants = require("./SwarmDeclarations.json").Constants;
        for (var constGroup in constants) {
            var constDef = constants[constGroup];
            compileConstDef(constGroup, constDef);
        }

        g_file.push("// End Consts\n");
        d_file.push("");

        OutputAllCreepDefinitions();
        g_file.push('');
        GeneratePrimes();
        OutputToFile();
    }

    run();
}