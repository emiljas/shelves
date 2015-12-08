import LoadSegmentResult = require('./LoadSegmentResult');
import Segment = require('../segments/Segment');

class SegmentAppender {
    private segments: Array<Segment>;
    private canvasWidth: number;
    private segmentWidths: Array<number>;
    private segmentCount: number;
    private nextIndex = 0;
    private nextX = 0;

    constructor(segments: Array<Segment>, canvasWidth: number, segmentWidths: Array<number>) {
        this.segments = segments;
        this.canvasWidth = canvasWidth;
        this.segmentWidths = segmentWidths;
        this.segmentCount = segmentWidths.length;
    }

    public shouldAppend(xMove: number, scale: number): boolean {
        return xMove / scale - this.canvasWidth / scale + this.nextX < 0;
    }

    public unloadUnvisibleSegments() {
        for (let segment of this.segments) {
            if (segment.isAfterCanvasVisibleArea()) {
              this.nextIndex -= 1;
              this.nextX -= segment.getWidth();
              _.pull(this.segments, segment);
            }
        }
    }

    public append(): LoadSegmentResult {
        this.nextIndex = this.getZeroIndexIfUnderLast(this.nextIndex);
        let result = { index: this.nextIndex, x: this.nextX };
        let segmentWidth = this.segmentWidths[this.nextIndex];
        this.nextX += segmentWidth;
        this.nextIndex++;
        return result;
    }

    private getZeroIndexIfUnderLast(index: number): number {
        if (index === this.segmentCount) {
            return 0;
        } else {
            return index;
        }
    }
}

export = SegmentAppender;
