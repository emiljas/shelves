'use strict';

import XMoveHolder = require('./XMoveHolder');
import Segments = require('./Segments');
import FpsMeasurer = require('./debug/FpsMeasurer');
import touch = require('./touch');
import SlideController = require('./animation/SlideController');
import TapInput = require('./TapInput');

class ViewPort implements XMoveHolder {
    private container: HTMLDivElement;
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
    private frameRequestCallback: FrameRequestCallback = (timestamp) => { this.onAnimationFrame(timestamp); };

    private slideController = new SlideController(this);

    public static init(canvasId: string) {
        let viewPort = new ViewPort();

        let container = <HTMLDivElement>document.querySelector(canvasId);
        viewPort.container = container;
        viewPort.canvas = <HTMLCanvasElement>container.querySelector('canvas');
        viewPort.width = viewPort.canvas.width;
        viewPort.height = viewPort.canvas.height;
        viewPort.ctx = viewPort.canvas.getContext('2d');
        viewPort.timestamp = 0;
        viewPort.xMove = 0;
        viewPort.yMove = 0;
        viewPort.distanceToMove = 0;
        viewPort.segments = new Segments(viewPort);

        let backBtn = container.querySelector('.leftSlideBtn');
        backBtn.addEventListener('click', () => { viewPort.slideLeft(); }, false);

        let nextBtn = container.querySelector('.rightSlideBtn');
        nextBtn.addEventListener('click', () => { viewPort.slideRight(); }, false);

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

    public onClick(e: TapInput): void {
        this.segments.onClick(e);
    }

    private slideRight() {
        this.slideController.startSlide({
            distance: -1000,
            xMove: this.xMove,
            timestamp: this.timestamp
        });
    }

    private slideLeft() {
        this.slideController.startSlide({
            distance: 1000,
            xMove: this.xMove,
            timestamp: this.timestamp
        });
    }

    private onAnimationFrame(timestamp: number) {
        this.timestamp = timestamp;

        this.yMove = Math.min(0, this.yMove);
        this.yMove = Math.max(this.yMove, this.height - this.height * (this.scale / 0.33));

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.slideController.onAnimationFrame(timestamp);

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

export = ViewPort;
