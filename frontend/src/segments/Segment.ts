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

    constructor(
        private viewPort: ViewPort,
        private index: number,
        private x: number
    ) {
        this.ctx = viewPort.getCanvasContext();
        this.load(this);
    }

    public getIndex(): number { return this.index; }
    public getX(): number { return this.x; }

    public load(segment: Segment) {
        segmentRepository.getByPosition(this.index).then((data) => {
            this.width = data.width;
            this.height = data.height;
            this.productPositions = data.productPositions;

            return loadImage(data.spriteImgUrl);
        })
            .then((img) => {
                segment.spriteImg = img;
                this.canvas = this.createCanvas();
                segment.isLoaded = true;
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

    // public isBeforeCanvasVisibleArea(): boolean {
    //     let xMove = this.viewPort.getXMove();
    //     let scale = this.viewPort.getScale();
    //
    //     return xMove / scale + this.x + this.width < 0;
    // }
    //
    // public isAfterCanvasVisibleArea(): boolean {
    //     let xMove = this.viewPort.getXMove();
    //     let scale = this.viewPort.getScale();
    //     let canvasWidth = this.viewPort.getCanvasWidth();
    //
    //     return xMove / scale - canvasWidth / scale + this.x > 0;
    // }

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

    private createCanvas(): HTMLCanvasElement {
        let canvas = document.createElement('canvas');
        canvas.width = this.width;
        canvas.height = this.height;
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
