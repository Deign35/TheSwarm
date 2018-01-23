import { IMemory } from './common/IMemory';

export const loop = function () {
    console.log('The Green Arrow is better than batman');
    let memObj = new IMemory();
    memObj.Save();
}