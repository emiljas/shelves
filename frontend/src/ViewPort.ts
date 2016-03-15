'use strict';

const SEGMENT_COLOR = '#D2D1CC';

import Events = require('./events/Events');
import XMoveHolder = require('./XMoveHolder');
import Control = require('./control/Control');
import KnownImages = require('./images/KnownImages');
import SegmentController = require('./segments/SegmentController');
import touch = require('./touch/touch');
import TapInput = require('./touch/TapInput');
import DrawingController = require('./animation/DrawingController');
import ValueAnimatorController = require('./animation/ValueAnimatorController');
import ValueAnimatorArgs = require('./animation/ValueAnimatorArgs');
import CanvasPool = require('./segments/CanvasPool');
import SegmentWidthModel = require('./models/SegmentWidthModel');
import Preloader = require('./preloader/Preloader');
import QueryString = require('./QueryString');
import StartPosition = require('./startPosition/StartPosition');
import StartPositionResult = require('./startPosition/StartPositionResult');
import ResolutionType = require('./ResolutionType');
import Timer = require('./utils/Timer');
import AnimateInput = require('./AnimateInput');
import CartDict = require('./cart/CartDict');

const Historyjs: Historyjs = <any>History;
declare var Rossmann: any;

const VERTICAL_SLIDE_RATIO = 0.9;
const SCROLL_LINE_HEIGHT = 20;

let lastSegmentId: number;

class ViewPort implements XMoveHolder {
    private isDeleted = false;
    private anyPreloadingSegmentsExists: boolean;
    private shouldRedrawPreloaders = false;
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
    private x: number;
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
    private fontSize: number;
    private resolutionType: ResolutionType;

    private drawnXMove: number;
    private drawnYMove: number;
    private drawnScale: number;

    private timestamp: number;
    private drawingController = new DrawingController();
    private valueAnimatorController = new ValueAnimatorController();
    private canvasPool: CanvasPool;
    private preloader: Preloader;
    private queryString: QueryString;

    private maxCanvasWidth: number;
    private maxCanvasHeight: number;

    private frameRequestCallback: FrameRequestCallback = (timestamp) => { this.onAnimationFrame(timestamp); };
    private setUrlOncePer250ms: () => void;

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
    public getX(): number { return this.x; }
    public getY(): number { return this.y; }
    public getSegmentHeight() { return this.segmentHeight; }
    public getKnownImages() { return this.knownImagesPromise; }
    public getCanvasPool() { return this.canvasPool; }
    public getPreloader() { return this.preloader; }
    public getQueryString() { return this.queryString; }
    public getEvents() { return this.events; }
    public checkIfMagnified() { return this.isMagnified; }
    public checkIfTopScrollBlock() { return this.isTopScrollBlock; }
    public checkIfBottomScrollBlock() { return this.isBottomScrollBlock; }
    public getFontSize(): number { return this.fontSize; }
    public getMaxCanvasWidth(): number { return this.maxCanvasWidth; }
    public getMaxCanvasHeight(): number { return this.maxCanvasHeight; }
    public getStartX(): number { return this.startPosition.x; }
    public checkIfAnimationsInProgressExists(): boolean { return this.valueAnimatorController.animationsInProgressExists(); }

