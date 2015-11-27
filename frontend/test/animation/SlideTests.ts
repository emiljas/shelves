const assert = chai.assert;

import Slide = require('../../src/animation/Slide');

describe('Slide', function() {
    const X_MOVE = 500;
    const DISTANCE = 100;
    const TIMESTAMP = 1000;

    it('0ms - no move', function() {
        let xMoves = collectXMovesFromTimestamps([1000]);
        assert.deepEqual(xMoves, [500]);
    });

    it('0ms - is not done', function() {
        let isDones = collectIsDonesFromTimestamps([1000]);
        assert.deepEqual(isDones, [false]);
    });

    it('xMove increases with every step', function() {
        let xMoves = collectXMovesFromTimestamps([1100, 1200, 1600, 2000]);
        assert.deepEqual(xMoves, _.sortBy(xMoves));
    });

    it('make full move in one second', function() {
        let xMoves = collectXMovesFromTimestamps([1100, 1200, 1600, 2000]);
        assert.equal(_.last(xMoves), 600);
    });

    it('is done when full move made', function() {
        let isDones = collectIsDonesFromTimestamps([1100, 1200, 1600, 2000]);
        assert.deepEqual(isDones, [false, false, false, true]);
    });

    function collectXMovesFromTimestamps(timestamps: Array<number>): Array<number> {
        return collectResultsFromTimestamps(timestamps).xMoves;
    }

    function collectIsDonesFromTimestamps(timestamps: Array<number>): Array<boolean> {
        return collectResultsFromTimestamps(timestamps).isDones;
    }

    function collectResultsFromTimestamps(timestamps: Array<number>) {
        let result = {
            xMoves: new Array<number>(),
            isDones: new Array<boolean>()
        };

        let slide = new Slide({
            xMove: X_MOVE,
            distance: DISTANCE,
            timestamp: TIMESTAMP
        });

        for (let timestamp of timestamps) {
            let xMove = slide.calcXMove(timestamp);
            result.xMoves.push(xMove);
            result.isDones.push(slide.IsDone());
        }

        return result;
    }
});
