'use strict';

import ViewPort = require('./ViewPort');

function touch(viewPort: ViewPort) {
    'use strict';

    let hammer = new Hammer(viewPort.getCanvas(), {
        touchAction: 'none'
    });
    hammer.get('pan').set({ direction: Hammer.DIRECTION_ALL });

    let lastDeltaX = 0;
    let lastDeltaY = 0;

    hammer.on('pan', function(e: HammerInput) {
        viewPort.setXMove(viewPort.getXMove() + e.deltaX - lastDeltaX);
        lastDeltaX = e.deltaX;

        viewPort.setYMove(viewPort.getYMove() + e.deltaY - lastDeltaY);
        lastDeltaY = e.deltaY;
    });

    hammer.on('panend', function(e: HammerInput) {
        lastDeltaX = 0;
        lastDeltaY = 0;
    });

    hammer.on('tap', function() {
        if (viewPort.getScale() === 0.33) {
            viewPort.setScale(1);
        } else {
            viewPort.setScale(0.33);
        }
    });
}

export = touch;