    constructor(containerId: string) {
        // (<any>window)['vp'] = this; //DEBUG ONLY
        this.container = <HTMLDivElement>document.querySelector(containerId);
        this.canvas = <HTMLCanvasElement>this.container.querySelector('canvas');

        this.fitCanvas();

        this.canvasWidth = this.canvas.width;
        this.canvasHeight = this.canvas.height;

        let containerRect = this.container.getBoundingClientRect();
        this.x = containerRect.left;
        this.y = containerRect.top;

        this.fitPlaceHolder(containerId);

        this.container.classList.remove('loading');

        this.ctx = this.canvas.getContext('2d');

        this.segmentsData = JSON.parse(this.container.getAttribute('data-segment-widths'));
        this.segmentWidths = _.map(this.segmentsData, (s) => { return s.width; });
        this.maxSegmentWidth = _.max(this.segmentWidths);
        this.segmentHeight = parseInt(this.container.getAttribute('data-segment-height'), 10);

        this.calculateScales();

        this.maxCanvasWidth = Math.round(this.maxSegmentWidth * this.zoomScale);
        this.maxCanvasHeight = Math.round(this.segmentHeight * this.zoomScale);
        this.canvasPool = new CanvasPool(this.maxCanvasWidth, this.maxCanvasHeight);

        let minSegmentWidth = 356;
        let preloaderWidth = Math.round(minSegmentWidth * this.initialScale * 0.95);
        this.preloader = new Preloader(preloaderWidth);

        let noFlash: boolean;
        if (lastSegmentId) {
          this.queryString = new QueryString(lastSegmentId);
          noFlash = true;
        } else {
          this.queryString = new QueryString(this.container);
          noFlash = false;
        }
        let startPosition = new StartPosition({
            canvasWidth: this.canvasWidth,
            initialScale: this.initialScale,
            segmentsData: this.segmentsData,
            queryString: this.queryString
        });
        this.startPosition = startPosition.calculate();
        let startProductId = this.queryString.IsProductIdSetUp ? this.queryString.ProductId : null;
        this.segmentController = new SegmentController(this, this.segmentsData, this.segmentWidths
          , this.startPosition, startProductId, noFlash);

        this.initControl();
        this.hammerManager = touch(this);
        this.events.addEventListener(this.canvas, 'mousemove', (e: MouseEvent) => { this.handleMouseMove(e); });
        this.events.addEventListener(this.canvas, 'touchstart', (e: TouchEvent) => { this.handleTouchStart(e); });
        this.scrollPageHeight = document.documentElement.clientHeight;
        this.events.addEventListener(this.canvas, 'wheel', (e: WheelEvent) => { e.preventDefault(); this.handleScroll(e); });
        let tooltip = document.getElementById('shelves2ProductTooltip')
        this.events.addEventListener(tooltip, 'wheel', (e: WheelEvent) => { e.preventDefault(); e.stopPropagation(); this.handleScroll(e); });

        this.setUrlOncePer250ms = _.throttle(() => { this.setUrl(); }, 250);

        this.setResolutionType();
        this.setFontSize();

        CartDict.GetInstance().handleProductQuantityChangedCallback = () => {
          this.segmentController.handleProductQuantityChanged();
        };
        //
        // (<any>window).x = this.control_left.bind(this);
        // (<any>window).y = this.control_right.bind(this);
    }

    public start(): void {
        window.requestAnimationFrame(this.frameRequestCallback);
    }

    public onClick(e: TapInput): void {
        this.segmentController.onClick(e);
    }

    public animate(input: AnimateInput): void {
        let args = this.createValueAnimatorArgs(input);
        this.valueAnimatorController.add(args);
    }

    public animateBatch(inputs: Array<AnimateInput>): void {
      let argsList = _.map(inputs, (i) => { return this.createValueAnimatorArgs(i); });
      this.valueAnimatorController.addBatch(argsList);
    }

    private createValueAnimatorArgs(input: AnimateInput): ValueAnimatorArgs {
        return {
            id: input.propertyName,
            start: (<any>this)[input.propertyName],
            end: input.endValue,
            timestamp: this.timestamp,
            onChange: (value) => { (<any>this)[input.propertyName] = value; }
        };
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
      if (!this.valueAnimatorController.animationsInProgressExists()) {
        if (this.isMagnified) {
          this.segmentController.fitLeftSegmentOnViewPort();
        } else {
          this.slideLeft();
        }
      }
    }

    public control_right() {
      if (!this.valueAnimatorController.animationsInProgressExists()) {
        if (this.isMagnified) {
          this.segmentController.fitRightSegmentOnViewPort();
        } else {
          this.slideRight();
        }
      }
    }

    public control_top() {
      if (!this.valueAnimatorController.animationsInProgressExists()) {
        this.animate({propertyName: 'yMove', endValue: this.yMove + VERTICAL_SLIDE_RATIO * this.canvasHeight});
      }
    }

    public control_bottom() {
      if (!this.valueAnimatorController.animationsInProgressExists()) {
        this.animate({propertyName: 'yMove', endValue: this.yMove - VERTICAL_SLIDE_RATIO * this.canvasHeight});
      }
    }

    public control_zoom() {
      if (!this.valueAnimatorController.animationsInProgressExists()) {
        this.notifyAboutZoomChange(true);
        this.segmentController.fitMiddleSegmentOnViewPort();
      }
    }

    public control_unzoom() {
      if (!this.valueAnimatorController.animationsInProgressExists()) {
        this.notifyAboutZoomChange(false);

        let x = -this.xMove + this.canvasWidth / 2;
        this.animateBatch([
          {propertyName: 'xMove', endValue: this.canvasWidth / 2 - x * (this.initialScale / this.zoomScale)},
          {propertyName: 'yMove', endValue: 0},
          {propertyName: 'scale', endValue: this.initialScale}
        ]);
      }
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
        this.animate({propertyName: 'xMove', endValue: xMove});
    }

