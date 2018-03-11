export class SwarmLogger {
    Log(message: string, level: LogLevel = LogLevel.Info): void {
        console.log(message);
    }
    LogWarning(message: string) {
        this.Log(message, LogLevel.Warn);
    }
    LogError(message: string) {
        this.Log(message, LogLevel.Error);
    }
}