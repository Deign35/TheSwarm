let SwarmMemory = require('./SwarmMemory');

global['Memory'] = {};

let TestMemory = new SwarmMemory.SwarmMemory('SM');
TestMemory.SetData('In1', 23);
TestMemory.SetData('In2', 'Pow');
console.log(JSON.stringify(TestMemory));