    private slideLeft() {
        let xMove = this.xMove + this.canvasWidth;
        this.animate({propertyName: 'xMove', endValue: xMove});
    }

    private setResolutionType(): void {
        if (this.canvasWidth <= 480) {
          this.resolutionType = ResolutionType.Phone;
        } else if (this.canvasWidth <= 768) {
          this.resolutionType = ResolutionType.Tablet;
        } else {
          this.resolutionType = ResolutionType.Desktop;
        }
    }

    private setFontSize(): void {
        if (this.resolutionType === ResolutionType.Phone) {
          this.fontSize = 60;
        } else if (this.resolutionType === ResolutionType.Tablet) {
          this.fontSize = 55;
        } else {
          this.fontSize = 40;
        }
    }

    private onAnimationFrame(timestamp: number) {
        this.timestamp = timestamp;
        this.valueAnimatorController.onAnimationFrame(timestamp);

        this.anyPreloadingSegmentsExists = this.segmentController.checkIfAnyPreloadingSegmentsExists();
        if (this.anyPreloadingSegmentsExists) {
          this.shouldRedrawPreloaders = this.preloader.handleAnimationFrame(timestamp);
        }

        if (this.mustBeRedraw()) {
          if (this.isTranslatedOrScaled()) {
            Rossmann.Modules.Shelves2.closeProductTooltip();
          }

          this.blockVerticalMoveOutsideCanvas();
          this.draw();
          this.drawSlider();
        } else {
          this.segmentController.preloadSegments();
        }

        this.setUrlOncePer250ms();

        if (!this.isDeleted) {
            window.requestAnimationFrame(this.frameRequestCallback);
        }
    };

    private setUrl(): void {
      let segment = this.segmentController.getMiddleSegment();
      if (segment && !Rossmann.Modules.Shelves2.isProductPopUpOpen) {
        let title = segment.getSeoTitle();
        let url = segment.getPlanogramUrl();
        Historyjs.replaceState(null, title, url);
        lastSegmentId = segment.getId();
      }
    }

    private drawSlider() {
      if (this.isMagnified) {
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
        let sliderZipEndY = (sliderHeight - 2 * sliderPadding)
           * (((-this.yMove + this.canvasHeight) / this.scale) / this.segmentHeight);
        let scrollZipHeight = (sliderHeight - 2 * sliderPadding)
           * (((this.canvasHeight) / this.scale) / this.segmentHeight);

        this.ctx.fillStyle = '#0067B2';
        this.ctx.fillRect(sliderZipX, sliderZipY + sliderZipEndY - scrollZipHeight, sliderZipWidth, scrollZipHeight);
      }
    }

    private handleTouchStart(e: TouchEvent): void {
        let rect = this.canvas.getBoundingClientRect();
        let x = e.touches[0].pageX - rect.left;
        let y = e.touches[0].pageY - rect.top;
        this.handleCursorPositionChanged(x, y);
    }

    private handleMouseMove(e: MouseEvent): void {
      let x = e.offsetX;
      let y = e.offsetY;
      this.handleCursorPositionChanged(x, y);
    }

    private handleScroll(e: WheelEvent): void {
      if (e.deltaMode === e.DOM_DELTA_PIXEL) {
        this.yMove -= e.deltaY;
      } else if (e.deltaMode === e.DOM_DELTA_LINE) {
        this.yMove -= e.deltaY * SCROLL_LINE_HEIGHT;
      } else if (e.deltaY === e.DOM_DELTA_PAGE) {
        this.yMove -= e.deltaY * this.scrollPageHeight;
      }

    this.handleCursorPositionChanged(e.offsetX, e.offsetY);
    }

    private handleCursorPositionChanged(x: number, y: number) {
      if (this.isMagnified) {
        this.segmentController.handleMouseMove(x, y);

        let isClickable = this.segmentController.isClickable(x, y);
        if (isClickable) {
          this.container.classList.add('pointer');
        } else {
          this.container.classList.remove('pointer');
        }
      } else {
          this.container.classList.add('pointer');
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
        let notDrawnSegmentsExists = this.segmentController.checkIfNonDrawnSegmentsExistsAndReset();

        return this.xMove !== this.drawnXMove
            || this.yMove !== this.drawnYMove
            || this.scale !== this.drawnScale
            || notDrawnSegmentsExists
            || this.segmentController.checkIfAnyEffectsRendering()
            || (this.anyPreloadingSegmentsExists && this.shouldRedrawPreloaders);
    }

    private isTranslatedOrScaled(): boolean {
        return this.xMove !== this.drawnXMove
            || this.yMove !== this.drawnYMove
            || this.scale !== this.drawnScale;
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
