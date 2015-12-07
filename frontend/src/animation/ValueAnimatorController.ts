import ValueAnimatorArgs = require('./ValueAnimatorArgs');
import ValueAnimator = require('./ValueAnimator');

class ValueAnimatorController {
    private animators = new Array<ValueAnimator>();

    public add(args: ValueAnimatorArgs) {
        this.animators.push(new ValueAnimator(args));
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