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
});
