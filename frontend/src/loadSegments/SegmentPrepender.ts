import LoadSegmentResult = require('./LoadSegmentResult');

class SegmentPrepender {
    private segmentWidths: Array<number>;
    private segmentCount: number;
    private currentIndex = 0;
    private currentX = 0;

    constructor(segmentWidths: Array<number>) {
        this.segmentWidths = segmentWidths;
        this.segmentCount = segmentWidths.length;
    }

    public shouldPrepend(xMove: number): boolean {
        return xMove * 3 + this.currentX > 0;
    }

    public prepend(): LoadSegmentResult {
        this.currentIndex = this.getLastIndexIfBelowZero(this.currentIndex - 1);
        let segmentWidth = this.segmentWidths[this.currentIndex];
        this.currentX -= segmentWidth;
        return { index: this.currentIndex, x: this.currentX };
    }

    private getLastIndexIfBelowZero(index: number): number {
        if (index === -1) {
            return this.segmentCount - 1;
        } else {
            return index;
        }
    }
}

export = SegmentPrepender;
