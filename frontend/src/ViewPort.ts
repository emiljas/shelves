'use strict';

import Segments = require('./Segments');
import FpsMeasurer = require('./debug/FpsMeasurer');
import touch = require('./touch');

class ViewPort {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private segments: Segments;
    private width: number;
    private height: number;
    private xMove: number;
    private yMove: number;
    private scale: number = 0.33;
    private distanceToMove: number;
    private timestamp: number;
    private lastTimestamp: number;
    private frameRequestCallback: FrameRequestCallback = (timestamp) => { this.loop(timestamp); };
    private animationTimestamp: number;

    public static init(canvasId: string) {
        let viewPort = new ViewPort();

        viewPort.canvas = <HTMLCanvasElement>document.querySelector(canvasId);
        viewPort.width = viewPort.canvas.width;
        viewPort.height = viewPort.canvas.height;
        viewPort.ctx = viewPort.canvas.getContext('2d');
        viewPort.timestamp = 0;
        viewPort.xMove = 0;
        viewPort.yMove = 0;
        viewPort.distanceToMove = 0;
        viewPort.segments = new Segments(viewPort);

        touch(viewPort);

        return viewPort;
    }

    public getCanvas() { return this.canvas; }
    public getCanvasContext() { return this.ctx; }
    public getWidth() { return this.width; }
    public getXMove() { return this.xMove; }
    public setXMove(value: number) { this.xMove = value; }
    public getYMove() { return this.yMove; }
    public setYMove(value: number) { this.yMove = value; }
    public getScale() { return this.scale; }
    public setScale(value: number) { this.scale = value; }

    public start() {
        window.requestAnimationFrame(this.frameRequestCallback);
    }

    public slideLeft() {
        let SEGMENT_RATIO_MOVE = 0.7;
        let move = this.distanceToMove + this.width * SEGMENT_RATIO_MOVE;
        this.moveX(move);
    }

    public slideRight() {
        let SEGMENT_RATIO_MOVE = 0.7;
        let move = this.distanceToMove - this.width * SEGMENT_RATIO_MOVE;
        this.moveX(move);
    }

    private moveX(move: number) {
        this.animationTimestamp = this.timestamp;
        this.distanceToMove = move;
    }

    private loop(timestamp: number) {
        this.timestamp = timestamp;

        this.yMove = Math.min(0, this.yMove);
        this.yMove = Math.max(this.yMove, this.height - this.height * (this.scale / 0.33));

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.slideIfNecessary();

        this.ctx.save();
        this.ctx.translate(this.xMove, this.yMove);
        this.ctx.scale(this.scale, this.scale);

        this.segments.draw();

        this.ctx.restore();

        this.lastTimestamp = timestamp;
        FpsMeasurer.instance.tick(timestamp);
        window.requestAnimationFrame(this.frameRequestCallback);
    };

    private slideIfNecessary() {
        if (!isNearZeroPx(this.distanceToMove)) {
            let secondsFromAnimationStart = (this.timestamp - this.animationTimestamp) / 1000;
            let xMovePerFrame = Math.sin(secondsFromAnimationStart) * this.distanceToMove;

            this.xMove += xMovePerFrame;
            this.distanceToMove -= xMovePerFrame;
        }
    }
}

const DIFF = 0.5;
function isNearZeroPx(value: number) {
    'use strict';
    return Math.abs(value) < DIFF;
}

export = ViewPort;
