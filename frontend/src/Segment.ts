'use strict';

import ViewPort = require('./ViewPort');
import SegmentRepository = require('./repository/SegmentRepository');
import ProductPositionModel = require('./models/ProductPositionModel');
import TapInput = require('./TapInput');

let segmentRepository = new SegmentRepository();

class Segment {
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
            .then(function(img) {
                segment.spriteImg = img;
                segment.isLoaded = true;
            });
    }

    public draw() {
        if (this.isLoaded) {
            this.ctx.beginPath();
            this.ctx.lineWidth = 20;
            this.ctx.moveTo(this.x, 0);
            this.ctx.lineTo(this.x + this.width, 0);
            this.ctx.lineTo(this.x + this.width, this.height);
            this.ctx.lineTo(this.x, this.height);
            this.ctx.lineTo(this.x, 0);
            this.ctx.stroke();

            let spriteImg = this.spriteImg;
            let positions = this.productPositions;
            for (let p of positions) {
                if (p.h !== 0) {
                    this.ctx.drawImage(spriteImg, p.sx, p.sy, p.w, p.h, p.dx + this.x, p.dy, p.w, p.h);
                }

            }
        }
    }

    public isClicked(e: TapInput): boolean {
      return e.x > this.x && e.x < this.x + this.width;
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
