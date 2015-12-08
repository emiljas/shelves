const assert = chai.assert;

import SegmentPrepender = require('../../src/loadSegments/SegmentPrepender');
import Segment = require('../../src/segments/Segment');

describe('SegmentPrepender', function() {
    const DUMMO_SEGMENTS = new Array<Segment>();
    const SEGMENT_WIDTHS = [200, 300, 100];

    it('first prepend (return last)', function() {
        prepend(1, { index: 2, x: -100 });
    });

    it('second prepend', function() {
        prepend(2, { index: 1, x: -400 });
    });

    function prepend(times: number, expectedResult: any) {
        let prepender = new SegmentPrepender(DUMMO_SEGMENTS, SEGMENT_WIDTHS);
        let result: any;
        _.times(times, function() {
            result = prepender.prepend();
        });
        assert.deepEqual(result, expectedResult);
    }
});
