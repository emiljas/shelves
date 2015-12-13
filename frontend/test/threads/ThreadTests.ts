import SumThreadClient = require('./SumThreadClient');
// import FillArrayBufferThreadClient = require('./FillArrayBufferThreadClient');
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

  // it('send as transferable if ArrayBuffer', (done) => {
  //   let canvas = document.createElement('canvas');
  //   canvas.width = 100;
  //   canvas.height = 100;
  //   let ctx = canvas.getContext('2d');
  //   ctx.fillStyle = '#FFFFFF';
  //   ctx.fillRect(0, 0, canvas.width, canvas.height);
  //
  //
  //   let threadClient = new FillArrayBufferThreadClient();
  //   threadClient.post({}).then((result) => {
  //     assert.equal(result.ab[0], 1);
  //     done();
  //   }).catch((err) => {
  //     done(err);
  //   });
  // });
});
