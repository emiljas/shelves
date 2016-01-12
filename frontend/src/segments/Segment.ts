'use strict';

import ViewPort = require('../ViewPort');
import SegmentRepository = require('../repository/SegmentRepository');
import ShelfModel = require('../models/ShelfModel');
import KnownImageModel = require('../models/KnownImageModel');
import ImageModel = require('../models/ImageModel');
import ProductPositionModel = require('../models/ProductPositionModel');
import TapInput = require('../touch/TapInput');
import loadImage = require('../utils/loadCancelableImage');
import createWhitePixelImg = require('../utils/createWhitePixelImg');
import ISegmentPlace = require('./ISegmentPlace');
import KnownImages = require('../KnownImages');
import Images = require('../Images');

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

    constructor(
        private viewPort: ViewPort,
        private index: number,
        private id: number,
        private x: number
    ) {
        this.ctx = viewPort.getCanvasContext();
    }

    public getIndex(): number { return this.index; }
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
            return Promise.resolve();
        });
    }

    public draw() {
        if (this.isLoaded) {
            this.ctx.drawImage(this.canvas, 0, 0, this.width, this.height, this.x, 0, this.width, this.height);
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

        ctx.beginPath();
        ctx.lineWidth = 5;
        ctx.moveTo(0, 0);
        ctx.lineTo(this.width, 0);
        ctx.lineTo(this.width, this.height);
        ctx.lineTo(0, this.height);
        ctx.lineTo(0, 0);
        ctx.stroke();

        // for (let shelf of this.shelves) {
        //     this.drawShelf(ctx, shelf.dx, shelf.dy, shelf.w, shelf.h);
        // }

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

    // private drawShelf(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
    //     ctx.beginPath();
    //     ctx.lineWidth = 4;
    //     ctx.moveTo(x, y);
    //     ctx.lineTo(x + w, y);
    //     ctx.lineTo(x + w, y + h);
    //     ctx.lineTo(x, y + h);
    //     ctx.lineTo(x, y);
    //     ctx.fillStyle = 'rgb(' + this.random255() + ', ' + this.random255() + ', ' + this.random255() + ')';
    //     ctx.fill();
    //     ctx.fillStyle = '#000';
    // }
    //
    // private random255(): string {
    //     return Math.floor(Math.random() * 255).toString();
    // }
}

export = Segment;
