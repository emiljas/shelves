import LoadSegmentResult = require('./LoadSegmentResult');
import SegmentPlace = require('../segments/SegmentPlace');
import LoopIndex = require('./LoopIndex');

class SegmentAppender {
    private segmentCount: number;
    private nextIndex = 0;
    private loopIndex: LoopIndex;
    private nextX = 0;

    constructor(
        private segments: Array<SegmentPlace>,
        private canvasWidth: number,
        private segmentWidths: Array<number>
    ) {
        this.segmentCount = segmentWidths.length;
        this.loopIndex = new LoopIndex(this.segmentCount, 0);
    }

    public shouldAppend(xMove: number, scale: number): boolean {
        return xMove / scale - this.canvasWidth / scale + this.nextX < 0;
    }

    // public unloadUnvisibleSegments(xMove: number, scale: number) {
    //     for (let segment of this.segments) {
    //         if (this.isSegmentAfterCanvasVisibleArea(xMove, scale, segment.getX())) {
    //             this.nextIndex = this.loopIndex.prev();
    //             this.nextX -= segment.getWidth();
    //             _.pull(this.segments, segment);
    //         }
    //     }
    // }

    public append(): LoadSegmentResult {
        let result = { index: this.nextIndex, x: this.nextX };
        let segmentWidth = this.segmentWidths[this.nextIndex];
        this.nextX += segmentWidth;
        this.nextIndex = this.loopIndex.next();
        return result;
    }

    // private isSegmentAfterCanvasVisibleArea(xMove: number, scale: number, segmentX: number) {
    //     return xMove / scale - this.canvasWidth / scale + segmentX > 0;
    // }
}

export = SegmentAppender;
