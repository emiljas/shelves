'use strict';

export default class FpsMeasurer {
  private static _instance: FpsMeasurer;

  static get instance(): FpsMeasurer {
    if(this._instance == null)
      this._instance = new FpsMeasurer();
    return this._instance;
  }

  private elapsed = 0;
  private last: number = null;

  public tick(now: number) {
    this.elapsed = (now - (this.last || now)) / 1000;
    this.last = now;
  }

  public get() {
      return Math.round(1 / this.elapsed);
  }
}
