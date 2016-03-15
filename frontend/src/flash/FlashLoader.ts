import SegmentWidthModel = require('../models/SegmentWidthModel');
import SegmentLoadedEvent = require('../segments/SegmentLoadedEvent');

class FlashLoader {
    private loadedSegments: any = {};

    constructor(
        private segments: Array<SegmentWidthModel>,
        private makeFlash: (segmentId: number) => void
    ) {
    }

    public segmentLoaded(event: SegmentLoadedEvent): void {
        this.loadedSegments[event.segmentId] = true;
    }

    public segmentUnvisibled(segmentId: number): void {
      _.remove(this.segments, (segment) => {
        return segment.id === segmentId;
      });
    }

    public canBeFlashed(): boolean {
      for (let segment of this.segments) {
          if (this.loadedSegments[segment.id] !== true) {
              return false;
          }
      }
      return true;
    }

    public checkIfEmpty(): boolean {
      return this.segments.length === 0;
    }

    public flash(): void {
        for (let segment of this.segments) {
            this.makeFlash(segment.id);
        }
    }
}

export = FlashLoader;
