'use strict';

import Canvas from './Canvas';
import Segment from './Segment';
// import cyclePosition from './cyclePosition';

const SPACE_BETWEEN_SEGMENTS = 50;

export default class Segments {
    public segments = new Array<Segment>();

    private canvas: Canvas;
    private backPosition = 0;
    private backX = 0;
    private frontPosition = 0;
    private frontX = 0;
    private segmentWidths: Array<number>;
    private segmentCount: number;

    constructor(canvas: Canvas) {
        this.canvas = canvas;
        this.segmentWidths = JSON.parse(canvas.canvas.getAttribute('data-segment-widths'));
        this.segmentCount = this.segmentWidths.length;
    }

    public draw() {
        for (let segment of this.segments) {
            segment.draw();
        }
        this.preloadSegments();
    }

    public preloadSegments() {
        if (this.canvas.xMove * 3 + this.backX > 0) {
            this.prependSegment();
        }

        if (this.canvas.xMove * 3 - this.canvas.canvasWidth * 3 + this.frontX < 0) {
            this.appendSegment();
        }
    }

    public prependSegment() {
        this.backPosition = this.getLastIndexIfBelowZero(this.backPosition - 1);
        let index = this.backPosition;

        let segmentWidth = this.segmentWidths[index];
        this.backX -= segmentWidth + SPACE_BETWEEN_SEGMENTS;

        let segment = new Segment(this.canvas, index, this.backX);
        this.segments.push(segment);

        segment.load(segment);
    }

    public appendSegment() {
        this.frontPosition = this.getZeroIndexIfUnderLast(this.frontPosition + 1);
        let index = this.frontPosition;
        console.log(index);

        let segment = new Segment(this.canvas, index, this.frontX);
        this.segments.push(segment);

        let segmentWidth = this.segmentWidths[index];
        this.frontX += segmentWidth + SPACE_BETWEEN_SEGMENTS;

        segment.load(segment);
    }

    private getLastIndexIfBelowZero(index: number): number {
        if (index === -1) {
            return this.segmentCount - 1;
        } else if (index >= 0 && index < this.segmentCount) {
            return index;
        } else {
            throw 'Segments: index < -1';
        }
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

    // private cyclePosition(index: number): number {
    //     if (index === this.segmentCount) {
    //         return 0;
    //     } else if (index === -1) {
    //         return this.segmentCount;
    //     } else if (index >= 0 && index < this.segmentCount) {
    //         return index;
    //     } else {
    //         throw 'cyclePosition: index must be in range of -1 to segment count';
    //     }
    // }
}
