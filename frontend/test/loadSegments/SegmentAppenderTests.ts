const assert = chai.assert;

import SegmentAppender = require('../../src/loadSegments/SegmentAppender');
import SegmentPlace = require('../../src/segments/SegmentPlace');

class MockSegmentPlace implements SegmentPlace {
    constructor(private index: number, private x: number) {
    }

    public getIndex(): number { return this.index; }
    public getX(): number { return this.x; }
}

describe('SegmentAppender', function() {
    let INITIAL_SCALE = 0.3;
    let CANVAS_WIDTH = 600;
    let SEGMENT_WIDTHS = [200 / INITIAL_SCALE, 300 / INITIAL_SCALE, 600 / INITIAL_SCALE, 100 / INITIAL_SCALE];
    let START_SEGMENT_INDEX = 0;
    let START_X = 100;
    let createSegment = (index: number, x: number): SegmentPlace => { return new MockSegmentPlace(index, x); };

    it('append', function() {
        let segments = new Array<SegmentPlace>();
        let appender = new SegmentAppender({
            INITIAL_SCALE,
            CANVAS_WIDTH,
            SEGMENT_WIDTHS,
            START_SEGMENT_INDEX,
            START_X,
            segments,
            createSegment
        });
        appender.work(0);
        assert.equal(segments.length, 3);
    });

    it('unload', function() {
        let segments = new Array<SegmentPlace>();
        let appender = new SegmentAppender({
            INITIAL_SCALE,
            CANVAS_WIDTH,
            SEGMENT_WIDTHS,
            START_SEGMENT_INDEX,
            START_X,
            segments,
            createSegment
        });
        appender.work(0);
        appender.work(601);
        assert.equal(segments.length, 2);
    });
});
