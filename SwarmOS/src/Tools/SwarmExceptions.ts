export class SwarmException extends Error {
    constructor(name: string, message?: string) {
        super(message);
        this.name = name + ' Exception';
    }

    OutputToConsole() {
        console.log(this.name + ': ' + this.message);
        if (this.stack) {
            console.log(this.stack);
        }
    }
}

export class NotImplementedException extends SwarmException {
    constructor(message?: string) {
        super("Not Implemented", message);
    }
}
export class MemoryNotFoundException extends SwarmException {
    constructor(message?: string) {
        super("Memory Not Found", message);
    }
}
export class AlreadyExistsException extends SwarmException {
    constructor(message?: string) {
        super("Already Exists", message);
    }
}