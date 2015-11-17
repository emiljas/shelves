'use strict';

import SG from './ShelvesGlobals';
import SegmentRepository from './repository/SegmentRepository';

let segmentRepository = new SegmentRepository();
let segments = new Array<Segment>();

let x = 0;

class Segment {
    private isLoaded = false;
    private data: SegmentModel;
    private spriteImg: HTMLImageElement;

    public static loadByPosition(position: number) {
        let segment = new Segment();
        segments.push(segment);

        segmentRepository.getByPosition(position).then(function(data) {
            segment.data = data;
            return loadImage(data.spriteImgUrl);
        })
            .then(function(img) {
                segment.spriteImg = img;
                segment.isLoaded = true;
            });
    }

    public draw() {
        if (this.isLoaded) {
                SG.ctx.beginPath();
                SG.ctx.lineWidth = 6;
                SG.ctx.moveTo(x, 0);
                SG.ctx.lineTo(x + this.data.width, 0);
                SG.ctx.lineTo(x + this.data.width, this.data.height);
                SG.ctx.lineTo(x, this.data.height);
                SG.ctx.lineTo(x, 0);
                SG.ctx.stroke();

            let spriteImg = this.spriteImg;
            let positions = this.data.productPositions;
            for (let p of positions) {
                SG.ctx.drawImage(spriteImg, p.sx, p.sy, p.w, p.h, p.dx + x, p.dy, p.w, p.h);
            }
            x += this.data.width + 50;
        }
    }
}

for (let position = 1; position < 8; position++) {
    Segment.loadByPosition(position);
}

export default function draw() {
    x = 0;
    for (let segment of segments) {
        segment.draw();
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
