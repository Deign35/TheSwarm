let something = require('./Memory/SwarmMemory');
global['Memory'] = {};
let fileSystem = new something.FileSystem();
fileSystem.EnsurePath('/TestFolder/TestFolder2');
fileSystem.SaveFile('/TestFolder', 'TestFile', {
    data: {
        a: 1,
        b: 2,
        c: 3
    }
});
//fileSystem.CreateFolder('/TestFolder', 'TestFolder2');
fileSystem.SaveFile('/TestFolder/TestFolder2', 'SubFileTest', {
    info: 'nothing really'
});
console.log(JSON.stringify(Memory));
fileSystem.CreateFolder('', 'NotACreatedFolder');
fileSystem.SaveFile('/NotACreatedFolder', 'TestFile2', {
    data: {
        info: 'lots of info for realsies'
    }
});

console.log(JSON.stringify(fileSystem.GetFile('/NotACreatedFolder', 'TestFile2').data.info));
fileSystem.CopyFile('/TestFolder/TestFolder2', 'SubFileTest', '/NotACreatedFolder', false, 'TestFile3');
console.log(JSON.stringify(Memory));
fileSystem.CopyFile('/TestFolder/TestFolder2', 'SubFileTest', '/NotACreatedFolder', true);
console.log(JSON.stringify(Memory));
fileSystem.DeleteFolder('', 'TestFolder');
console.log(JSON.stringify(Memory));