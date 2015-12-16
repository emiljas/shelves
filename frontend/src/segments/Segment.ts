'use strict';

import ViewPort = require('../ViewPort');
import SegmentRepository = require('../repository/SegmentRepository');
import ProductPositionModel = require('../models/ProductPositionModel');
import TapInput = require('../touch/TapInput');
import loadImage = require('../utils/loadImage');
import ISegmentPlace = require('./ISegmentPlace');

let segmentRepository = new SegmentRepository();

class Segment implements ISegmentPlace {
    private isLoaded = false;
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private spriteImg: HTMLImageElement;
    private width: number;
    private height: number;
    private productPositions: Array<ProductPositionModel>;
    private requestInProgress: Promise<any> = null;

    constructor(
        private viewPort: ViewPort,
        private index: number,
        private x: number
    ) {
        this.ctx = viewPort.getCanvasContext();
    }

    public getIndex(): number { return this.index; }
    public getX(): number { return this.x; }

    public load(): Promise<void> {
        let getByPositionPromise = this.requestInProgress = segmentRepository.getByPosition(this.index);
        return getByPositionPromise.then((data) => {
            this.width = data.width;
            this.height = data.height;
            this.productPositions = data.productPositions;

            let loadImagePromise = this.requestInProgress = loadImage(data.spriteImgUrl);
            return loadImagePromise;
        })
            .then((img) => {
                this.requestInProgress = null;
                this.spriteImg = img;
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
        } else if (this.requestInProgress !== null) {
            this.requestInProgress.cancel();
        }
    }

    private createCanvas(): HTMLCanvasElement {
        let canvas = this.viewPort.getCanvasPool().get();
        let ctx = canvas.getContext('2d');

        ctx.beginPath();
        ctx.lineWidth = 20;
        ctx.moveTo(0, 0);
        ctx.lineTo(this.width, 0);
        ctx.lineTo(this.width, this.height);
        ctx.lineTo(0, this.height);
        ctx.lineTo(0, 0);
        ctx.stroke();

        let positions = this.productPositions;
        for (let p of positions) {
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
