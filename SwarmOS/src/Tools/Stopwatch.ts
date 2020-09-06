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
      const lapUsed = Game.cpu.getUsed();
      const lapTime = lapUsed - this.startTime;
      this.cummulativeTime += lapTime;
      this.startTime = lapUsed;
      this.laps.push(lapTime);
    }
  }
  ToString() {
    let curLap = 0;
    if (this.startTime > 0) {
      curLap = Game.cpu.getUsed() - this.startTime;
    }

    let msg = "Total: " + (curLap + this.cummulativeTime) + 'cpu';
    for (let i = 0; i < this.laps.length; i++) {
      msg += `\n${i + 1}: ${this.laps[i]}cpu`;
    }
    if (this.laps.length > 0 && this.startTime > 0) {
      msg += `\ncur: ${curLap}`;
    }
    return msg;
  }
}