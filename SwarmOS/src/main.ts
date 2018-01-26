import { IMemory } from './common/IMemory';

export const loop = function () {
    console.log('The Green Arrow is better than batman and robin put together');
    let memObj = new IMemory(Game.rooms['sim'].name);
    memObj.Save();
    memObj.Load();
}