const assert = chai.assert;
import AnimatedValuesLock = require('../../src/animation/AnimatedValuesLock');

describe('AnimatedValuesLock', function() {
    it('is unlock', function() {
        let lock = new AnimatedValuesLock();
        assert.isTrue(lock.isUnlock('id1'));
    });

    it('is lock', function() {
        let lock = new AnimatedValuesLock();
        lock.lock('id1');
        assert.isFalse(lock.isUnlock('id1'));
    });

    it('is unlock after lock', function() {
        let lock = new AnimatedValuesLock();
        lock.lock('id1');
        lock.unlock('id1');
        assert.isTrue(lock.isUnlock('id1'));
    });

    it('id2 is unlock after lock id1', function() {
        let lock = new AnimatedValuesLock();
        lock.lock('id1');
        assert.isTrue(lock.isUnlock('id2'));
    });
});
