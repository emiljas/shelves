'use strict';

import Canvas from './Canvas';
import SegmentRepository from './repository/SegmentRepository';

let segmentRepository = new SegmentRepository();

class Segment {
    private x: number;
    private isLoaded = false;
    private canvas: Canvas;
    private index: number;
    private data: SegmentModel;
    private spriteImg: HTMLImageElement;


    constructor(canvas: Canvas, index: number, x: number) {
        this.index = index;
        this.canvas = canvas;
        this.x = x;
    }

    public load(segment: Segment) {
        segmentRepository.getByPosition(this.index).then(function(data) {
            segment.data = data;
            return loadImage(data.spriteImgUrl);
        })
            .then(function(img) {
                segment.spriteImg = img;
                segment.isLoaded = true;
            });
    }

    public draw() {
        let ctx = this.canvas.ctx;
        if (this.isLoaded) {
            ctx.beginPath();
            ctx.lineWidth = 6;
            ctx.moveTo(this.x, 0);
            ctx.lineTo(this.x + this.data.width, 0);
            ctx.lineTo(this.x + this.data.width, this.data.height);
            ctx.lineTo(this.x, this.data.height);
            ctx.lineTo(this.x, 0);
            ctx.stroke();

            let spriteImg = this.spriteImg;
            let positions = this.data.productPositions;
            for (let p of positions) {
                if (p.h !== 0) {
                    ctx.drawImage(spriteImg, p.sx, p.sy, p.w, p.h, p.dx + this.x, p.dy, p.w, p.h);
                }

            }
        }
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

export default Segment;
