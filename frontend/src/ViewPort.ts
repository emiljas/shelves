'use strict';

import Events = require('./events/Events');
import XMoveHolder = require('./XMoveHolder');
import Control = require('./control/Control');
import KnownImages = require('./images/KnownImages');
import SegmentController = require('./segments/SegmentController');
import touch = require('./touch/touch');
import TapInput = require('./touch/TapInput');
import DrawingController = require('./animation/DrawingController');
import ValueAnimatorController = require('./animation/ValueAnimatorController');
import CanvasPool = require('./segments/CanvasPool');
import SegmentWidthModel = require('./models/SegmentWidthModel');
import QueryString = require('./QueryString');
import StartPosition = require('./startPosition/StartPosition');
import StartPositionResult = require('./startPosition/StartPositionResult');

class ViewPort implements XMoveHolder {
    private isDeleted = false;
    private events = new Events();
    private hammerManager: HammerManager;
    private container: HTMLDivElement;
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private control: Control;
    private knownImagesPromise: Promise<KnownImages> = KnownImages.downloadAll();
    private segmentController: SegmentController;
    private segmentsData: Array<SegmentWidthModel>;
    private segmentWidths: Array<number>;
    private segmentHeight: number;
    private maxSegmentWidth: number;
    private canvasWidth: number;
    private canvasHeight: number;
    private y: number;
    private xMove: number = 0;
    private yMove: number = 0;
    private initialScale: number;
    private zoomScale: number;
    private scale: number;
    private isMagnified = false;
    private startPosition: StartPositionResult;

    private drawnXMove: number;
    private drawnYMove: number;
    private drawnScale: number;

    private timestamp: number;
    private drawingController = new DrawingController();
    private valueAnimatorController = new ValueAnimatorController();
    private canvasPool: CanvasPool;
    private queryString: QueryString;

    private frameRequestCallback: FrameRequestCallback = (timestamp) => { this.onAnimationFrame(timestamp); };

    public getCanvas() { return this.canvas; }
    public getCanvasContext() { return this.ctx; }
    public getCanvasWidth() { return this.canvasWidth; }
    public getCanvasHeight() { return this.canvasHeight; }
    public getXMove() { return this.xMove; }
    public setXMove(value: number) { this.xMove = value; }
    public getYMove() { return this.yMove; }
    public setYMove(value: number) { this.yMove = value; }
    public getInitialScale() { return this.initialScale; }
    public getZoomScale() { return this.zoomScale; }
    public getScale() { return this.scale; }
    public getY() { return this.y; }
    public getKnownImages() { return this.knownImagesPromise; }
    public getCanvasPool() { return this.canvasPool; }
    public getQueryString() { return this.queryString; }
    public getEvents() { return this.events; }
    public checkIfMagnified() { return this.isMagnified; }

    constructor(containerId: string) {
        // (<any>window)['vp'] = this; //DEBUG ONLY
        this.container = <HTMLDivElement>document.querySelector(containerId);
        this.canvas = <HTMLCanvasElement>this.container.querySelector('canvas');

        this.fitCanvas();

        this.canvasWidth = this.canvas.width;
        this.canvasHeight = this.canvas.height;
        this.y = this.container.getBoundingClientRect().top;

        this.fitPlaceHolder(containerId);

        this.container.classList.remove('loading');

        this.ctx = this.canvas.getContext('2d');

        this.segmentsData = JSON.parse(this.container.getAttribute('data-segment-widths'));
        this.segmentWidths = _.map(this.segmentsData, (s) => { return s.width; });
        this.maxSegmentWidth = _.max(this.segmentWidths);
        this.segmentHeight = parseInt(this.container.getAttribute('data-segment-height'), 10);

        this.canvasPool = new CanvasPool(this.maxSegmentWidth, this.segmentHeight);

        this.setInitialScale();

        this.queryString = new QueryString(this.container);
        let startPosition = new StartPosition({
            canvasWidth: this.canvasWidth,
            initialScale: this.initialScale,
            segmentsData: this.segmentsData,
            queryString: this.queryString
        });
        this.startPosition = startPosition.calculate();
        this.segmentController = new SegmentController(this, this.segmentsData, this.segmentWidths, this.startPosition);

        this.initControl();
        this.hammerManager = touch(this);
    }

