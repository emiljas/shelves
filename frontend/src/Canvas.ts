'use strict';

import Segments from './Segments';
import Segment from './Segment';
import FpsMeasurer from './debug/FpsMeasurer';
import SegmentRepository from './repository/SegmentRepository';
import touch from './touch';

let segmentRepository = new SegmentRepository();

export default class Canvas {
    private _segmentWidths: Array<number>;
    public get segmentWidths(): Array<number> { return this._segmentWidths; }
    public get SEGMENT_HEIGHT(): number { return 1920; }
    public segments: Segments;
    public canvas: HTMLCanvasElement;
    public canvasWidth: number;
    public canvasHeight: number;
    public ctx: CanvasRenderingContext2D;
    public timestamp: number;
    public xMove: number;
    public yMove: number;
    public distanceToMove: number;
    public lastTimestamp: number;
    public scale = 0.33;

    public static init(canvasId: string): Promise<Canvas> {
        var canvas = new Canvas();

        canvas.canvas = <HTMLCanvasElement>document.querySelector(canvasId);
        canvas.canvasWidth = canvas.canvas.width;
        canvas.canvasHeight = canvas.canvas.height;
        canvas.ctx = canvas.canvas.getContext('2d');
        canvas.timestamp = 0;
        canvas.xMove = 0;
        canvas.yMove = 0;
        canvas.distanceToMove = 0;
        canvas.segments = new Segments(canvas);

        touch(canvas);


        return segmentRepository.getWidths().then(function(widths) {
          canvas._segmentWidths = widths;
          return Promise.resolve(canvas);
        });
    }

    private animationTimestamp: number;

    public start() {
        window.requestAnimationFrame(this.loop);
    }

    private loop = (timestamp: number) => {
        this.timestamp = timestamp;

        this.yMove = Math.min(0, this.yMove);
        this.yMove = Math.max(this.yMove, this.canvasHeight - this.canvasHeight * (this.scale / 0.33));

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (!isNearZeroPx(this.distanceToMove)) {
            var secondsFromAnimationStart = (this.timestamp - this.animationTimestamp) / 1000;
            var xMovePerFrame = Math.sin(secondsFromAnimationStart) * this.distanceToMove;

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
        window.requestAnimationFrame(this.loop);
    };

    public appendSegment() {
      this.segments.appendSegment();
    }

    public moveX(move: number) {
        this.animationTimestamp = this.timestamp;
        this.distanceToMove = move;
    }
}

const DIFF = 0.5;
function isNearZeroPx(value: number) {
    return Math.abs(value) < DIFF;
}
