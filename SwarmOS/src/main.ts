import { DisposalDelegate } from './common/DisposableBase';
export const loop = function () {
    console.log('Main');
    try {

    } finally {
        DisposalDelegate.DiposeAll(); // NEVER DONT CALL THIS!!!!!!
    }
}