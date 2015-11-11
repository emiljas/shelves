/// <reference path="../typings/tsd.d.ts" />

var assert = chai.assert;
import SegmentRepository from '../src/repository/SegmentRepository';

describe('t', function() {

  it('t1', function() {
    var segmentRepository = new SegmentRepository();
    var promise = segmentRepository.getByPosition(1);
    return assert.isRejected(promise, Error, 'no f data');
  });

  it('t2', function() {
    var segmentRepository = new SegmentRepository();
    var promise = segmentRepository.getByPosition(1);
    return assert.isFulfilled(promise);
  });

});
