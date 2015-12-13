const assert = chai.assert;

import SegmentAppender = require('../../src/loadSegments/SegmentAppender');
import Segment = require('../../src/segments/Segment');

describe('SegmentAppender', function() {
    describe('append', function() {
        const DUMMO_SEGMENTS = new Array<Segment>();
        const DUMMO_CANVAS_WIDTH: number = null;
        const SEGMENT_WIDTHS = [200, 300, 100];

        it('first append', function() {
            append(1, { index: 0, x: 0 });
        });

        it('third append', function() {
            append(3, { index: 2, x: 500 });
        });

        it('fourth append (return first)', function() {
            append(4, { index: 0, x: 600 });
        });

        function append(times: number, expectedResult: any) {
            let appender = new SegmentAppender(DUMMO_SEGMENTS, DUMMO_CANVAS_WIDTH, SEGMENT_WIDTHS);
            let result: any;
            _.times(times, function() {
                result = appender.append();
            });
            assert.deepEqual(result, expectedResult);
        }
    });

    describe('unloadUnvisibleSegments', function() {
        // it('new', function() {
        //     let segments = new Array<Segment>();
        //     let canvasWidth = 100;
        //     let segmentWidths = [100, 200, 100];
        //
        //     let xMove = 0;
        //     let scale = 0.3;
        //
        //     let appender = new SegmentAppender(segments, canvasWidth, segmentWidths);
        //     appender.append();
        //     appender.append();
        //     appender.append();
        //     appender.unloadUnvisibleSegments(xMove, scale);
        //     assert.equal(segments.length, 0);
        // });
    });
});
