const assert = chai.assert;
import cyclePosition from '../src/cyclePosition';

describe('cyclePosition', function() {
    it('return first position', function() {
        let position = cyclePosition(args.input, args.max);
        assert.equal(position, args.expected);
    });
});
