'use strict';

import ViewPort = require('./ViewPort');
import Segment = require('./Segment');
import SegmentPrepender = require('./loadSegments/SegmentPrepender');
import SegmentAppender = require('./loadSegments/SegmentAppender');
import LoadSegmentResult = require('./loadSegments/LoadSegmentResult');

class Segments {
    public segments = new Array<Segment>();

    private viewPort: ViewPort;
    private segmentWidths: Array<number>;

    private prepender: SegmentPrepender;
    private appender: SegmentAppender;

    constructor(viewPort: ViewPort) {
        this.viewPort = viewPort;
        this.segmentWidths = JSON.parse(viewPort.getCanvas().getAttribute('data-segment-widths'));

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
        let xMove = this.viewPort.getXMove();
        let canvasWidth = this.viewPort.getWidth();

        if (this.prepender.shouldPrepend(xMove)) {
            let result = this.prepender.prepend();
            this.addSegment(result);
            console.log('prepend');
        }

        if (this.appender.shouldAppend(xMove, canvasWidth)) {
            let result = this.appender.append();
            this.addSegment(result);
            console.log('append');
        }
    }

    public addSegment(result: LoadSegmentResult) {
      let segment = new Segment(this.viewPort, result.index, result.x);
      this.segments.push(segment);
    }
}

export = Segments;
