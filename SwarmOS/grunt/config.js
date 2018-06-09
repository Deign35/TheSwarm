module.exports = {
    CreateGruntConifg: function () {
        var gruntConfig = {};
        gruntConfig['screeps'] = this.InitGruntScreepsConfig();
        gruntConfig['ts'] = this.InitTSConfig();
        gruntConfig['clean'] = this.InitCleanConfig();
        gruntConfig['copy'] = this.InitCopyConfig();
        return gruntConfig;
    },
    InitGruntScreepsConfig: function () {
        let loginInfo = require('../screeps.json')

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
    },
    InitTSConfig: function () {
        return {
            default: {
                tsconfig: true,
            }
        };
    },
    InitCleanConfig: function () {
        return {
            default: ['dist', 'build', '.tmp']
        };
    },
    InitCopyConfig: function () {
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
}