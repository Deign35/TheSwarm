export class Stopwatch {
  protected cummulativeTime: number = 0;
  protected startTime: number = 0;
  protected laps: number[] = [];
  Reset() {
    this.laps = [];
    this.startTime = 0;
    this.cummulativeTime = 0;
  }
  Start() {
    if (this.startTime == 0) {
      this.startTime = Game.cpu.getUsed();
    }
  }
  Stop() {
    if (this.startTime > 0) {
      this.cummulativeTime += Game.cpu.getUsed() - this.startTime;
      this.startTime = 0;
    }
  }
  Lap() {
    if (this.startTime > 0) {
      const lapTime = Game.cpu.getUsed() - this.startTime;
      this.cummulativeTime += lapTime;
      this.startTime = lapTime - this.startTime;
      this.laps.push(lapTime);
    }
  }
  ToString() {
    this.Lap();
    return this.cummulativeTime + 'cpu';
  }
}