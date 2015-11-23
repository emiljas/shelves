const assert = chai.assert;
let rewire = (<any>require)('rewire');


const segmentsImport: any = rewire('../src/Segments');

var o = {};
segmentsImport.__set__('./Segment', o);

import Segments = require('../src/Segments');
// const Segments = SegmentsImport.default;
// Segments.__set__('S')


describe('Segments', function() {
    describe('prependSegment', function() {
        it('', function() {
            let segments = new Segments(null);
            segments.preloadSegments();
            // segments.prependSegment();
            // console.log(Segments);
            // assert.ok(true);
        });
    });
});
