export class SwarmLogger {
    static Log(message: string, level: LogLevel = LogLevel.Info): void {
        console.log(message);
    }
    static LogWarning(message: string) {
        this.Log(message, LogLevel.Warn);
    }
    static LogError(message: string) {
        this.Log(message, LogLevel.Error);
    }
}