import { DisposalDelegate } from './common/Disposable';
import { Swarmlord } from 'Managers/Swarmlord';
import { SwarmQueen } from 'Managers/SwarmQueen';
export const loop = function () {
    console.log('Main');
    try {
        Swarmlord.InitSwarmlord();
        let swarmQueen = new SwarmQueen('SwarmQueen');
        swarmQueen.Activate();
        swarmQueen.Save();
    } finally {
        Swarmlord.SaveSwarmlord();
        DisposalDelegate.DiposeAll(); // NEVER DONT CALL THIS!!!!!!
    }
}