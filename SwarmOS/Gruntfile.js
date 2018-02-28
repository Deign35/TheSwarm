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

    let currentdate = new Date();

    // Output the current date and branch.
    grunt.log.subhead('Task Start: ' + currentdate.toLocaleString());
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
        lineCount = 0;
        grunt.file.recurse('./build/compiled', ReplaceImports);
        console.log('Line Count: ' + lineCount);
    });
    grunt.registerTask('help', 'Help info', function () {
        let output = 'Grunt Help Menu *******************';
        output += '\nclean: Cleans the build and dist directories';
        output += '\ncopy: Copies the final files into the dist folder for staging';
        output += '\nts: Compiles the TypeScript';
        output += '\nreplace: Replaces marked lines with appropriate replacements.';
        output += '\nDirStats: Counts the files, lines and chars of the provided directory';
        output += '\n\tParams(srcDir,fileExt)';
        output += '\n----------------------------------';
        output += '\ncommitMain: Commits to SwarmOS_Main';
        output += '\ncommitSim: Commits to SwarmOS_Sim';
        output += '\ncompile(default): Compiles the Typescript';
        console.log(output);
    });

    grunt.registerTask('commitMain', ['compile', 'replace', 'copy', 'screepsBranch:SwarmOS_Main', 'screeps']);
    grunt.registerTask('commitSim', ['compile', 'replace', 'copy', 'screepsBranch:SwarmOS_Sim', 'screeps']);
    grunt.registerTask('compile', ['clean', 'ts']);
    grunt.registerTask('default', ['compile']);
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
            tsconfig: true
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
    lineCount += lines.length;
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
                if (!line.match(/\.\//gi)) {
                    // absolute path
                    reqPath = [];
                }
            }

            let rePathed = "";
            if (reqPath && reqPath.length > 0) {
                for (let folder of reqPath) {
                    rePathed = folder + "_";
                }
            }
            line = line.replace(/require\("([\.\/]*)([^"]*)/, "require\(\"" + rePathed + "$2").replace(/\//gi, '_');
        }

        updatedFile += (line + '\n');
    }

    gObj.file.write((rootdir + '/' + (subdir ? subdir + '/' : '') + filename), updatedFile);
}