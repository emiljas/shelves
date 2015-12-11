// import Thread = require('../../src/threads/Thread.ts');
// const assert = chai.assert;
//
// describe('Thread', function() {
//     it('test', function(done) {
//         let addThread = new Thread<Array<number>, number>(function(e: any, postMessage: any) {
//             postMessage(e.data.data[0] + e.data.data[1]);
//         });
//
//         addThread.postMessage([1, 2]).then(function(sum) {
//             assert.equal(sum, 3);
//             done();
//         });
//     });
// });
