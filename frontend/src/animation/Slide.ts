import SlideArgs = require('./SlideArgs');

//full move per second
class Slide {
    private startTimeStamp: number;
    private distance: number;
    private xMove: number;
    private isDone = false;

    constructor(args: SlideArgs) {
        this.distance = args.distance;
        this.xMove = args.xMove;
        this.startTimeStamp = args.timestamp;
    }

    public IsDone() { return this.isDone; }

    public calcXMove(timestamp: number): number {
        let secsFromStart = (timestamp - this.startTimeStamp) / 1000;
        let xMovePerFrame = Math.sin(secsFromStart * (Math.PI / 2)) * this.distance;

        if (secsFromStart >= 0.95) {
            this.isDone = true;
            console.log("DONE!");
        }

        this.xMove += xMovePerFrame;
        this.distance -= xMovePerFrame;

        return this.xMove;
    }
}

export = Slide;
