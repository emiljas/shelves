var assert = chai.assert;
import cyclePosition from '../src/cyclePosition';

describe('cyclePosition', function() {
    it('return first position', function() {
        test({ input: 1, expected: 1, max: 5 });
    });

    it('return last position', function() {
        test({ input: 5, expected: 5, max: 5 });
    });

    it('return last position if one before first', function() {
      test({ input: 0, expected: 5, max: 5 });
    });

    it('return last position if two before first', function() {
      test({ input: -1, expected: 4, max: 5 });
    });

    it('return last position if back cycle done', function() {
      test({ input: -10, expected: 5, max: 5 });
    });

    it('return one before last position if one before back cycle done', function() {
      test({ input: -11, expected: 4, max: 5 });
    });

    it('return first position if one after last', function() {
      test({ input: 6, expected: 1, max: 5 });
    });

    it('return second position if two after last', function() {
      test({ input: 7, expected: 2, max: 5 });
    });

    it('return last position if front cycle done', function() {
      test({ input: 11, expected: 1, max: 5 });
    });

    function test(args: { input: number, expected: number, max: number }) {
        let position = cyclePosition(args.input, args.max);
        assert.equal(position, args.expected);
    }
});
