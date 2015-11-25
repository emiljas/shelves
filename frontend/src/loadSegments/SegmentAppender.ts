import LoadSegmentResult = require('./LoadSegmentResult');

class SegmentAppender {
    private segmentWidths: Array<number>;
    private segmentCount: number;
    private nextIndex = 0;
    private nextX = 0;

    constructor(segmentWidths: Array<number>) {
        this.segmentWidths = segmentWidths;
        this.segmentCount = segmentWidths.length;
    }

    public shouldAppend(xMove: number, canvasWidth: number): boolean {
        return xMove * 3 - canvasWidth * 3 + this.nextX < 0;
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
