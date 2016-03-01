class Timer {
  private lastTime = 0;

  constructor(private interval: number) {
  }

  public isInterval(time: number): boolean {
    if (time - this.lastTime > this.interval) {
      this.lastTime = time;
      return true;
    }
    return false;
  }
}

export = Timer;
