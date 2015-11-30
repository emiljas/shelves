import SlideArgs = require('./SlideArgs');

const HALF_OF_PI = Math.PI / 2;

//full move per second
class Slide {
    private distance: number;
    private distanceLeft: number;
    private xMove: number;
    private startXMove: number;
    private startTimeStamp: number;
    private isDone = false;

    constructor(args: SlideArgs) {
        this.distance = args.distance;
        this.distanceLeft = args.distance;
        this.xMove = args.xMove;
        this.startXMove = args.xMove;
        this.startTimeStamp = args.timestamp;
    }

    public IsDone() { return this.isDone; }

    public calcXMove(timestamp: number): number {
        let secsFromStart = (timestamp - this.startTimeStamp) / 1000;
        let xMovePerFrame = Math.sin(secsFromStart * HALF_OF_PI) * this.distanceLeft;

        this.xMove += xMovePerFrame;
        this.distanceLeft -= xMovePerFrame;

        if (this.distanceLeft * this.distance <= 0) {
            this.isDone = true;
            return this.startXMove + this.distance;
        }

        return this.xMove;
    }
}

export = Slide;
