const ReplaceImports = function (abspath, rootdir, subdir, filename) {
    if (abspath.match(/.js$/) == null) {
        return;
    }
    let file = gObj.file.read(abspath);
    let updatedFile = '';

    let lines = file.split('\n');
    for (let line of lines) {
        // Compiler: IgnoreLine
        if ((line).match(/[.]*\/\/ Compiler: IgnoreLine[.]*/)) {
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
module.exports = {
    SetScreepsUploadBranch(branchID) {
        gObj.config.set('screeps.options.branch', branchID);
    },
    RecursiveImportReplacement() {
        gObj.file.recurse('./build/compiled', ReplaceImports);
    },
    CountLines() {
        var startTime = new Date();
        let fileExt = gObj.option('fileExt');
        let srcDir = gObj.option('srcDir');
        lineCount = 0;
        charCount = 0;
        fileCount = 0;
        try {
            gObj.file.recurse(srcDir, (abspath, rootdir, subdir, filename) => {
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
    },
    PostEndTime() {
        let currentdate = new Date();
        // Output the current date and branch.
        gObj.log.subhead('Task End: ' + currentdate.toLocaleString());
    }
}