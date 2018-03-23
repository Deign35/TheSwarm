const PRIMES = [
    2, 3, 5, 7, 11, 13, 17, 19, 23, 29,
    31, 37, 41, 43, 47, 53, 59, 61, 67, 71,
    73, 83, 89, 91, 97, 101, 103, 107, 109, 113,
    127, 131, 137, 139, 149, 151, 157, 163, 167, 173,
    179, 181, 191, 193, 197, 199, 211, 223, 227, 229
]

var CurIDConstant = Game.time;
var CurIndex = 0;

function GetNewJobID() {
    let newID = 'J_' + (Game.time % 10000) + '_' + (CurIDConstant % PRIMES[CurIndex++]);
    if (CurIndex >= PRIMES.length) { CurIndex = 0; }
    return newID;
}

export class NeuralNetwork {
    AddNewAttachmentPoint(swarmObj: SwarmObject) {
        
    }
}

