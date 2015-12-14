import LoadSegmentResult = require('./LoadSegmentResult');
import SegmentPlace = require('../segments/SegmentPlace');
import Segment = require('../segments/Segment');
import LoopIndex = require('./LoopIndex');

interface SegmentAppenderArgs {
    initialScale: number;
    segments: Array<Segment>;
    canvasWidth: number;
    segmentWidths: Array<number>;
    segmentIndex: number;
    startX: number;
    createSegment: () => Segment;
}

interface AppendedSegment {
  x: number;
  width: number;
  segment: Segment;
}

class SegmentAppender {
  private segmentCount: number;
  private loopIndex: LoopIndex;
  private nextIndex: number = 0;
  private nextX: number = 0;
  private appendedSegments = new Array<AppendedSegment>();

  constructor(private args: SegmentAppenderArgs) {
    this.segmentCount = args.segmentWidths.length;
    this.loopIndex = new LoopIndex(this.segmentCount, args.segmentIndex);
    this.nextX = args.startX / this.args.initialScale;
  }

  public work(xMove: number): void {
    while (this.shouldAppend(xMove)) {
      this.append();
    }

    this.unloadUnvisibleSegments(xMove);
  }

  private shouldAppend(xMove: number): boolean {
       let freeSpace = -xMove + 2 * this.args.canvasWidth - this.nextX * this.args.initialScale;
       return freeSpace > 0;
  }

  private append(): void {
        let segmentWidth = this.args.segmentWidths[this.nextIndex];
        let segment = this.args.createSegment();
        this.appendedSegments.push({
          x: this.nextX,
          width: segmentWidth,
          segment: segment
        });
        this.args.segments.push(segment);
        this.nextX += segmentWidth;
        this.nextIndex = this.loopIndex.next();
  }

  private unloadUnvisibleSegments(xMove: number) {
      for (let segment of this.appendedSegments) {
          if (this.isSegmentAfterCanvasVisibleArea(xMove, segment.x)) {
              this.nextIndex = this.loopIndex.prev();
              this.nextX -= segment.width;
              _.pull(this.appendedSegments, segment);
              _.pull(this.args.segments, segment.segment);
          }
      }
  }

  private isSegmentAfterCanvasVisibleArea(xMove: number, segmentX: number) {
      let distanceFromCanvasRightEdge = xMove - this.args.canvasWidth + segmentX * this.args.initialScale;
      console.log(distanceFromCanvasRightEdge);
      return distanceFromCanvasRightEdge > this.args.canvasWidth;
  }
}

export = SegmentAppender;


// //first segment index
// class SegmentAppender {
//     private segmentCount: number;
//     private nextIndex = 0;
//     private loopIndex: LoopIndex;
//     private nextX = 0;
//
//     constructor(
//         private segmentWidths: Array<number>
//     ) {
//         this.segmentCount = segmentWidths.length;
//         this.loopIndex = new LoopIndex(this.segmentCount, 0);
//     }
//
//     public shouldAppend(canvasWidth: number, xMove: number, scale: number): boolean {
//         return xMove /*/ scale*/ - canvasWidth /*/ scale*/ + this.nextX < 0;
//     }
//
//     // public unloadUnvisibleSegments(xMove: number, scale: number) {
//     //     for (let segment of this.segments) {
//     //         if (this.isSegmentAfterCanvasVisibleArea(xMove, scale, segment.getX())) {
//     //             this.nextIndex = this.loopIndex.prev();
//     //             this.nextX -= segment.getWidth();
//     //             _.pull(this.segments, segment);
//     //         }
//     //     }
//     // }
//
//     public append(): LoadSegmentResult {
//         let result = { index: this.nextIndex, x: this.nextX };
//         let segmentWidth = this.segmentWidths[this.nextIndex];
//         this.nextX += segmentWidth;
//         this.nextIndex = this.loopIndex.next();
//         return result;
//     }
//
//     // private isSegmentAfterCanvasVisibleArea(xMove: number, scale: number, segmentX: number) {
//     //     return xMove / scale - this.canvasWidth / scale + segmentX > 0;
//     // }
// }

// export = SegmentAppender;
