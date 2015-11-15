'use strict';
import ut from './UnitTestUtils';

import * as proxyquire from 'proxyquire';
var randomNumberIndex = 0;
var randomNumbers;
proxyquire('../src/randomProductPositionsOnSegment', {
    'lodash': {
        random: function() {
            return randomNumbers[randomNumberIndex++];
        }
    }
});

function mockRandomNumbers(numbers: Array<number>) {
    randomNumberIndex = 0;
    randomNumbers = numbers;
}

import randomProductPositionsOnSegment from '../src/randomProductPositionsOnSegment';

describe('randomProductPositionsOnSegment', () => {

    function testIfPositionWasOmitted(wrongPosition, correctPosition) {
        mockRandomNumbers([
            200, 300,
            wrongPosition.x, wrongPosition.y, //omitted
            correctPosition.x, correctPosition.y
        ]);

        var args = {
            coordsList: [
                { x: 0, y: 0, width: 10, height: 20 },
                { x: 0, y: 0, width: 10, height: 20 }
            ],
            segmentWidth: 500,
            segmentHeight: 400
        };

        var position = randomProductPositionsOnSegment(args)[1];
        ut.assert.equal(position.dx, correctPosition.x);
        ut.assert.equal(position.dy, correctPosition.y);
    }

    it('omits position which overlaps right', () => {
      testIfPositionWasOmitted({x: 200 + 10 - 1, y: 300}, {x: 200 + 10, y: 300});
    });

    it('omits position which overlaps bottom', () => {
        testIfPositionWasOmitted({x: 200, y: 300 + 20 - 1}, {x: 200, y: 300 + 20});
    });

    it('omits position which overlaps left', () => {
        testIfPositionWasOmitted({x: 200 - 10 + 1, y: 300}, {x: 200 - 10, y: 300});
    });

    it('omits position which overlaps top', () => {
        testIfPositionWasOmitted({x: 200, y: 300 - 20 + 1}, {x: 200, y: 300 - 20});
    });

    it('accepts overlapping position if limit reached', () => {
        var randomPositionsNumbers = [
          200, 300,
          200, 300,
          201, 300,
          200, 300,
          202, 300
        ];
        mockRandomNumbers(randomPositionsNumbers);

        var args = {
            coordsList: [
                { x: 0, y: 0, width: 10, height: 20 },
                { x: 0, y: 0, width: 10, height: 20 },
                { x: 0, y: 0, width: 10, height: 20 },
            ],
            segmentWidth: 500,
            segmentHeight: 400,
            limit: 2
        };

        var positions = randomProductPositionsOnSegment(args)

        var position2 = positions[1];
        ut.assert.equal(position2.dx, 201);
        ut.assert.equal(position2.dy, 300);

        var position3 = positions[2];
        ut.assert.equal(position3.dx, 202);
        ut.assert.equal(position3.dy, 300);
    });

});
