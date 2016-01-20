'use strict';

import ViewPort = require('../ViewPort');
import SegmentController = require('./SegmentController');
import SegmentRepository = require('../repository/SegmentRepository');
import ShelfModel = require('../models/ShelfModel');
import KnownImageModel = require('../models/KnownImageModel');
import ImageModel = require('../models/ImageModel');
import ProductPositionModel = require('../models/ProductPositionModel');
import TapInput = require('../touch/TapInput');
import loadImage = require('../utils/loadCancelableImage');
import createWhitePixelImg = require('../utils/createWhitePixelImg');
import ISegmentPlace = require('./ISegmentPlace');
import KnownImages = require('../images/KnownImages');
import Images = require('../images/Images');
import FlashEffect = require('../flash/FlashEffect');

let segmentRepository = new SegmentRepository();

class Segment implements ISegmentPlace {
    private isLoaded = false;
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private spriteImg: HTMLImageElement;
    private width: number;
    private height: number;
    private shelves: Array<ShelfModel>;
    private knownImages: Array<KnownImageModel>;
    private images: Array<ImageModel>;
    private productPositions: Array<ProductPositionModel>;
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

    public load(): Promise<void> {
        return this.viewPort.getKnownImages().then((images) => {
            this.knownImgs = images;
            let getByIdPromise = this.requestInProgressPromise = segmentRepository.getById(this.id);
            return getByIdPromise;
        }).then((data) => {
            this.width = data.width;
            this.height = data.height;
            this.shelves = data.shelves;
            this.knownImages = data.knownImages;
            this.images = data.images;
            this.productPositions = data.productPositions;

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
                this.canvas = this.createCanvas();
                this.isLoaded = true;
                this.segmentController.segmentLoaded({ segmentId: this.id });
                return Promise.resolve();
            });
    }

    public draw(timestamp: number) {
        if (this.isLoaded) {
            this.ctx.drawImage(this.canvas, 0, 0, this.width, this.height, this.x, 0, this.width, this.height);

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

    public isClicked(e: TapInput): boolean {
        return e.x > this.x && e.x < this.x + this.width;
    }

    public fitOnViewPort(y: number): void {
        let zoomScale = this.viewPort.getZoomScale();

        let canvasWidth = this.viewPort.getCanvasWidth();
        let xMove = (canvasWidth - this.width * zoomScale) / 2 - this.x * zoomScale;

        let canvasHeight = this.viewPort.getCanvasHeight();
        let yMove = canvasHeight / 2 - y * zoomScale;

        this.viewPort.animate('xMove', xMove);
        this.viewPort.animate('yMove', yMove);
        this.viewPort.animate('scale', zoomScale);

        this.viewPort.notifyAboutZoomChange(true);
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

    private createCanvas(): HTMLCanvasElement {
        let canvas = this.viewPort.getCanvasPool().get();
        let ctx = canvas.getContext('2d');

        for (let image of this.knownImages) {
            let img = this.knownImgs.getByType(image.type);
            if (image.w && image.h) {
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

        //debug only!
        ctx.font = 'bold 250px Ariel';
        ctx.fillStyle = 'black';
        ctx.textAlign = 'center';
        ctx.fillText(this.getIndex().toString(), this.width / 2, 600);

        return canvas;
    }
}

export = Segment;
