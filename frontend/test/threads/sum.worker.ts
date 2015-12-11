import Thread = require('../../src/threads/Thread');

let thread = new Thread();
thread.on = (e) => {
    return Promise.resolve({
        sum: e.data[0] + e.data[1]
    });
};


export = (<any>thread);
