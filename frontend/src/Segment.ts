'use strict';

import Canvas from './Canvas';
import Segments from './Segments';
import SegmentRepository from './repository/SegmentRepository';

let segmentRepository = new SegmentRepository();

class Segment {
    private isLoaded = false;
    private canvas: Canvas;
    private position: number;
    public x: number;
    private data: SegmentModel;
    private spriteImg: HTMLImageElement;


    constructor(canvas: Canvas, position: number) {
        this.position = position;
        this.canvas = canvas;
    }

    public load(segment: Segment) {
        segmentRepository.getByPosition(this.position).then(function(data) {
            segment.data = data;
            return loadImage(data.spriteImgUrl);
        })
            .then(function(img) {
                segment.spriteImg = img;
                segment.isLoaded = true;
            });
    }

    public draw() {
      var ctx = this.canvas.ctx;
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
              if(p.h !== 0)
              ctx.drawImage(spriteImg, p.sx, p.sy, p.w, p.h, p.dx + this.x, p.dy, p.w, p.h);
            }
        }
    }
}

function loadImage(url: string) {
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
