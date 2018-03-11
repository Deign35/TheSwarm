export class SwarmException extends Error {
    OutputToConsole() {
        console.log(this.name + ': ' + this.message);
        if (this.stack) {
            console.log(this.stack);
        }
    }
}

export class NotImplementedException extends SwarmException {
    readonly name: string = "Not Implemented Exception";
}
export class MemoryNotFoundException extends SwarmException {
    readonly name: string = "Memory not found error";
}