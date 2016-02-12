'use strict';

import ViewPort = require('../ViewPort');
import SegmentController = require('./SegmentController');
import SegmentRepository = require('../repository/SegmentRepository');
import KnownImageModel = require('../models/KnownImageModel');
import ImageModel = require('../models/ImageModel');
import ProductPositionModel = require('../models/ProductPositionModel');
import DebugPlaceModel = require('../models/DebugPlaceModel');
import TapInput = require('../touch/TapInput');
import loadImage = require('../utils/loadCancelableImage');
import createWhitePixelImg = require('../utils/createWhitePixelImg');
import ISegmentPlace = require('./ISegmentPlace');
import KnownImages = require('../images/KnownImages');
import Images = require('../images/Images');
import FlashEffect = require('../flash/FlashEffect');
// import ImageType = require('../models/ImageType');

let segmentRepository = new SegmentRepository();

class Segment implements ISegmentPlace {
    private isLoaded = false;
    private canDrawCanvas = false;
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private spriteImg: HTMLImageElement;
    private width: number;
    private height: number;
    private knownImages: Array<KnownImageModel>;
    private images: Array<ImageModel>;
    private productPositions: Array<ProductPositionModel>;
    private debugPlaces: Array<DebugPlaceModel>;
    private requestInProgressPromise: Promise<any> = null;
    private knownImgs: KnownImages;
    private imgs: Images;
    private flashEffect: FlashEffect;

    constructor(
        private viewPort: ViewPort,
        private segmentController: SegmentController,
        private index: number,
        private id: number,
        private x: number
    ) {
        this.ctx = viewPort.getCanvasContext();
    }

    public getIndex(): number { return this.index; }
    public getId(): number { return this.id; }
    public getX(): number { return this.x; }
    public getWidth(): number { return this.width; }

    public load(): void {
        this.viewPort.getKnownImages().then((images) => {
            this.knownImgs = images;
            let getByIdPromise = this.requestInProgressPromise = segmentRepository.getById(this.id);
            return getByIdPromise;
        }).then((data) => {
            this.width = data.width;
            this.height = data.height;
            this.knownImages = data.knownImages;
            this.images = data.images;
            this.productPositions = data.productPositions;
            this.debugPlaces = data.debugPlaces;

            let loadImagePromise = this.requestInProgressPromise = this.loadImage(data.spriteImgUrl);
            return loadImagePromise;
        })
            .then((img) => {
                this.requestInProgressPromise = null;
                this.spriteImg = img;
                return Promise.resolve();
            })
            .then(() => {
                this.imgs = new Images(this.images);
                return this.imgs.downloadAll();
            })
            .then(() => {
              this.canDrawCanvas = true;
            });
    }

    public draw(timestamp: number) {
        if (this.isLoaded && this.isInCanvasVisibleArea()) {
            this.ctx.drawImage(this.canvas, 0, 0, this.width * this.viewPort.getZoomScale(), this.height * this.viewPort.getZoomScale(), this.x, 0, this.width, this.height);

            if (this.flashEffect) {
                if (this.flashEffect.isEnded()) {
                    this.flashEffect = null;
                    this.segmentController.reportEffectRenderingStop();
                } else {
                    this.flashEffect.flash(timestamp, this.x, 0, this.width, this.height);
                }
            }
        }
    }

    public createCanvasIfNecessary(): void {
      if (this.canDrawCanvas && !this.canvas && this.isInCanvasVisibleArea()) {
        this.canvas = this.createCanvas();
        console.log('createCanvas ' + this.id);

        this.spriteImg = null;
        this.isLoaded = true;
        this.segmentController.segmentLoaded({ segmentId: this.id });

        // Promise.resolve(this.loadPromise);
      }
    }

