// /// <reference path="../typings/tsd.d.ts" />
//
// var assert = chai.assert;
// import SegmentRepository from '../src/repository/SegmentRepository';
//
// describe('SegmentRepository', () => {
//   describe('getByPosition', () => {
//     it('throws Error when no data', function() {
//       var segmentRepository = new SegmentRepository();
//       var promise = segmentRepository.getByPosition(1);
//       return assert.isRejected(promise, /no data/);
//     });
//
//     it('', () => {
//       var segmentRepository = new SegmentRepository();
//       segmentRepository.injectSegments([1, 2, 3])
//       var promise = segmentRepository.getByPosition(1);
//       return assert.eventually.equal(promise, 1);
//     });
//   });
// });
