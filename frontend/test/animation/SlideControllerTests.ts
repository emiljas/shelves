const assert = chai.assert;
import XMoveHolder = require('../../src/XMoveHolder');
import SlideController = require('../../src/animation/SlideController');

class XMoveHolderMock implements XMoveHolder {
    public xMove: number;
}

describe('SlideController', function() {
    let controller: SlideController;
    let xMoveHolderMock: XMoveHolderMock;

    it('0ms - not moved', function() {
        createController();
        startSlide();
        controller.onAnimationFrame(1000);
        assert.equal(xMoveHolderMock.xMove, 1000);
    });

    it('1000ms - moved by distance', function() {
        createController();
        startSlide();
        controller.onAnimationFrame(2000);
        assert.equal(xMoveHolderMock.xMove, 1100);
    });

    it('1500ms - still moved by distance', function() {
        createController();
        startSlide();
        controller.onAnimationFrame(2500);
        assert.equal(xMoveHolderMock.xMove, 1100);
    });

    it('add distance left to next slide', function() {
        createController();
        startSlide();
        controller.onAnimationFrame(1500);
        startSecondSlide();
        controller.onAnimationFrame(2500);
        assert.equal(xMoveHolderMock.xMove, 1300);
    });

    function startSecondSlide() {
        controller.startSlide({
            xMove: xMoveHolderMock.xMove,
            distance: 200,
            timestamp: 1500
        });
    }

    function createController() {
        xMoveHolderMock = new XMoveHolderMock();
        controller = new SlideController(xMoveHolderMock);
    }

    function startSlide() {
        controller.startSlide({
            xMove: 1000,
            distance: 100,
            timestamp: 1000
        });
    }
});
