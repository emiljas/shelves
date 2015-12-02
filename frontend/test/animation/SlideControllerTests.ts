const assert = chai.assert;
import XMoveHolder = require('../../src/XMoveHolder');
import SlideController = require('../../src/animation/SlideController');

class XMoveHolderMock implements XMoveHolder {
    public XMove: number;

    public setXMove(value: number): void {
        this.XMove = value;
    }
}

describe('SlideController', function() {
    let controller: SlideController;
    let xMoveHolderMock: XMoveHolderMock;

    it('0ms - not moved', function() {
        createController();
        startSlide();
        controller.onAnimationFrame(1000);
        assert.equal(xMoveHolderMock.XMove, 1000);
    });

    it('1000ms - moved by distance', function() {
        createController();
        startSlide();
        controller.onAnimationFrame(2000);
        assert.equal(xMoveHolderMock.XMove, 1100);
    });

    it('1500ms - still moved by distance', function() {
        createController();
        startSlide();
        controller.onAnimationFrame(2500);
        assert.equal(xMoveHolderMock.XMove, 1100);
    });

    it('add distance left to next slide', function() {
        createController();
        startSlide();
        controller.onAnimationFrame(1500);
        startSecondSlide();
        controller.onAnimationFrame(2500);
        assert.equal(xMoveHolderMock.XMove, 1300);
    });

    function startSecondSlide() {
        controller.startSlide({
            xMove: xMoveHolderMock.XMove,
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
