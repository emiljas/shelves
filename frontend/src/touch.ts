'use strict';

import SG from './ShelvesGlobals';

export default function() {

    let hammer = new Hammer(SG.canvas, {
        touchAction: 'none'
    });
    hammer.get('pan').set({ direction: Hammer.DIRECTION_ALL });

    let lastDeltaX = 0;
    let lastDeltaY = 0;

    hammer.on('pan', function(e: HammerInput) {
        SG.xMove += e.deltaX - lastDeltaX;
        lastDeltaX = e.deltaX;

        SG.yMove += e.deltaY - lastDeltaY;
        lastDeltaY = e.deltaY;
    });

    hammer.on('panend', function(e: HammerInput) {
        lastDeltaX = 0;
        lastDeltaY = 0;
    });

    hammer.on('tap', function() {
        if (SG.scale == 0.33) {
            SG.scale = 1;
        }
        else {
            SG.scale = 0.33;
        }
    });

}
