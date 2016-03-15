import ValueAnimatorArgs = require('./ValueAnimatorArgs');
import ValueAnimator = require('./ValueAnimator');

class ValueAnimatorController {
    private animators = new Array<ValueAnimator>();

    public add(args: ValueAnimatorArgs): void {
      setTimeout(() => {
        if (this.animationsInProgressExists()) {
          return;
        }

        this.animators.push(new ValueAnimator(args));
      }, 0);
    }

    public addBatch(argsList: Array<ValueAnimatorArgs>): void {
      setTimeout(() => {
        if (this.animationsInProgressExists()) {
          return;
        }

        for (let args of argsList) {
          this.animators.push(new ValueAnimator(args));
        }
      }, 0);
    }

    public remove(id: string): void {
      for (let animator of this.animators) {
        if (animator.getId() === id) {
          _.pull(this.animators, animator);
        }
      }
    }

    public animationsInProgressExists(): boolean {
      return this.animators.length > 0;
    }

    public onAnimationFrame(timestamp: number) {
        for (let animator of this.animators) {
            animator.onAnimationFrame(timestamp);
            this.removeAnimatorIfDone(animator);
        }
    }

    private removeAnimatorIfDone(animator: ValueAnimator): void {
        if (animator.isDone()) {
            _.pull(this.animators, animator);
        }
    }
}

export = ValueAnimatorController;
