'use strict';

import SG from './ShelvesGlobals';
import SegmentRepository from './repository/SegmentRepository';

class Segment {
    private data: SegmentModel;
    private spriteImg: HTMLImageElement;

    public static loadByPosition(position: number) {
        let segment = new Segment();
        segmentRepository.getByPosition(position).then(function(data) {
            segment.data = data;
            segments.push(segment);
            return loadImage(data.spriteImgUrl);
        })
        .then(function(img) {
          segment.spriteImg = img;
        });
    }

    public draw() {
      let spriteImg = this.spriteImg;
      if(spriteImg) {
        let positions = this.data.productPositions;
        for (let p of positions) {
            SG.ctx.drawImage(spriteImg, p.sx, p.sy, p.w, p.h, p.dx + x, p.dy, p.w, p.h);
        }
      }
      x += 350 * 3;
    }
}

let segments = new Array<Segment>();

let segmentRepository = new SegmentRepository();
for (let position = 1; position < 8; position++) {
    Segment.loadByPosition(position);
}

let x = 0;

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
