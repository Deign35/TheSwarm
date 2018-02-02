import { DisposalDelegate } from './common/Disposable';
import { SwarmOverlord } from 'Managers/SwarmOverlord';
export const loop = function () {
    console.log('Main');
    try {
        SwarmOverlord.InitOverlord();

    } finally {
        SwarmOverlord.SaveSwarmOverlordData();
        DisposalDelegate.DiposeAll(); // NEVER DONT CALL THIS!!!!!!
    }
}