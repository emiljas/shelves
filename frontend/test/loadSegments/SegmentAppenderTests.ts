const assert = chai.assert;

import SegmentAppender = require('../../src/loadSegments/SegmentAppender');
import Segment = require('../../src/segments/Segment');

describe('SegmentAppender', function() {
  it('append', function() {
    let initialScale = 0.3;
    let segments = new Array<Segment>();
    let canvasWidth = 600;
    let segmentWidths = [200 / initialScale, 300 / initialScale, 600 / initialScale, 100 / initialScale];
    let segmentIndex = 0;
    let createSegment: any = (): any => { return {}; };
    let startX = 100;
    let appender = new SegmentAppender({
      initialScale,
      segments,
      canvasWidth,
      segmentWidths,
      segmentIndex,
      startX,
      createSegment
    });
    appender.work(0);
    assert.equal(segments.length, 3);
  });

  it('unload', function() {
    let initialScale = 0.3;
    let segments = new Array<Segment>();
    let canvasWidth = 600;
    let segmentWidths = [200 / initialScale, 300 / initialScale, 600 / initialScale, 100 / initialScale];
    let segmentIndex = 0;
    let createSegment: any = (): any => { return {}; };
    let startX = 100;
    let appender = new SegmentAppender({
      initialScale,
      segments,
      canvasWidth,
      segmentWidths,
      segmentIndex,
      startX,
      createSegment
    });
    appender.work(0);
    appender.work(601);
    assert.equal(segments.length, 2);
  });
});

// describe('SegmentAppender', function() {
//     describe('append', function() {
//         const DUMMO_SEGMENTS = new Array<Segment>();
//         const DUMMO_CANVAS_WIDTH: number = null;
//         const SEGMENT_WIDTHS = [200, 300, 100];
//
//         it('first append', function() {
//             append(1, { index: 0, x: 0 });
//         });
//
//         it('third append', function() {
//             append(3, { index: 2, x: 500 });
//         });
//
//         it('fourth append (return first)', function() {
//             append(4, { index: 0, x: 600 });
//         });
//
//         function append(times: number, expectedResult: any) {
//             let appender = new SegmentAppender(SEGMENT_WIDTHS);
//             let result: any;
//             _.times(times, function() {
//                 result = appender.append();
//             });
//             assert.deepEqual(result, expectedResult);
//         }
//     });
//
//     describe('shouldAppend', function() {
//       it('0 movement, should append', function() {
//         testShouldAppend({
//           segmentWidths: [200, 300, 100],
//           canvasWidth: 500, xMove: 0, scale: 0.5
//         }, true);
//       });
//
//       it('200 movement, should append', function() {
//         testShouldAppend({
//           segmentWidths: [200, 300, 100],
//           canvasWidth: 500, xMove: 200, scale: 0.5
//         }, true);
//       });
//
//       it('500 movement, should not append', function() {
//         testShouldAppend({
//           segmentWidths: [200, 300, 100],
//           canvasWidth: 500, xMove: 500, scale: 0.5
//         }, false);
//       });
//
//       function testShouldAppend(args: any, expectedShouldAppend: boolean) {
//         let appender = new SegmentAppender(args.segmentWidths);
//         let shouldAppend = appender.shouldAppend(args.canvasWidth, args.xMove, args.scale);
//         assert.equal(shouldAppend, expectedShouldAppend);
//       }
//     });
//
//     describe('unloadUnvisibleSegments', function() {
//         // it('new', function() {
//         //     let segments = new Array<Segment>();
//         //     let canvasWidth = 100;
//         //     let segmentWidths = [100, 200, 100];
//         //
//         //     let xMove = 0;
//         //     let scale = 0.3;
//         //
//         //     let appender = new SegmentAppender(segments, canvasWidth, segmentWidths);
//         //     appender.append();
//         //     appender.append();
//         //     appender.append();
//         //     appender.unloadUnvisibleSegments(xMove, scale);
//         //     assert.equal(segments.length, 0);
//         // });
//     });
// });
