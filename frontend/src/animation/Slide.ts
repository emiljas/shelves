import SlideArgs = require('./SlideArgs');

const HALF_OF_PI = Math.PI / 2;

interface Result { xMove: number, isDone: boolean };

//full move per second
class Slide {
    private distance: number;
    private distanceLeft: number;
    private xMove: number;
    private startXMove: number;
    private startTimeStamp: number;

    constructor(args: SlideArgs) {
        this.distance = args.distance;
        this.distanceLeft = args.distance;
        this.xMove = args.xMove;
        this.startXMove = args.xMove;
        this.startTimeStamp = args.timestamp;
    }

    public frame(timestamp: number): Result {
        let secsFromStart = (timestamp - this.startTimeStamp) / 1000;

        let xMove = Math.round(this.startXMove + Math.sin(secsFromStart * HALF_OF_PI) * this.distance);

        if (secsFromStart >= 1) {
            return { xMove: this.startXMove + this.distance, isDone: true };
        }

        return { xMove: xMove, isDone: false };
    }
}

export = Slide;
