'use strict';

import ViewPort = require('../ViewPort');
import Segment = require('./Segment');
import SegmentPrepender = require('../loadSegments/SegmentPrepender');
import SegmentAppender = require('../loadSegments/SegmentAppender');
import LoadSegmentResult = require('../loadSegments/LoadSegmentResult');
import TapInput = require('../touch/TapInput');

class SegmentController {
    private viewPort: ViewPort;
    private segments = new Array<Segment>();
    private segmentWidths: Array<number>;
    private prepender: SegmentPrepender;
    private appender: SegmentAppender;

    constructor(viewPort: ViewPort, segmentWidths: Array<number>, initialScale: number) {
        this.viewPort = viewPort;
        this.segmentWidths = segmentWidths;

        let canvasWidth = this.viewPort.getWidth();
        this.prepender = new SegmentPrepender(this.segmentWidths, initialScale);
        this.appender = new SegmentAppender(canvasWidth, this.segmentWidths, initialScale);
    }

    public onClick(e: TapInput): void {
        let scale = this.viewPort.getScale();

        e.x = (e.x - this.viewPort.getXMove()) / scale;
        e.y = (e.y - this.viewPort.getYMove() - this.viewPort.getY()) / scale;

        let clickedSegment: Segment;
        for (let segment of this.segments) {
            if (segment.isClicked(e)) {
                clickedSegment = segment;
                break;
            }
        }

        if (clickedSegment) {
            clickedSegment.fitOnViewPort(e.y);
        } else {
            console.error('cannot find clicked segment');
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

        if (this.prepender.shouldPrepend(xMove)) {
            let result = this.prepender.prepend();
            this.addSegment(result);
        }

        if (this.appender.shouldAppend(xMove)) {
            let result = this.appender.append();
            this.addSegment(result);
        }
    }

    public addSegment(result: LoadSegmentResult) {
        let segment = new Segment(this.viewPort, result.index, result.x);
        this.segments.push(segment);
    }
}

export = SegmentController;