'use strict';

import ViewPort = require('./ViewPort');
import Segment = require('./Segment');
import SegmentPrepender = require('./loadSegments/SegmentPrepender');
import SegmentAppender = require('./loadSegments/SegmentAppender');
import LoadSegmentResult = require('./loadSegments/LoadSegmentResult');
import TapInput = require('./TapInput');

class Segments {
    public segments = new Array<Segment>();

    private viewPort: ViewPort;
    private segmentWidths: Array<number>;

    private prepender: SegmentPrepender;
    private appender: SegmentAppender;

    constructor(viewPort: ViewPort, segmentWidths: Array<number>) {
        this.viewPort = viewPort;
        this.segmentWidths = segmentWidths;

        this.prepender = new SegmentPrepender(this.segmentWidths);
        this.appender = new SegmentAppender(this.segmentWidths);
    }

    public onClick(e: TapInput): void {
        let scale = this.viewPort.getScale();
        console.log(scale);
        e.x -= this.viewPort.getXMove();
        e.x /= scale;
        e.y /= scale;

        let clickedSegment: Segment;
        for (let segment of this.segments) {
            if (segment.isClicked(e)) {
                clickedSegment = segment;
                break;
            }
        }

        if (clickedSegment) {
            clickedSegment.fitOnViewPort();
        } else {
            console.log('brak segmenty klik');
        }
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
        }

        if (this.appender.shouldAppend(xMove, canvasWidth)) {
            let result = this.appender.append();
            this.addSegment(result);
        }
    }

    public addSegment(result: LoadSegmentResult) {
        let segment = new Segment(this.viewPort, result.index, result.x);
        this.segments.push(segment);
    }
}

export = Segments;
