let gObj;
module.exports = function (grunt) {
    gObj = grunt;
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-file-append');
    grunt.loadNpmTasks('grunt-screeps');
    grunt.loadNpmTasks('grunt-string-replace');
    grunt.loadNpmTasks("grunt-ts");

    let currentdate = new Date();

    // Output the current date and branch.
    grunt.log.subhead('Task Start: ' + currentdate.toLocaleString());
    let gruntConfig = {};
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

    grunt.registerTask('replace', 'Replaces file paths with _', function () {
        grunt.file.recurse('./build/compiled', ReplaceImports);
    });
    /*async.forEach(files, function (file, files_done) {
        async.forEach(file.src, function (src, src_done) {
            console.log('file: ' + JSON.stringify(src));
            if (!grunt.file.exists(src)) {
                grunt.log.debug('file not found', src);
            }
            dest = file.dest;
            content = grunt.file.read(src);
            let newcontent = content;
            if (content !== newContent || options.saveUnchanged) {
                console.log('source changed');
                grunt.file.write(dest, newContent);
                counter += 1;
            } else {
                console.log(src + ' unchanged');
            }

            return src_done();
        }, files_done)
    }, function (err) {
        if (err) {
            grunt.log.error(err);
            replace_done(false);
        }
        grunt.log.writeln('\n' + counter + ' files created');
    });
});*/

    grunt.registerTask('commitMain', ['compile', 'copy', 'screepsBranch:SwarmOS_Main', 'screeps']);
    grunt.registerTask('commitSim', ['compile', 'copy', 'screepsBranch:SwarmOS_Sim', 'screeps']);
    grunt.registerTask('compile', ['clean', 'ts']);
    grunt.registerTask('default', ['commitSim']);
    grunt.registerTask('try', ['compile', 'replace', 'copy', 'screepsBranch:SwarmOS_Sim', 'screeps']);
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
        src: ['dist/*.js']
    };

    return screepsTask;
}

let InitTSConfig = function () {
    return { default: { tsconfig: true } };
}

let InitCleanConfig = function () {
    return { default: ['dist', 'build', '.tmp'] };
}

let InitCopyConfig = function () {
    let copyTask = {};

    copyTask['default'] = {
        files: [{
            expand: true,
            cwd: 'build/compiled',
            src: '**',
            dest: 'dist/',
            filter: 'isFile',
            rename: function (dest, src) {
                return dest + src.replace(/\//g, '_');
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
    if (abspath.match(/.js$/) == null) { return; }
    console.log('abspath[' + abspath + '] -- rootdir[' + rootdir + '] -- subdir[' + subdir + ']');
    let file = gObj.file.read(abspath);
    let updatedFile = '';

    //let path = subdir ? subdir.split('/') : [];
    let lines = file.split('\n');
    for (let line of lines) {
        let reqStr = line.match(/(?:require\(")([^_a-zA-Z0-9]*)([^"]*)/);
        if (reqStr && reqStr != "") {
            let reqPath = subdir ? subdir.split('/') : [];
            let upPaths = line.match(/\.\.\//gi);
            console.log('path before ------ ' + reqPath);
            if (upPaths) {
                for (let i in upPaths) {
                    reqPath.splice(reqPath.length - 1);
                }
            }

            console.log(JSON.stringify(reqPath));
            let rePathed = "";
            if (reqPath && reqPath.length > 0) {
                for (let folder of reqPath) {
                    rePathed = folder + "_";
                }
            }
            console.log('repathed: ' + rePathed);
            //line = line.replace(/(require\(")([^_a-zA-Z0-9]*)([^"]*)/, "$1" + rePathed + "$3").replace(/\//gi, '_');
            line = line.replace(/require\("([\.\/]*)([^"]*)/, "require\(\"" + rePathed + "$2").replace(/\//gi, '_');
        }

        updatedFile += (line + '\n');
    }

    gObj.file.write((rootdir + '/' + (subdir ? subdir + '/' : '') + filename), updatedFile);
}