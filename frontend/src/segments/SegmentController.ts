'use strict';

import ViewPort = require('../ViewPort');
import Segment = require('./Segment');
import SegmentPrepender = require('../loadSegments/SegmentPrepender');
import SegmentAppender = require('../loadSegments/SegmentAppender');
import LoadSegmentResult = require('../loadSegments/LoadSegmentResult');
import TapInput = require('../touch/TapInput');

class SegmentController {
    private segments = new Array<Segment>();
    private prepender: SegmentPrepender;
    // private appender: SegmentAppender;

    constructor(
      private viewPort: ViewPort,
      private segmentWidths: Array<number>
    ) {
        let canvasWidth = this.viewPort.getCanvasWidth();
        this.prepender = new SegmentPrepender(this.segments, this.segmentWidths);
        // this.appender = <any>null; //new SegmentAppender(this.segments, canvasWidth, this.segmentWidths);
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
        let scale = this.viewPort.getScale();

        if (this.prepender.shouldPrepend(xMove, scale)) {
            let result = this.prepender.prepend();
            this.addSegment(result);
        }
        this.prepender.unloadUnvisibleSegments();

        // if (this.appender.shouldAppend(0, xMove, scale)) {
        //     let result = this.appender.append();
        //     this.addSegment(result);
        // }
        // this.appender.unloadUnvisibleSegments();
    }

    public addSegment(result: LoadSegmentResult) {
        let segment = new Segment(this.viewPort, result.index, result.x);
        this.segments.push(segment);
    }
}

export = SegmentController;
