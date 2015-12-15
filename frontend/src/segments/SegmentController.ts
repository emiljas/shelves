'use strict';

import ViewPort = require('../ViewPort');
import Segment = require('./Segment');
import SegmentPrepender = require('../loadSegments/SegmentPrepender');
import SegmentAppender = require('../loadSegments/SegmentAppender');
import LoadSegmentResult = require('../loadSegments/LoadSegmentResult');
import TapInput = require('../touch/TapInput');
import SegmentAppenderArgs = require('../loadSegments/SegmentAppenderArgs');

class SegmentController {
    private segments = new Array<Segment>();
    private prepender: SegmentPrepender;
    private appender: SegmentAppender;

    constructor(
        private viewPort: ViewPort,
        private segmentWidths: Array<number>
    ) {
        let appenderArgs: SegmentAppenderArgs = {
            INITIAL_SCALE: viewPort.getInitialScale(),
            CANVAS_WIDTH: viewPort.getCanvasWidth(),
            SEGMENT_WIDTHS: segmentWidths,
            START_SEGMENT_INDEX: 0,
            START_X: 0,
            segments: this.segments,
            createSegment: (index, x) => { return new Segment(viewPort, index, x); }
        };
        this.prepender = new SegmentPrepender(appenderArgs);
        this.appender = new SegmentAppender(appenderArgs);
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
      console.log(this.segments.length);
      
        for (let segment of this.segments) {
            segment.draw();
        }
        this.preloadSegments();
    }

    public preloadSegments() {
        let xMove = this.viewPort.getXMove();
        this.appender.work(xMove);
        this.prepender.work(xMove);
    }

    public addSegment(result: LoadSegmentResult) {
        let segment = new Segment(this.viewPort, result.index, result.x);
        this.segments.push(segment);
    }
}

export = SegmentController;
