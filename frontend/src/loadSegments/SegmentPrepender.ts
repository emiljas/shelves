import LoadSegmentResult = require('./LoadSegmentResult');
import Segment = require('../segments/Segment');
import LoopIndex = require('./LoopIndex');

class SegmentPrepender {
    private segmentCount: number;
    private currentIndex = 0;
    private currentX = 0;
    private loopIndex: LoopIndex;

    constructor(
        private segments: Array<Segment>,
        private segmentWidths: Array<number>
    ) {
        this.segmentCount = segmentWidths.length;
        this.loopIndex = new LoopIndex(this.segmentCount, 0);
    }

    public shouldPrepend(xMove: number, scale: number): boolean {
        return xMove / scale + this.currentX > 0;
    }

    public unloadUnvisibleSegments() {
        for (let segment of this.segments) {
            if (segment.isBeforeCanvasVisibleArea()) {
                this.currentIndex = this.loopIndex.next();
                this.currentX += segment.getWidth();
                _.pull(this.segments, segment);
            }
        }
    }

    public prepend(): LoadSegmentResult {
        this.currentIndex = this.loopIndex.prev();
        let segmentWidth = this.segmentWidths[this.currentIndex];
        this.currentX -= segmentWidth;
        return { index: this.currentIndex, x: this.currentX };
    }
}

export = SegmentPrepender;
