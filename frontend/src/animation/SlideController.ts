import ViewPort = require('../ViewPort');
import Slide = require('./Slide');
import SlideArgs = require('./SlideArgs');

class SlideController {
    private viewPort: ViewPort;
    private slide: Slide;

    constructor(viewPort: ViewPort) {
        this.viewPort = viewPort;
    }

    public onAnimationFrame(timestamp: number) {
        if (this.slide) {
            let xMove = this.slide.calcXMove(timestamp);
            this.viewPort.setXMove(xMove);

            if (this.slide.IsDone()) {
                this.slide = null;
            }
        }
    }

    public startSlide(args: SlideArgs) {
        if (!this.slide) {
            this.slide = new Slide(args);
        }
    }
}

export = SlideController;
