import LoadSegmentResult = require('./LoadSegmentResult');

class SegmentAppender {
    private canvasWidth: number;
    private segmentWidths: Array<number>;
    private segmentCount: number;
    private initialScale: number;
    private nextIndex = 0;
    private nextX = 0;

    constructor(canvasWidth: number, segmentWidths: Array<number>, initialScale: number) {
        this.canvasWidth = canvasWidth;
        this.segmentWidths = segmentWidths;
        this.segmentCount = segmentWidths.length;
        this.initialScale = initialScale;
    }

    public shouldAppend(xMove: number): boolean {
        return xMove / this.initialScale - this.canvasWidth / this.initialScale + this.nextX < 0;
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
