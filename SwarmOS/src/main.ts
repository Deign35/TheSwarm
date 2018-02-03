import 'Managers/Swarmlord';
import { SwarmQueen } from 'Managers/SwarmQueen';

export const loop = function () {
    console.log('Main');
    Swarmlord.InitSwarmlord();
    let swarmQueen = SwarmQueen.LoadSwarmData();
    swarmQueen.Activate();
    swarmQueen.Save();
    Swarmlord.SaveSwarmlord();
}