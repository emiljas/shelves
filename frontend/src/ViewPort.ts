'use strict';

import Events = require('./events/Events');
import XMoveHolder = require('./XMoveHolder');
import Segments = require('./Segments');
import FpsMeasurer = require('./debug/FpsMeasurer');
import touch = require('./touch');
import SlideController = require('./animation/SlideController');
import TapInput = require('./TapInput');

class ViewPort implements XMoveHolder {
    private isDeleted = false;
    private events = new Events();
    private hammerManager: HammerManager;
    private container: HTMLDivElement;
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private segments: Segments;
    private width: number;
    private height: number;
    private xMove: number;
    private yMove: number;
    private initialScale: number;
    private scale: number;
    private distanceToMove: number;
    private timestamp: number;
    private lastTimestamp: number;
    private frameRequestCallback: FrameRequestCallback = (timestamp) => { this.onAnimationFrame(timestamp); };

    private slideController = new SlideController(this);

    public static init(containerId: string) {
        let viewPort = new ViewPort();

        let container = <HTMLDivElement>document.querySelector(containerId);
        viewPort.container = container;
        let canvas = <HTMLCanvasElement>container.querySelector('canvas');
        viewPort.canvas = canvas;

        (function fitCanvas() {
            canvas.width = document.documentElement.clientWidth;
            let documentHeight = document.documentElement.clientHeight;
            let containerY = container.getBoundingClientRect().top;
            let bottomMargin = 0.05 * documentHeight;
            canvas.height = documentHeight - containerY - bottomMargin;
        })();

        viewPort.width = canvas.width;
        viewPort.height = canvas.height;

        (function fitPlaceHolder() {
            let placeHolder = <HTMLDivElement>document.querySelector('.shelvesPlaceHolder[data-place-holder-for="' + containerId + '"]');
            placeHolder.style.height = container.getBoundingClientRect().height + 'px';
        })();

        container.classList.remove('loading');

        viewPort.ctx = viewPort.canvas.getContext('2d');
        viewPort.timestamp = 0;
        viewPort.xMove = 0;
        viewPort.yMove = 0;
        viewPort.distanceToMove = 0;

        let segmentWidths: Array<number> = JSON.parse(container.getAttribute('data-segment-widths'));
        let segmentHeight = parseInt(container.getAttribute('data-segment-height'), 10);
        viewPort.segments = new Segments(viewPort, segmentWidths);

        (function setInitialScale() {
          viewPort.initialScale = viewPort.height / segmentHeight;
          viewPort.scale = viewPort.initialScale;
        })();

        let backBtn = container.querySelector('.leftSlideBtn');
        viewPort.events.addEventListener(backBtn, 'click', (e) => {
            e.preventDefault();
            viewPort.slideLeft();
        });

        let nextBtn = container.querySelector('.rightSlideBtn');
        viewPort.events.addEventListener(nextBtn, 'click', (e) => {
            e.preventDefault();
            viewPort.slideRight();
        });

        let zoomInBtn = container.querySelector('.zoomInBtn');
        viewPort.events.addEventListener(zoomInBtn, 'click', (e) => {
          e.preventDefault();
          viewPort.scale += 0.01;
        });

        let zoomOutBtn = container.querySelector('.zoomOutBtn');
        viewPort.events.addEventListener(zoomOutBtn, 'click', (e) => {
          e.preventDefault();
          viewPort.scale -= 0.01;
        });

        viewPort.hammerManager = touch(viewPort);

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

    public start(): void {
        window.requestAnimationFrame(this.frameRequestCallback);
    }

    public onClick(e: TapInput): void {
        this.segments.onClick(e);
    }

    public unbind(): void {
        this.isDeleted = true;
        this.events.removeAllEventListeners();
        this.hammerManager.destroy();
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
        this.yMove = Math.max(this.yMove, this.height - this.height * (this.scale / this.initialScale));

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.slideController.onAnimationFrame(timestamp);

        this.ctx.save();
        this.ctx.translate(this.xMove, this.yMove);
        this.ctx.scale(this.scale, this.scale);

        this.segments.draw();

        this.ctx.restore();

        this.lastTimestamp = timestamp;
        FpsMeasurer.instance.tick(timestamp);

        if (!this.isDeleted) {
            window.requestAnimationFrame(this.frameRequestCallback);
        }
    };
}

export = ViewPort;
