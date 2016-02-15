import SegmentAppenderArgs = require('./SegmentAppenderArgs');
import LoopIndex = require('./LoopIndex');

/*
dodaje i usuwa segmenty
pierwszy segment dodany jest w x = START_X i ma index START_SEGMENT_INDEX
*/
class SegmentAppender {
    private segmentCount: number;
    private loopIndex: LoopIndex;
    private nextIndex: number = 0;
    private nextX: number = 0;

    constructor(private args: SegmentAppenderArgs) {
        this.segmentCount = args.SEGMENT_WIDTHS.length;
        this.loopIndex = new LoopIndex(this.segmentCount, args.START_SEGMENT_INDEX);
        this.nextIndex = args.START_SEGMENT_INDEX;
        this.nextX = args.START_X / this.args.INITIAL_SCALE;
    }

    public work(xMove: number): boolean {
        let wasSegmentsAppended = false;
        while (this.shouldAppend(xMove)) {
            this.append();
            wasSegmentsAppended = true;
        }

        this.unloadUnvisibleSegments(xMove);
        return wasSegmentsAppended;
    }

    private shouldAppend(xMove: number): boolean {
        let freeSpace = -xMove + this.args.CANVAS_WIDTH - this.nextX * this.args.INITIAL_SCALE;
        return Math.round(freeSpace + this.args.CANVAS_WIDTH) > 0;
    }

    private append(): void {
        let segmentWidth = this.args.SEGMENT_WIDTHS[this.nextIndex];
        let segment = this.args.createSegment(this.nextIndex, this.nextX, segmentWidth);
        this.args.segments.push(segment);
        this.nextX += segmentWidth;
        this.nextIndex = this.loopIndex.next();
    }

    private unloadUnvisibleSegments(xMove: number) {
        for (let segment of this.args.segments) {
            if (this.isSegmentAfterCanvasVisibleArea(xMove, segment.getX())) {
                this.nextIndex = this.loopIndex.prev();
                let segmentWidth = this.args.SEGMENT_WIDTHS[this.nextIndex];
                this.nextX -= segmentWidth;
                segment.unload();
                _.pull(this.args.segments, segment);
            }
        }
    }

    private isSegmentAfterCanvasVisibleArea(xMove: number, segmentX: number) {
        let distanceFromCanvasRightEdge = xMove - this.args.CANVAS_WIDTH + segmentX * this.args.INITIAL_SCALE;
        return Math.round(distanceFromCanvasRightEdge) > this.args.CANVAS_WIDTH;
    }
}

export = SegmentAppender;
