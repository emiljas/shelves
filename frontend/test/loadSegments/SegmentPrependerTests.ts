const assert = chai.assert;

import SegmentPrepender = require('../../src/loadSegments/SegmentPrepender');
import ISegmentPlace = require('../../src/segments/ISegmentPlace');
import MockSegmentPlace = require('./MockSegmentPlace');

describe('SegmentPrepender', function() {
    let INITIAL_SCALE = 0.3;
    let CANVAS_WIDTH = 600;
    let SEGMENT_WIDTHS = [
      100 / INITIAL_SCALE, 600 / INITIAL_SCALE, 300 / INITIAL_SCALE, 200 / INITIAL_SCALE,
      400 / INITIAL_SCALE //first appended segment
    ];
    let START_SEGMENT_INDEX = 4;
    let START_X = 500;
    let createSegment = (index: number, x: number): ISegmentPlace => { return new MockSegmentPlace(index, x); };

    it('prepend', function() {
        let segments = new Array<ISegmentPlace>();
        let prepender = makePrepender(segments);
        prepender.work(0);
        assert.equal(segments.length, 3);
    });

    it('one pixel before unload', function() {
        let segments = new Array<ISegmentPlace>();
        let prepender = makePrepender(segments);
        prepender.work(0);
        prepender.work(-599);
        assert.equal(segments.length, 3);
    });

    it('unload', function() {
        let segments = new Array<ISegmentPlace>();
        let prepender = makePrepender(segments);
        prepender.work(0);
        prepender.work(-602);
        assert.equal(segments.length, 2);
    });

    function makePrepender(segments: Array<ISegmentPlace>): SegmentPrepender {
        let prepender = new SegmentPrepender({
            INITIAL_SCALE,
            CANVAS_WIDTH,
            SEGMENT_WIDTHS,
            START_SEGMENT_INDEX,
            START_X,
            segments,
            createSegment
        });
        return prepender;
    }
});
