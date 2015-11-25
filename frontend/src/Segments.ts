'use strict';

import Canvas = require('./Canvas');
import Segment = require('./Segment');
import SegmentPrepender = require('./loadSegments/SegmentPrepender');
import SegmentAppender = require('./loadSegments/SegmentAppender');

class Segments {
    public segments = new Array<Segment>();

    private canvas: Canvas;
    private segmentWidths: Array<number>;
    private prepender: SegmentPrepender;
    private appender: SegmentAppender;

    constructor(canvas: Canvas) {
        this.canvas = canvas;
        this.segmentWidths = JSON.parse(canvas.canvasElement.getAttribute('data-segment-widths'));
        this.prepender = new SegmentPrepender(this.segmentWidths);
        this.appender = new SegmentAppender(this.segmentWidths);
    }

    public draw() {
        for (let segment of this.segments) {
            segment.draw();
        }
        this.preloadSegments();
    }

    public preloadSegments() {
      // this.appender.append();
        // if (this.canvas.xMove * 3 + this.backX > 0) {
        //     this.prependSegment();
        // }
        //
        // if (this.canvas.xMove * 3 - this.canvas.canvasWidth * 3 + this.frontX < 0) {
        //     this.appendSegment();
        // }
    }

    public appendSegment() {
      this.appender.append();
    }
}

export = Segments;
