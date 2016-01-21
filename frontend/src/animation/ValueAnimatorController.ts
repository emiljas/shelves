import ValueAnimatorArgs = require('./ValueAnimatorArgs');
import ValueAnimator = require('./ValueAnimator');
// import AnimatedValuesLock = require('./AnimatedValuesLock');

class ValueAnimatorController {
    private animators = new Array<ValueAnimator>();
    // private lock = new AnimatedValuesLock();

    public add(args: ValueAnimatorArgs) {
        // if (this.lock.isUnlock(args.id)) {
            // this.lock.lock(args.id);
            this.animators.push(new ValueAnimator(args));
        // }
    }

    public remove(id: string) {
      for (let animator of this.animators) {
        if (animator.getId() === id) {
          _.pull(this.animators, animator);
        }
      }
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
            // this.lock.unlock(animator.getId());
        }
    }
}

export = ValueAnimatorController;
