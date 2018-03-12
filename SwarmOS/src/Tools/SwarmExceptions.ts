export class SwarmException extends Error {
    constructor(name: string, message?: string) {
        super(message);
        this.name = name;
    }

    OutputToConsole() {
        console.log(this.name + ': ' + this.message);
        if (this.stack) {
            console.log(this.stack);
        }
    }
}

export class NotImplementedException extends SwarmException {
    static ErrorName: 'Not Implemented'
    constructor(message?: string) {
        super(NotImplementedException.ErrorName, message);
    }
}
export class MemoryNotFoundException extends SwarmException {
    static ErrorName: 'Memory Not Found'
    constructor(message?: string) {
        super(MemoryNotFoundException.ErrorName, message);
    }
}
export class AlreadyExistsException extends SwarmException {
    static ErrorName: 'Already Exists';
    constructor(message?: string) {
        super(AlreadyExistsException.ErrorName, message);
    }
}
export class MemoryLockException extends SwarmException {
    static ErrorName: 'Memory Lock';
    readonly WasLocked: boolean;
    constructor(wasLocked: boolean, message?: string) {
        super(MemoryLockException.ErrorName, "Lock was " + (wasLocked ? "locked" : "unlocked") + ".\n" + message);
        this.WasLocked = wasLocked;
    }
}
export class InvalidArgumentException extends SwarmException {
    static ErrorName: 'InvalidArgument';
    constructor(message?: string) {
        super(InvalidArgumentException.ErrorName, message);
    }
}