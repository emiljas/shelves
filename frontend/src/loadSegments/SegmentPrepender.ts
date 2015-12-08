import LoadSegmentResult = require('./LoadSegmentResult');
import Segment = require('../segments/Segment');
import LoopIndex = require('./LoopIndex');

class SegmentPrepender {
    private segmentWidths: Array<number>;
    private segmentCount: number;
    private currentIndex = 0;
    private currentX = 0;
    private loopIndex: LoopIndex;

    constructor(segments: Array<Segment>, segmentWidths: Array<number>) {
        this.segmentWidths = segmentWidths;
        this.segmentCount = segmentWidths.length;
        this.loopIndex = new LoopIndex(this.segmentCount, 0);
    }

    public shouldPrepend(xMove: number, scale: number): boolean {
        return xMove / scale + this.currentX > 0;
    }

    public prepend(): LoadSegmentResult {
        this.currentIndex = this.loopIndex.prev();
        let segmentWidth = this.segmentWidths[this.currentIndex];
        this.currentX -= segmentWidth;
        return { index: this.currentIndex, x: this.currentX };
    }
}

export = SegmentPrepender;
