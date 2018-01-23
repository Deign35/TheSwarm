module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-screeps');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-file-append');
    grunt.loadNpmTasks("grunt-ts");

    let currentdate = new Date();

    // Output the current date and branch.
    grunt.log.subhead('Task Start: ' + currentdate.toLocaleString());
    let gruntConfig = {};
    gruntConfig['screeps'] = InitGruntScreeps(require('./screeps.json'));
    gruntConfig['ts'] = InitTSTask();
    gruntConfig['clean'] = InitCleanTask();
    gruntConfig['copy'] = InitCopyTask();

    grunt.initConfig(gruntConfig);

    grunt.registerTask('default', ['clean', 'copy:default']);
    grunt.registerTask('commit', ['clean', 'ts', 'copy', 'screeps']);
}

let InitGruntScreeps = function (loginInfo) {
    let screepsTask = {};
    screepsTask['options'] = {
        email: loginInfo.email,
        password: loginInfo.password,
        branch: 'SwarmOS_Sim',
        ptr: false
    };

    screepsTask['dist'] = {
        src: ['dist/*.js'],
    };

    return screepsTask;
}

let InitTSTask = function () {
    return { default: { tsconfig: true } };
}

let InitCleanTask = function() {
    return { default: ['dist', 'obj'] };
}

let InitCopyTask = function () {
    let copyTask = {};

    copyTask['default'] = {
        files: [{
            expand: true,
            cwd: 'obj/',
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

/*let InitConcatTask = function () {
    let concatTask = {}
    concatTask['options'] = {
        separator: '\n/*************************************************************************************\n'
    }
}*/