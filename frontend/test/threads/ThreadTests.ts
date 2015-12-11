import SumThreadClient = require('./SumThreadClient');
const assert = chai.assert;


describe('Thread', function() {
  it('works', function(done) {
    let sumThreadClient = new SumThreadClient();
    let promises = [
      sumThreadClient.post([1, 10]),
      sumThreadClient.post([2, 10]),
      sumThreadClient.post([3, 10])
    ];

    Promise.all(promises).then((results) => {
      assert.equal(results[0].sum, 11);
      assert.equal(results[1].sum, 12);
      assert.equal(results[2].sum, 13);
      done();
    });
  });
});
