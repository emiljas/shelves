'use strict';

import Segments from './Segments';
import FpsMeasurer from './debug/FpsMeasurer';
import touch from './touch';

export default class Canvas {
    public segments: Segments;
    public canvasElement: HTMLCanvasElement;
    public canvasWidth: number;
    public canvasHeight: number;
    public ctx: CanvasRenderingContext2D;
    public timestamp: number;
    public xMove: number;
    public yMove: number;
    public distanceToMove: number;
    public lastTimestamp: number;
    public scale: number = 0.33;

    private frameRequestCallback: FrameRequestCallback = (timestamp) => { this.loop(timestamp); };
    private animationTimestamp: number;

    public static init(canvasId: string) {
        let canvas = new Canvas();

        canvas.canvasElement = <HTMLCanvasElement>document.querySelector(canvasId);
        canvas.canvasWidth = canvas.canvasElement.width;
        canvas.canvasHeight = canvas.canvasElement.height;
        canvas.ctx = canvas.canvasElement.getContext('2d');
        canvas.timestamp = 0;
        canvas.xMove = 0;
        canvas.yMove = 0;
        canvas.distanceToMove = 0;
        canvas.segments = new Segments(canvas);

        touch(canvas);

        return canvas;
    }

    public start() {
        window.requestAnimationFrame(this.frameRequestCallback);
    }

    public appendSegment() {
        this.segments.appendSegment();
    }

    public moveX(move: number) {
        this.animationTimestamp = this.timestamp;
        this.distanceToMove = move;
    }
    private loop(timestamp: number) {
        this.timestamp = timestamp;

        this.yMove = Math.min(0, this.yMove);
        this.yMove = Math.max(this.yMove, this.canvasHeight - this.canvasHeight * (this.scale / 0.33));

        this.ctx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);

        if (!isNearZeroPx(this.distanceToMove)) {
            let secondsFromAnimationStart = (this.timestamp - this.animationTimestamp) / 1000;
            let xMovePerFrame = Math.sin(secondsFromAnimationStart) * this.distanceToMove;

            this.xMove += xMovePerFrame;
            this.distanceToMove -= xMovePerFrame;
        }

        this.ctx.save();
        this.ctx.translate(this.xMove, this.yMove);
        this.ctx.scale(this.scale, this.scale);

        this.segments.draw();

        this.ctx.restore();

        this.lastTimestamp = timestamp;
        FpsMeasurer.instance.tick(timestamp);
        window.requestAnimationFrame(this.frameRequestCallback);
    };

}

const DIFF = 0.5;
function isNearZeroPx(value: number) {
    'use strict';
    return Math.abs(value) < DIFF;
}
