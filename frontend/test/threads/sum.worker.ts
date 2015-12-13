import Thread = require('../../src/threads/Thread');
import SumResult = require('./SumResult');

let thread = new Thread<Array<number>, SumResult>();
thread.on = (e) => {
    return Promise.resolve({
        sum: e.data[0] + e.data[1]
    });
};


export = (<any>thread);
