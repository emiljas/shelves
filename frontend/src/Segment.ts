'use strict';

import SG from './ShelvesGlobals';
import SegmentRepository from './repository/SegmentRepository';
import cyclePosition from './cyclePosition';

let segmentRepository = new SegmentRepository();

const SPACE_BETWEEN_SEGMENTS = 50;

class Segment {
    private static backPosition = 0;
    private static backX = 0;
    private static frontPosition = 1;
    private static frontX = 0;

    public static preloadSegments() {
      if(SG.xMove * 3 + Segment.backX > 0) {
        Segment.prependSegment();
      }

      if(SG.xMove * 3 - SG.canvasWidth * 3 + Segment.frontX < 0) {
        Segment.appendSegment();
      }
    }

    private isLoaded = false;
    private position: number;
    private x: number;
    private data: SegmentModel;
    private spriteImg: HTMLImageElement;

    public static prependSegment() {
        let position = cyclePosition(Segment.backPosition--, 300);
        let segment = new Segment(position);
        var segmentWidth = SG.segmentWidths[position - 1];
        Segment.backX -= segmentWidth + SPACE_BETWEEN_SEGMENTS;
        segment.x = Segment.backX;

        segment.load(segment);
    }

    public static appendSegment() {
        let position = cyclePosition(Segment.frontPosition++, 300);
        let segment = new Segment(position);
        segment.x = Segment.frontX;
        var segmentWidth = SG.segmentWidths[position - 1];
        Segment.frontX += segmentWidth + SPACE_BETWEEN_SEGMENTS;

        segment.load(segment);
    }

    constructor(position: number) {
        this.position = position;
        SG.segments.push(this);
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
        if (this.isLoaded) {
            SG.ctx.beginPath();
            SG.ctx.lineWidth = 6;
            SG.ctx.moveTo(this.x, 0);
            SG.ctx.lineTo(this.x + this.data.width, 0);
            SG.ctx.lineTo(this.x + this.data.width, this.data.height);
            SG.ctx.lineTo(this.x, this.data.height);
            SG.ctx.lineTo(this.x, 0);
            SG.ctx.stroke();

            let spriteImg = this.spriteImg;
            let positions = this.data.productPositions;
            for (let p of positions) {
              if(p.h !== 0)
              SG.ctx.drawImage(spriteImg, p.sx, p.sy, p.w, p.h, p.dx + this.x, p.dy, p.w, p.h);
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
