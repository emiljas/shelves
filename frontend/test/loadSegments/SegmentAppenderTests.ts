const assert = chai.assert;

import SegmentAppender = require('../../src/loadSegments/SegmentAppender');
import ISegmentPlace = require('../../src/segments/ISegmentPlace');
import MockSegmentPlace = require('./MockSegmentPlace');


describe('SegmentAppender', function() {
    let INITIAL_SCALE = 0.3;
    let CANVAS_WIDTH = 600;
    let SEGMENT_WIDTHS = [200 / INITIAL_SCALE, 300 / INITIAL_SCALE, 600 / INITIAL_SCALE, 100 / INITIAL_SCALE];
    let START_SEGMENT_INDEX = 0;
    let START_X = 100;
    let createSegment = (index: number, x: number): ISegmentPlace => { return new MockSegmentPlace(index, x); };

    it('append', function() {
        let segments = new Array<ISegmentPlace>();
        let appender = makeAppender(segments);
        appender.work(0);
        assert.equal(segments.length, 3);
    });

    // it('append2', function() {
    //     let segments = new Array<ISegmentPlace>();
    //     let appender = makeAppender(segments);
    //     appender.work(0);
    //     appender.work(-601);
    //     appender.work(-1201);
    //     appender.work(-2401);
    //     appender.work(-99999);
    //     appender.work(0);
    //     assert.equal(segments.length, 3);
    // });

    it('unload', function() {
        let segments = new Array<ISegmentPlace>();
        let appender = makeAppender(segments);
        appender.work(0);
        appender.work(601);
        assert.equal(segments.length, 2);
    });

    function makeAppender(segments: Array<ISegmentPlace>): SegmentAppender {
        let appender = new SegmentAppender({
            INITIAL_SCALE,
            CANVAS_WIDTH,
            SEGMENT_WIDTHS,
            START_SEGMENT_INDEX,
            START_X,
            segments,
            createSegment
        });
        return appender;
    }
});
