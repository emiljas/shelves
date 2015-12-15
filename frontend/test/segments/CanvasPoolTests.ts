const assert = chai.assert;
import CanvasPool = require('../../src/segments/CanvasPool');

describe('CanvasPool', function() {
  it('release canvas is return back to pool', function() {
    let pool = new CanvasPool(100, 200);
    let first = pool.get();
    pool.release(first);
    let second = pool.get();
    assert.equal(first, second);
  });
});
