const assert = chai.assert;

import Slide = require('../../src/animation/Slide');

describe('Slide', function() {
    const X_MOVE = 500;
    const DISTANCE = 100;
    const FIRST_TIMESTAMP = 1000;

    it('0ms after start - no move', function() {
        assert.deepEqual(getXMove(1000), 500);
    });

    it('1000ms - moved by distance', function() {
        assert.equal(getXMove(2000), 600);
    });

    it('xMove increases with every step', function() {
        assert.isTrue(getXMove(1001) < getXMove(1200));
        assert.isTrue(getXMove(1200) < getXMove(1700));
        assert.isTrue(getXMove(1700) < getXMove(2000));
    });

    it('is not done before 1000ms', function() {
        assert.isFalse(isDone(1001));
        assert.isFalse(isDone(1999));
    });

    it('is done when after 1000ms', function() {
        assert.isTrue(isDone(2000));
    });

    function isDone(timestamp: number) {
      return test(timestamp).isDone;
    }

    function getXMove(timestamp: number) {
      return test(timestamp).xMove;
    }

    function test(timestamp: number) {
        let slide = new Slide({
            xMove: X_MOVE,
            distance: DISTANCE,
            timestamp: FIRST_TIMESTAMP
        });

        return slide.frame(timestamp);
    }
});
