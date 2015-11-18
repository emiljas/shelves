'use strict';

import SG from './ShelvesGlobals';
import draw from './draw';
import FpsMeasurer from './debug/FpsMeasurer';

export default class Canvas {

    private static _instance = new Canvas();
    public static get instance(): Canvas { return Canvas._instance; }

    private animationTimestamp: number;


    public start() {
        window.requestAnimationFrame(this.loop);
    }

    private loop = (timestamp: number) => {
        SG.timestamp = timestamp;

        SG.yMove = Math.min(0, SG.yMove);
        SG.yMove = Math.max(SG.yMove, SG.canvasHeight - SG.canvasHeight * (SG.scale / 0.33));

        SG.ctx.clearRect(0, 0, SG.canvas.width, SG.canvas.height);

        if (!isNearZeroPx(SG.distanceToMove)) {
            var secondsFromAnimationStart = (SG.timestamp - this.animationTimestamp) / 1000;
            var xMovePerFrame = Math.sin(secondsFromAnimationStart) * SG.distanceToMove;

            SG.xMove += xMovePerFrame;
            SG.distanceToMove -= xMovePerFrame;
        }

        SG.ctx.save();
        SG.ctx.translate(SG.xMove, SG.yMove);
        SG.ctx.scale(SG.scale, SG.scale);
        draw();
        SG.ctx.restore();

        SG.lastTimestamp = timestamp;
        FpsMeasurer.instance.tick(timestamp);
        window.requestAnimationFrame(this.loop);
    };

    public moveX(move: number) {
        this.animationTimestamp = SG.timestamp;
        SG.distanceToMove = move;
    }
}

const DIFF = 0.5;
function isNearZeroPx(value: number) {
    return Math.abs(value) < DIFF;
}