    public start(): void {
        window.requestAnimationFrame(this.frameRequestCallback);
    }

    public onClick(e: TapInput): void {
        this.segmentController.onClick(e);
    }

    public animate(propertyName: string, endValue: number): void {
        this.valueAnimatorController.add({
            id: propertyName,
            start: (<any>this)[propertyName],
            end: endValue,
            timestamp: this.timestamp,
            onChange: (value) => { (<any>this)[propertyName] = value; }
        });
    }

    public beginAnimation() {
        this.drawingController.beginAnimation();
    }

    public endAnimation() {
        this.drawingController.endAnimation();
    }

    public control_left() {
      this.slideLeft();
    }

    public control_right() {
      this.slideRight();
    }

    public control_top() {
      this.animate('yMove', this.yMove + 0.1 * this.canvasHeight);
    }

    public control_bottom() {
      this.animate('yMove', this.yMove - 0.1 * this.canvasHeight);
    }

    public control_zoom() {
      this.notifyAboutZoomChange(true);

      // let x = -this.xMove + this.canvasWidth / 2;
      // this.animate('xMove', this.canvasWidth / 2 - x * (this.zoomScale / this.initialScale));
      // this.animate('scale', this.zoomScale);
      this.segmentController.fitMiddleSegmentOnViewPort();
    }

    public control_unzoom() {
      this.notifyAboutZoomChange(false);

      let x = -this.xMove + this.canvasWidth / 2;
      this.animate('xMove', this.canvasWidth / 2 - x * this.initialScale);
      this.animate('scale', this.initialScale);
    }

    public notifyAboutZoomChange(isMagnified: boolean): void {
      this.isMagnified = isMagnified;
      this.control.onZoomChange();
    }

    public unbind(): void {
        this.isDeleted = true;
        this.segmentController.unload();
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
        this.initialScale = this.canvasHeight / this.segmentHeight;
        this.zoomScale = Math.min(this.canvasWidth / (1.25 * this.maxSegmentWidth), 1);
        this.scale = this.initialScale;
    }

    private initControl(): void {
      this.control = new Control(this, this.container);
      this.control.init();
    }

    private slideRight() {
        let xMove = this.xMove - this.canvasWidth;
        this.animate('xMove', xMove);
    }

    private slideLeft() {
        let xMove = this.xMove + this.canvasWidth;
        this.animate('xMove', xMove);
    }

    private onAnimationFrame(timestamp: number) {
        this.timestamp = timestamp;
        this.valueAnimatorController.onAnimationFrame(timestamp);

        if (this.mustBeRedraw()) {
            this.blockVerticalMoveOutsideCanvas();
            this.draw();
        } else {
            this.segmentController.preloadSegments();
        }

        if (!this.isDeleted) {
            window.requestAnimationFrame(this.frameRequestCallback);
        }
    };

    private draw(): void {
        this.drawnXMove = this.xMove;
        this.drawnYMove = this.yMove;
        this.drawnScale = this.scale;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.save();
        this.ctx.translate(this.xMove, this.yMove);
        this.ctx.scale(this.scale, this.scale);

        this.segmentController.draw(this.timestamp);

        this.ctx.restore();
    }

    private mustBeRedraw(): boolean {
        return this.xMove !== this.drawnXMove
            || this.yMove !== this.drawnYMove
            || this.scale !== this.drawnScale
            || this.segmentController.checkIfNonDrawnSegmentsExistsAndReset()
            || this.segmentController.checkIfAnyEffectsRendering();
    }

    private blockVerticalMoveOutsideCanvas() {
        this.yMove = Math.min(0, this.yMove);
        this.yMove = Math.max(this.yMove, this.canvasHeight - this.canvasHeight * (this.scale / this.initialScale));
    }
}

export = ViewPort;
