'use strict';

import Canvas from './Canvas';

export default function touch(canvas: Canvas) {
    'use strict';

    let hammer = new Hammer(canvas.canvasElement, {
        touchAction: 'none'
    });
    hammer.get('pan').set({ direction: Hammer.DIRECTION_ALL });

    let lastDeltaX = 0;
    let lastDeltaY = 0;

    hammer.on('pan', function(e: HammerInput) {
        canvas.xMove += e.deltaX - lastDeltaX;
        lastDeltaX = e.deltaX;

        canvas.yMove += e.deltaY - lastDeltaY;
        lastDeltaY = e.deltaY;
    });

    hammer.on('panend', function(e: HammerInput) {
        lastDeltaX = 0;
        lastDeltaY = 0;
    });

    hammer.on('tap', function() {
        if (canvas.scale === 0.33) {
            canvas.scale = 1;
        } else {
            canvas.scale = 0.33;
        }
    });
}
