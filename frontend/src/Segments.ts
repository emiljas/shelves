'use strict';

import Canvas from './Canvas';
import Segment from './Segment';
import cyclePosition from './cyclePosition';

const SPACE_BETWEEN_SEGMENTS = 50;

export default class Segments {
    private canvas: Canvas;
    public segments = new Array<Segment>();

    private backPosition = 0;
    private backX = 0;
    private frontPosition = 1;
    private frontX = 0;

    constructor(canvas: Canvas) {
      this.canvas = canvas;
    }

    public preloadSegments() {
      if(this.canvas.xMove * 3 + this.backX > 0) {
        this.prependSegment();
      }

      if(this.canvas.xMove * 3 - this.canvas.canvasWidth * 3 + this.frontX < 0) {
        this.appendSegment();
      }
    }

    public prependSegment() {
        let position = cyclePosition(this.backPosition--, 300);
        let segment = new Segment(this.canvas, position);
        this.segments.push(segment);
        var segmentWidth = this.canvas.segmentWidths[position - 1];
        this.backX -= segmentWidth + SPACE_BETWEEN_SEGMENTS;
        segment.x = this.backX;

        segment.load(segment);
    }

    public appendSegment() {
        let position = cyclePosition(this.frontPosition++, 300);
        let segment = new Segment(this.canvas, position);
        this.segments.push(segment);
        segment.x = this.frontX;
        var segmentWidth = this.canvas.segmentWidths[position - 1];
        this.frontX += segmentWidth + SPACE_BETWEEN_SEGMENTS;

        segment.load(segment);
    }

    public draw() {
        for(let segment of this.segments)
          segment.draw();
        this.preloadSegments();
    }

}
