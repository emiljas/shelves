import LoadSegmentResult = require('./LoadSegmentResult');
import Segment = require('../segments/Segment');
import LoopIndex = require('./LoopIndex');

class SegmentAppender {
    private segmentCount: number;
    private nextIndex = 0;
    private loopIndex: LoopIndex;
    private nextX = 0;

    constructor(
        private segments: Array<Segment>,
        private canvasWidth: number,
        private segmentWidths: Array<number>
    ) {
        this.segmentCount = segmentWidths.length;
        this.loopIndex = new LoopIndex(this.segmentCount, 0);
    }

    public shouldAppend(xMove: number, scale: number): boolean {
        return xMove / scale - this.canvasWidth / scale + this.nextX < 0;
    }

    public unloadUnvisibleSegments() {
        for (let segment of this.segments) {
            if (segment.isAfterCanvasVisibleArea()) {
                this.nextIndex = this.loopIndex.prev();
                this.nextX -= segment.getWidth();
                _.pull(this.segments, segment);
            }
        }
    }

    public append(): LoadSegmentResult {
        let result = { index: this.nextIndex, x: this.nextX };
        let segmentWidth = this.segmentWidths[this.nextIndex];
        this.nextX += segmentWidth;
        this.nextIndex = this.loopIndex.next();
        return result;
    }
}

export = SegmentAppender;
