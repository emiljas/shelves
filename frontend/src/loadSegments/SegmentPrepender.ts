import LoopIndex = require('./LoopIndex');
import SegmentAppenderArgs = require('./SegmentAppenderArgs');
import ISegmentPlace = require('../segments/ISegmentPlace');

class SegmentPrepender {
    private loopIndex: LoopIndex;
    private currentIndex: number;
    private currentX: number = 0;

    constructor(private args: SegmentAppenderArgs) {
         let segmentCount = args.SEGMENT_WIDTHS.length;
         this.loopIndex = new LoopIndex(segmentCount, args.START_SEGMENT_INDEX);
         this.currentIndex = args.START_SEGMENT_INDEX;
         this.currentX = args.START_X / args.INITIAL_SCALE;
    }

    public work(xMove: number): void {
      while (this.shouldPrepend(xMove)) {
        this.prepend();
      }

      this.unloadUnvisibleSegments(xMove);
    }

    private shouldPrepend(xMove: number): boolean {
         let freeSpace = xMove + this.currentX * this.args.INITIAL_SCALE;
         return Math.round(freeSpace + this.args.CANVAS_WIDTH) >= 0;
    }

    private prepend(): void {
        this.currentIndex = this.loopIndex.prev();
        let segmentWidth = this.args.SEGMENT_WIDTHS[this.currentIndex];
        this.currentX -= segmentWidth;
        let segment = this.args.createSegment(this.currentIndex, this.currentX);
        this.args.segments.push(segment);
    }

    private unloadUnvisibleSegments(xMove: number) {
        for (let segment of this.args.segments) {
            let segmentX = segment.getX();
            let segmentWidth = this.getSegmentWidth(segment);
            if (this.isSegmentBeforeCanvasVisibleArea(xMove, segmentX, segmentWidth)) {
                this.currentIndex = this.loopIndex.next();
                this.currentX += segmentWidth;
                _.pull(this.args.segments, segment);
            }
        }
    }

    private isSegmentBeforeCanvasVisibleArea(xMove: number, segmentX: number, segmentWidth: number): boolean {
        let distanceFromCanvasLeftEdge = xMove + segmentX * this.args.INITIAL_SCALE + segmentWidth * this.args.INITIAL_SCALE;
        return Math.round(distanceFromCanvasLeftEdge) <= -this.args.CANVAS_WIDTH;
    }

    private getSegmentWidth(segment: ISegmentPlace): number {
        let segmentWidth = this.args.SEGMENT_WIDTHS[segment.getIndex()];
        return segmentWidth;
    }
}

export = SegmentPrepender;
