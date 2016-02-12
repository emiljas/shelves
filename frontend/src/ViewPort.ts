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

const VERTICAL_SLIDE_RATIO = 0.9;
const SCROLL_LINE_HEIGHT = 20;

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
    private scrollPageHeight: number;
    private y: number;
    private xMove: number = 0;
    private yMove: number = 0;
    private initialScale: number;
    private zoomScale: number;
    private scale: number;
    private isMagnified = false;
    private isTopScrollBlock = true;
    private isBottomScrollBlock = true;
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
    public checkIfTopScrollBlock() { return this.isTopScrollBlock; }
    public checkIfBottomScrollBlock() { return this.isBottomScrollBlock; }

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

        this.calculateScales();

        let maxCanvasWidth = Math.round(this.maxSegmentWidth * this.zoomScale);
        let maxCanvasHeight = Math.round(this.segmentHeight * this.zoomScale);
        console.log(maxCanvasWidth, maxCanvasHeight);
        this.canvasPool = new CanvasPool(maxCanvasWidth, maxCanvasHeight);

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
        this.events.addEventListener(this.canvas, 'mousemove', (e: MouseEvent) => { this.onMouseMove(e); });
        this.scrollPageHeight = document.documentElement.clientHeight;
        this.events.addEventListener(this.canvas, 'wheel', (e: WheelEvent) => { e.preventDefault(); this.onScroll(e); });
    }

    public start(): void {
        window.requestAnimationFrame(this.frameRequestCallback);
    }

    public onClick(e: TapInput): void {
        this.segmentController.onClick(e);
    }

    public animate(propertyName: string, endValue: number): void {
        this.valueAnimatorController.remove(propertyName);
        this.valueAnimatorController.add({
            id: propertyName,
            start: (<any>this)[propertyName],
            end: endValue,
            timestamp: this.timestamp,
            onChange: (value) => { (<any>this)[propertyName] = value; }
        });
    }

    public stopAnimation(propertyName: string): void {
        this.valueAnimatorController.remove(propertyName);
    }

    public beginAnimation() {
        this.drawingController.beginAnimation();
    }

    public endAnimation() {
        this.drawingController.endAnimation();
    }

    public control_left() {
      if (this.isMagnified) {
        this.segmentController.fitLeftSegmentOnViewPort();
      } else {
        this.slideLeft();
      }
    }

    public control_right() {
      if (this.isMagnified) {
        this.segmentController.fitRightSegmentOnViewPort();
      } else {
        this.slideRight();
      }
    }

    public control_top() {
      this.animate('yMove', this.yMove + VERTICAL_SLIDE_RATIO * this.canvasHeight);
    }

    public control_bottom() {
      this.animate('yMove', this.yMove - VERTICAL_SLIDE_RATIO * this.canvasHeight);
    }

    public control_zoom() {
      this.notifyAboutZoomChange(true);

      this.segmentController.fitMiddleSegmentOnViewPort();
    }

    public control_unzoom() {
      this.notifyAboutZoomChange(false);

      let x = -this.xMove + this.canvasWidth / 2;
      this.animate('xMove', this.canvasWidth / 2 - x * (this.initialScale / this.zoomScale));
      this.animate('yMove', 0);
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
        this.canvas.height = documentHeight - containerY;
    }

    private fitPlaceHolder(containerId: string): void {
        let placeHolder = <HTMLDivElement>document.querySelector('.shelvesPlaceHolder[data-place-holder-for="' + containerId + '"]');
        placeHolder.style.height = this.container.getBoundingClientRect().height + 'px';
    }

    private calculateScales(): void {
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






            let sliderMargin = 10;
            let sliderPadding = 2.5;

            let sliderX = this.canvasWidth - 2 * sliderMargin;
            let sliderY = sliderMargin;
            let sliderWidth = 8;
            let sliderHeight = this.canvasHeight - 2 * sliderMargin;

            this.ctx.fillStyle = 'white';
            this.ctx.fillRect(sliderX, sliderY, sliderWidth, sliderHeight);

            let sliderZipX = sliderX + sliderPadding;
            let sliderZipY = sliderY + sliderPadding;
            let sliderZipWidth = sliderWidth - 2 * sliderPadding;
            let sliderZipHeight = sliderHeight - 2 * sliderPadding;

            this.ctx.fillStyle = 'black';
            this.ctx.fillRect(sliderZipX, sliderZipY, sliderZipWidth, sliderZipHeight);

            // console.log((((-this.yMove + this.canvasHeight) / this.scale) / this.segmentHeight) * 100);






        } else {
            this.segmentController.preloadSegments();
        }

        if (!this.isDeleted) {
            window.requestAnimationFrame(this.frameRequestCallback);
        }
    };

    private onMouseMove(e: MouseEvent): void {
      let x = e.offsetX;
      let y = e.offsetY;
      let isClickable = this.segmentController.isClickable(x, y);
      if (isClickable) {
        this.container.classList.add('pointer');
      } else {
        this.container.classList.remove('pointer');
      }
    }

    private onScroll(e: WheelEvent): void {
      if (e.deltaMode === e.DOM_DELTA_PIXEL) {
        this.yMove -= e.deltaY;
      } else if (e.deltaMode === e.DOM_DELTA_LINE) {
        this.yMove -= e.deltaY * SCROLL_LINE_HEIGHT;
      } else if (e.deltaY === e.DOM_DELTA_PAGE) {
        this.yMove -= e.deltaY * this.scrollPageHeight;
      }
    }

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
        let minYMove = 0;
        this.yMove = Math.min(minYMove, this.yMove);

        let maxYMove = this.canvasHeight - this.canvasHeight * (this.scale / this.initialScale);
        this.yMove = Math.max(this.yMove, maxYMove);

        if (this.areMovesEqual(this.yMove, minYMove)) {
          if (!this.isTopScrollBlock) {
            this.isTopScrollBlock = true;
            this.control.onTopScrollBlock();
          }
        } else {
          if (this.isTopScrollBlock) {
            this.isTopScrollBlock = false;
            this.control.onTopScrollUnblock();
          }
        }

        if (this.areMovesEqual(this.yMove, maxYMove)) {
          if (!this.isBottomScrollBlock) {
            this.isBottomScrollBlock = true;
            this.control.onBottomScrollBlock();
          }
        } else {
          if (this.isBottomScrollBlock) {
            this.isBottomScrollBlock = false;
            this.control.onBottomScrollUnblock();
          }
        }
    }

    private areMovesEqual(move1: number, move2: number) {
      return Math.abs(move1 - move2) < 1;
    }
}

export = ViewPort;
