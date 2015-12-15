import ValueAnimatorArgs = require('./ValueAnimatorArgs');

const HALF_OF_PI = Math.PI / 2;

class ValueAnimator {
    private args: ValueAnimatorArgs;
    private value: number;
    private difference: number;
    private _isDone = false;

    constructor(args: ValueAnimatorArgs) {
        this.args = args;
        this.value = args.start;
        this.difference = args.end - args.start;
    }

    public getId(): string {
      return this.args.id;
    }
    public isDone() { return this._isDone; }

    public onAnimationFrame(timestamp: number) {
        let secsFromStart = (timestamp - this.args.timestamp) / 1000;
        if (secsFromStart >= 1) {
            this._isDone = true;
            this.args.onChange(this.args.end);
        } else {
            let value = this.args.start + Math.sin(secsFromStart * HALF_OF_PI) * this.difference;
            this.args.onChange(value);
        }
    }
}

export = ValueAnimator;
