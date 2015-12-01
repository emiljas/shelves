import SlideArgs = require('./SlideArgs');

const HALF_OF_PI = Math.PI / 2;

interface Result { xMove: number; isDone: boolean; }

//full move per second
class Slide {
    private DISTANCE: number;
    private X_MOVE: number;
    private TIMESTAMP: number;

    constructor(args: SlideArgs) {
        this.DISTANCE = args.distance;
        this.X_MOVE = args.xMove;
        this.TIMESTAMP = args.timestamp;
    }

    public frame(timestamp: number): Result {
        let secsFromStart = (timestamp - this.TIMESTAMP) / 1000;

        if (secsFromStart >= 1) {
            return {
                xMove: this.X_MOVE + this.DISTANCE,
                isDone: true
            };
        } else {
            let xMove = this.X_MOVE + Math.sin(secsFromStart * HALF_OF_PI) * this.DISTANCE;
            return {
                xMove: xMove,
                isDone: false
            };
        }
    }
}

export = Slide;
