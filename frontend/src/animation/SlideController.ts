import XMoveHolder = require('../XMoveHolder');
import Slide = require('./Slide');
import SlideArgs = require('./SlideArgs');

class SlideController {
    private xMoveHolder: XMoveHolder;
    private slide: Slide;
    private distanceLeft: number = 0;

    constructor(xMoveHolder: XMoveHolder) {
        this.xMoveHolder = xMoveHolder;
    }

    public onAnimationFrame(timestamp: number): void {
        if (this.slide) {
            let result = this.slide.animationFrame(timestamp);
            this.xMoveHolder.setXMove(result.xMove);

            this.distanceLeft = result.distanceLeft;

            if (result.isDone) {
                this.slide = null;
            }
        }
    }

    public startSlide(args: SlideArgs): void {
      args.distance += this.distanceLeft;
      this.slide = new Slide(args);
    }
}

export = SlideController;
