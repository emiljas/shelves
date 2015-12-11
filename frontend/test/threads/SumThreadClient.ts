import ThreadClient = require('../../src/threads/ThreadClient');
import SumWorker = require('./sum.worker');
import SumResult = require('./SumResult');

class SumThreadClient extends ThreadClient<Array<number>, SumResult> {
    constructor() {
        super(SumWorker);
    }
}

export = SumThreadClient;
