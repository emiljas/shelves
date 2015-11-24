import BaseSegmentAppender = require('./BaseSegmentAppender');

class SegmentAppender extends BaseSegmentAppender {
    private segmentWidths: Array<number>;
    private segmentCount: number;
    private nextIndex = 0;
    private nextX = 0;

    constructor(segmentWidths: Array<number>) {
      this.segmentWidths = segmentWidths;
      this.segmentCount = segmentWidths.length;
    }

    public append() {
        this.nextIndex = this.getZeroIndexIfUnderLast(this.nextIndex);
        let index = this.nextIndex;
        let x = this.nextX;

        let segmentWidth = this.segmentWidths[index];
        this.nextX += segmentWidth;

        this.nextIndex++;
        return { index, x };
    }

    private getZeroIndexIfUnderLast(index: number): number {
        if (index === this.segmentCount) {
            return 0;
        } else if (index >= 0 && index < this.segmentCount) {
            return index;
        } else {
            throw 'Segments: index > segment count';
        }
    }
}

export = SegmentAppender;
