import ValueAnimator = require('../../src/animation/ValueAnimator');
const assert = chai.assert;

describe('ValueAnimator', function() {
    it('0 to 10 - values in asc order, last is 10', function() {
        let values = new Array<number>();
        let animator = new ValueAnimator({
            start: 0,
            end: 10,
            timestamp: 1000,
            onChange: (value) => { values.push(value); }
        });
        animator.onAnimationFrame(1000);
        animator.onAnimationFrame(1500);
        animator.onAnimationFrame(2000);

        assert.deepEqual(values, _.sortBy(values));
        assert.equal(values.length, 3);
        assert.equal(_.last(values), 10);
    });

    it('10 to 0 - values in desc order, last is 0', function() {
        let values = new Array<number>();
        let animator = new ValueAnimator({
            start: 10,
            end: 0,
            timestamp: 1000,
            onChange: (value) => { values.push(value); }
        });
        animator.onAnimationFrame(1000);
        assert.equal(animator.isDone(), false);
        animator.onAnimationFrame(1500);
        assert.equal(animator.isDone(), false);
        animator.onAnimationFrame(2000);
        assert.equal(animator.isDone(), true);

        assert.deepEqual(values, _.sortBy(values).reverse());
        assert.equal(values.length, 3);
        assert.equal(_.last(values), 0);
    });
});
