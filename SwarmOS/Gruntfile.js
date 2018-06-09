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
    global.gObj = grunt;
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-screeps');
    grunt.loadNpmTasks("grunt-ts");

    let startDate = new Date();

    // Output the current date and branch.
    grunt.log.subhead('Task Start: ' + startDate.toLocaleString());

    var gruntConfig = require('./grunt/config');
    grunt.initConfig(gruntConfig.CreateGruntConifg());

    var gruntTasks = require('./grunt/tasks');
    grunt.registerTask('screepsBranch', 'Sets the grunt-screeps options.branch config', gruntTasks.SetScreepsUploadBranch);
    grunt.registerTask('DirStats', 'Counts the number of TS lines in current repository.', gruntTasks.CountLines);
    grunt.registerTask('replace', 'Replaces file paths with _', gruntTasks.RecursiveImportReplacement);
    grunt.registerTask('time', 'Outputs the current time', gruntTasks.PostEndTime);

    grunt.registerTask('generateGlobals', 'Outputs the needed files for screeps and declarations', function () {
        let constantsFile = require('./grunt/constantsFile');
        constantsFile.GenerateConstantsFile(gObj);
    });

    grunt.registerTask('help', 'Help info', function () {
        let output = 'Grunt Help Menu *******************';
        output += '\nclean: Cleans the build and dist directories';
        output += '\ncopy: Copies the final files into the dist folder for staging';
        output += '\nts: Compiles the TypeScript';
        output += '\nreplace: Replaces marked lines with appropriate replacements.';
        output += '\nDirStats: Counts the files, lines and chars of the provided directory';
        output += '\n\tParams(srcDir,fileExt)';
        // Example use -- grunt DirStats --srcDir=./dist --fileExt=.js
        output += '\ngenerateGlobals: Creates the consts, types, and enums for TheSwarm';
        output += '\n----------------------------------';
        output += '\ncommitMain: Commits to SwarmOS_Main';
        output += '\ncommitSim: Commits to SwarmOS_Sim';
        output += '\ncompileDefs: Compiles all of the constants';
        output += '\ncompile: Compiles the Typescript';
        output += '\ncompileComplete: Does everything but commit';
        console.log(output);
    });
    grunt.registerTask('commitMain', ['compileComplete', 'screepsBranch:SwarmOS_Main', 'screeps', 'time']);
    grunt.registerTask('commitSim', ['compileComplete', 'screepsBranch:SwarmOS_Sim', 'screeps', 'time']);
    grunt.registerTask('compileComplete', ['compile', 'replace', 'copy'])
    grunt.registerTask('compile', ['clean', 'compileDefs', 'ts']);
    grunt.registerTask('compileDefs', ['generateGlobals']);
    grunt.registerTask('default', ['help']);
}