const assert = chai.assert;

import SegmentAppender = require('../../src/loadSegments/SegmentAppender');

describe('SegmentAppender', function() {
    describe('append', function() {
        const DUMMO_CANVAS_WIDTH: number = null;
        const DUMMO_INITIAL_SCALE: number = null;
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
            let appender = new SegmentAppender(DUMMO_CANVAS_WIDTH, SEGMENT_WIDTHS, DUMMO_INITIAL_SCALE);
            let result: any;
            _.times(times, function() {
                result = appender.append();
            });
            assert.deepEqual(result, expectedResult);
        }
    });
    // 
    // describe('shouldAppend', function() {
    //   it('test', function() {
    //     let appender = new SegmentAppender(600, [200 / 0.33, 300 / 0.33, 100 / 0.33], 0.33);
    //     assert.isTrue(appender.shouldAppend(600), 'before any append');
    //     appender.append();
    //     appender.append();
    //     appender.append();
    //   });
    // });
});
