'use strict';

import ViewPort = require('./ViewPort');
import SegmentRepository = require('./repository/SegmentRepository');
import ProductPositionModel = require('./models/ProductPositionModel');
import TapInput = require('./TapInput');

let segmentRepository = new SegmentRepository();

class Segment {
    private canvas: HTMLCanvasElement;
    private x: number;
    private isLoaded = false;
    private viewPort: ViewPort;
    private ctx: CanvasRenderingContext2D;
    private index: number;
    private spriteImg: HTMLImageElement;

    private width: number;
    private height: number;
    private productPositions: Array<ProductPositionModel>;

    constructor(viewPort: ViewPort, index: number, x: number) {
        this.index = index;
        this.viewPort = viewPort;
        this.ctx = viewPort.getCanvasContext();
        this.x = x;
        this.load(this);
    }

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

    public fitOnViewPort(): void {
        let canvasWidth = this.viewPort.getWidth();
        let s = this.viewPort.getZoomScale();
        let x = ((canvasWidth - this.width) / 2) - this.x;
        // x /= s;
        // console.log(x, x / s);

        // let canvasHeight = this.viewPort.getHeight();
        // let y =

        // this.viewPort.setYMove(y);

        // this.viewPort.setScale(1);
        this.viewPort.setXMove(x);
        this.viewPort.setScale(this.viewPort.getZoomScale());
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
            if (p.h !== 0) {
                ctx.drawImage(this.spriteImg, p.sx, p.sy, p.w, p.h, p.dx, p.dy, p.w, p.h);
            }
        }

        return canvas;
    }
}

function loadImage(url: string) {
    'use strict';
    return new Promise<HTMLImageElement>(function(resolve, reject) {
        let img = new Image();
        img.src = url;
        img.addEventListener('load', function() {
            resolve(img);
        });
        img.addEventListener('error', function(e: ErrorEvent) {
            reject(e);
        });
    });
}

export = Segment;