    private createCanvas(): HTMLCanvasElement {
      console.log('createCavas');

        let canvas = this.viewPort.getCanvasPool().get();
        let ctx = canvas.getContext('2d');

        ctx.save();
        ctx.scale(this.viewPort.getZoomScale(), this.viewPort.getZoomScale());

        ctx.fillStyle = '#D2D1CC';
        ctx.fillRect(0, 0, this.width, this.height);

        for (let image of this.knownImages) {
            let img = this.knownImgs.getByType(image.type);

            if (image.repeat) {
              ctx.beginPath();
              let pattern = ctx.createPattern(img, 'repeat');
              ctx.fillStyle = pattern;
              ctx.fillRect(image.dx, image.dy, image.w, image.h);
            } else if (image.w && image.h) {
                ctx.drawImage(img, image.dx, image.dy, image.w, image.h);
            } else {
                ctx.drawImage(img, image.dx, image.dy);
            }
        }

        for (let image of this.images) {
            let img = this.imgs.getByUrl(image.url);
            if (image.w && image.h) {
                ctx.drawImage(img, image.dx, image.dy, image.w, image.h);
            } else {
                ctx.drawImage(img, image.dx, image.dy);
            }
        }

        for (let p of this.productPositions) {
            ctx.drawImage(this.spriteImg, p.sx, p.sy, p.w, p.h, p.dx, p.dy, p.w, p.h);
        }

        // debug only!
        // let debugPlacesI = 0;
        // let DEBUG_PLACES_COLORS = ['rgba(0, 255, 0, 0.3)', 'rgba(0, 0, 255, 0.3)', 'rgba(255, 0, 0, 0.3)'];
        // for (let s of this.debugPlaces) {
        //   ctx.beginPath();
        //   ctx.fillStyle = DEBUG_PLACES_COLORS[debugPlacesI % DEBUG_PLACES_COLORS.length];
        //   ctx.fillRect(s.dx, s.dy, s.w, s.h);
        //   ctx.closePath();
        //
        //   debugPlacesI++;
        // }

        //debug only!
        ctx.font = 'bold 250px Ariel';
        ctx.fillStyle = 'black';
        ctx.textAlign = 'center';
        ctx.fillText(this.getIndex().toString(), this.width / 2, 600);

        ctx.restore();

        return canvas;
    }

    public isInCanvasVisibleArea(): boolean {
        let xMove = this.viewPort.getXMove();
        let scale = this.viewPort.getScale();
        let canvasWidth = this.viewPort.getCanvasWidth();

        let isBeforeVisibleArea = xMove / scale + this.x + this.width < 0;
        let isAfterVisibleArea = xMove / scale - canvasWidth / scale + this.x > 0;
        return !isBeforeVisibleArea && !isAfterVisibleArea;
    }

    public isClicked(e: TapInput): boolean {
        return e.x > this.x && e.x < this.x + this.width;
    }

    public isClickable(x: number, y: number) {
        for (let product of this.productPositions) {
            if (x >= this.x + product.dx
                && x <= this.x + product.dx + product.w
                && y >= product.dy
                && y <= product.dy + product.h) {
                return true;
            }
        }
        return false;
    }

    public fitOnViewPort(y: number): void {
        let zoomScale = this.viewPort.getZoomScale();

        let canvasWidth = this.viewPort.getCanvasWidth();
        let xMove = (canvasWidth - this.width * zoomScale) / 2 - this.x * zoomScale;

        let canvasHeight = this.viewPort.getCanvasHeight();
        let yMove = canvasHeight / 2 - y * zoomScale;

        this.viewPort.animate('xMove', xMove);
        if (y !== -1) {
            this.viewPort.animate('yMove', yMove);
        }

        let scale = this.viewPort.getScale();
        if (scale !== zoomScale) {
            this.viewPort.animate('scale', zoomScale);
            this.viewPort.notifyAboutZoomChange(true);
        }
    }

    public flash(): void {
        this.flashEffect = new FlashEffect(this.ctx);
        this.segmentController.reportEffectRenderingStart();
    }

    public unload(): void {
        if (this.isLoaded) {
            this.viewPort.getCanvasPool().release(this.canvas);
        } else if (this.requestInProgressPromise !== null) {
            this.requestInProgressPromise.cancel();
        }
    }

    private loadImage(url: string): Promise<HTMLImageElement> {
        if (url) {
            return loadImage(url);
        } else {
            return createWhitePixelImg();
        }
    }
}

export = Segment;
