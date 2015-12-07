'use strict';

import Events = require('./events/Events');
import XMoveHolder = require('./XMoveHolder');
import Segments = require('./Segments');
import FpsMeasurer = require('./debug/FpsMeasurer');
import touch = require('./touch');
import SlideController = require('./animation/SlideController');
import TapInput = require('./TapInput');
import ValueAnimatorController = require('./animation/ValueAnimatorController');

class ViewPort implements XMoveHolder {
    private isDeleted = false;
    private events = new Events();
    private hammerManager: HammerManager;
    private container: HTMLDivElement;
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private segments: Segments;
    private segmentWidths: Array<number>;
    private segmentHeight: number;
    private width: number;
    private height: number;
    private y: number;
    private xMove: number = 0;
    private yMove: number = 0;
    private initialScale: number;
    private zoomScale: number;
    private scale: number;
    private timestamp: number;
    private frameRequestCallback: FrameRequestCallback = (timestamp) => { this.onAnimationFrame(timestamp); };
    private valueAnimatorController = new ValueAnimatorController();

    private slideController = new SlideController(this);

    public getCanvas() { return this.canvas; }
    public getCanvasContext() { return this.ctx; }
    public getWidth() { return this.width; }
    public getHeight() { return this.height; }
    public getXMove() { return this.xMove; }
    public setXMove(value: number) { this.xMove = value; }
    public getYMove() { return this.yMove; }
    public setYMove(value: number) { this.yMove = value; }
    public getZoomScale() { return this.zoomScale; }
    public getScale() { return this.scale; }
    public setScale(value: number) { this.scale = value; }
    public getY() { return this.y; }
    public getValueAnimatorController() { return this.valueAnimatorController; }
    public getTimestamp() { return this.timestamp; }

    constructor(containerId: string) {
        // (<any>window)['vp'] = this; //DEBUG ONLY
        this.container = <HTMLDivElement>document.querySelector(containerId);
        this.canvas = <HTMLCanvasElement>this.container.querySelector('canvas');

        this.fitCanvas();

        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.y = this.container.getBoundingClientRect().top;

        this.fitPlaceHolder(containerId);

        this.container.classList.remove('loading');

        this.ctx = this.canvas.getContext('2d');

        this.segmentWidths = JSON.parse(this.container.getAttribute('data-segment-widths'));
        this.segmentHeight = parseInt(this.container.getAttribute('data-segment-height'), 10);

        this.setInitialScale();
        this.segments = new Segments(this, this.segmentWidths, this.initialScale);
        this.bindControl();
        this.hammerManager = touch(this);
    }

    public start(): void {
        window.requestAnimationFrame(this.frameRequestCallback);
    }

    public onClick(e: TapInput): void {
        this.segments.onClick(e);
    }

    public animate(propertyName: string, endValue: number): void {
        this.valueAnimatorController.add({
            start: (<any>this)[propertyName],
            end: endValue,
            timestamp: this.timestamp,
            onChange: (value) => { (<any>this)[propertyName] = value; }
        });
    }

    public unbind(): void {
        this.isDeleted = true;
        this.events.removeAllEventListeners();
        this.hammerManager.destroy();
    }

    private fitCanvas(): void {
        this.canvas.width = document.documentElement.clientWidth;
        let documentHeight = document.documentElement.clientHeight;
        let containerY = this.container.getBoundingClientRect().top;
        let bottomMargin = 0.05 * documentHeight;
        this.canvas.height = documentHeight - containerY - bottomMargin;
    }

    private fitPlaceHolder(containerId: string): void {
        let placeHolder = <HTMLDivElement>document.querySelector('.shelvesPlaceHolder[data-place-holder-for="' + containerId + '"]');
        placeHolder.style.height = this.container.getBoundingClientRect().height + 'px';
    }

    private setInitialScale(): void {
        this.initialScale = this.height / this.segmentHeight;

        let maxSegmentWidth = _.max(this.segmentWidths);
        this.zoomScale = Math.min(this.width / (1.1 * maxSegmentWidth), 1);

        this.scale = this.initialScale;
    }

    private bindControl(): void {
        let backBtn = this.container.querySelector('.leftSlideBtn');
        this.events.addEventListener(backBtn, 'click', (e) => {
            e.preventDefault();
            this.slideLeft();
        });

        let nextBtn = this.container.querySelector('.rightSlideBtn');
        this.events.addEventListener(nextBtn, 'click', (e) => {
            e.preventDefault();
            this.slideRight();
        });

        let zoomInBtn = this.container.querySelector('.zoomInBtn');
        this.events.addEventListener(zoomInBtn, 'click', (e) => {
            e.preventDefault();
            this.scale += 0.01;
        });

        let zoomOutBtn = this.container.querySelector('.zoomOutBtn');
        this.events.addEventListener(zoomOutBtn, 'click', (e) => {
            e.preventDefault();
            this.scale -= 0.01;
        });
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

        this.slideController.onAnimationFrame(timestamp);
        this.valueAnimatorController.onAnimationFrame(timestamp);
        this.blockVerticalMoveOutsideCanvas();

        this.draw();

        FpsMeasurer.instance.tick(timestamp); //DEBUG ONLY

        if (!this.isDeleted) {
            window.requestAnimationFrame(this.frameRequestCallback);
        }
    };

    private draw(): void {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.save();
        this.ctx.translate(this.xMove, this.yMove);
        this.ctx.scale(this.scale, this.scale);

        this.segments.draw();

        this.ctx.restore();
    }

    private blockVerticalMoveOutsideCanvas() {
        this.yMove = Math.min(0, this.yMove);
        this.yMove = Math.max(this.yMove, this.height - this.height * (this.scale / this.initialScale));
    }
}

export = ViewPort;
