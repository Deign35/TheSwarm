var gObj;
var lineCount;
var charCount;
var fileCount;
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
        let declarationsFile = [];
        let globalsFile = [];
        let declarations = require("./SwarmDeclarations.json");
        let enums = declarations['Enums'];
        globalsFile.push("// Begin Enums");
        for (let enumName in enums) {
            declarationsFile.push("declare enum " + enumName + " {");
            globalsFile.push("const " + enumName + " = {");
            let enumValues = enums[enumName];
            for (let valueName in enumValues) {
                declarationsFile.push("    " + valueName + " = " + enumValues[valueName] + ',');
                globalsFile.push("    " + valueName + ": " + enumValues[valueName] + ',');
            }

            declarationsFile.push("}\n");
            globalsFile.push("}");
            globalsFile.push("global[\"" + enumName + "\"] = " + enumName + ";\n");
        }
        globalsFile.push("// End Enums\n");

        globalsFile.push("// Begin Consts");
        declarationsFile.push("declare const SWARM_VERSION_DATE = \"CURRENT_VERSION\";");
        globalsFile.push("global[\"SWARM_VERSION_DATE\"] = \"" + new Date().toLocaleString() + "\";\n");

        let consts = declarations['Constants'];
        for (let constGroup in consts) {
            let constDef = consts[constGroup];

            if (!constDef.enabled) {
                continue;
            }
            if (constDef.comment) {
                declarationsFile.push("/** " + constDef.comment + " */");
                globalsFile.push("/** " + constDef.comment + " */");
            }
            for (let entryID in constDef.entries) {
                let constName = constGroup + "_" + entryID;
                let constVal = constDef.entries[entryID];

                if (constDef.isArray) {
                    constName = constGroup + "_" + constVal;
                }
                let constDecl = "declare const " + constName + " = ";
                let globalDecl = "global[\"" + constName + "\"] = ";
                if (constDef.string) {
                    constDecl += "\"" + constVal + "\";";
                    globalDecl += "\"" + constVal + "\";";
                } else {
                    constDecl += constVal + ";";
                    globalDecl += constVal + ";";
                }
                if (constDef.type) {
                    if (constDef.string) {
                        declarationsFile.push("declare type " + constName + " = \"" + constVal + "\";");
                    } else {
                        declarationsFile.push("declare type " + constName + " = " + constVal + ";");
                    }
                }

                declarationsFile.push(constDecl);
                globalsFile.push(globalDecl);
            }
            globalsFile.push("");
        }
        globalsFile.push("// End Consts\n");
        declarationsFile.push("");

        let compoundTypes = declarations['CompoundTypes'];
        for (let compoundName in compoundTypes) {
            let compoundDeclaration = "declare type " + compoundName + " = ";
            for (let i = 0; i < compoundTypes[compoundName].length; i++) {
                compoundDeclaration += compoundTypes[compoundName][i] + " | ";
            }
            declarationsFile.push(compoundDeclaration.slice(0, -3) + ';');
        }
        globalsFile.push("// Primes");
        declarationsFile.push("");

        console.log(`Begin primes: ${new Date()}`);
        let primes = [3, 5, 7, 11];
        let curNum = 13;
        while (primes.length < 3000) {
            for (let i = 0, length = primes.length; i < length; i++) {
                if (curNum % primes[i] == 0) {
                    curNum += 2;
                    continue;
                }
            }
            primes.push(curNum);
            curNum += 2;
        }
        primes = [2].concat(primes);
        console.log(`End primes: ${new Date()}`);

        let primeLists = {
            100: "",
            500: "",
            1500: "",
            3000: "",
        };

        for (let i = 0, length = primes.length; i < length; i++) {
            for (let maxNumber in primeLists) {
                if (maxNumber > primes[i]) {
                    primeLists[maxNumber] += `${primes[i]}, `;
                }
            }
        }

        for (let maxNumber in primeLists) {
            primeLists[maxNumber] = primeLists[maxNumber].slice(0, -2);
            globalsFile.push(`global["primes_${maxNumber}"] = [ ${primeLists[maxNumber]} ];`);
            declarationsFile.push(`declare const primes_${maxNumber}: [ ${primeLists[maxNumber]} ];`);
        }

        let declarationContents = "";
        for (let i = 0; i < declarationsFile.length; i++) {
            declarationContents += declarationsFile[i] + '\n';
        }
        grunt.file.write("./decl/SwarmConsts.d.ts", declarationContents);
        let globalContents = "";
        for (let i = 0; i < globalsFile.length; i++) {
            globalContents += globalsFile[i] + '\n';
        }
        grunt.file.write("./build/compiled/globalConstants.js", globalContents);
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