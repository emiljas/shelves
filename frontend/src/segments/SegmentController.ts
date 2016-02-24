'use strict';

import ViewPort = require('../ViewPort');
import Segment = require('./Segment');
import SegmentPrepender = require('../loadSegments/SegmentPrepender');
import SegmentAppender = require('../loadSegments/SegmentAppender');
import FlashLoader = require('../flash/FlashLoader');
import TapInput = require('../touch/TapInput');
import SegmentAppenderArgs = require('../loadSegments/SegmentAppenderArgs');
import SegmentWidthModel = require('../models/SegmentWidthModel');
import StartPositionResult = require('../startPosition/StartPositionResult');
import SegmentLoadedEvent = require('./SegmentLoadedEvent');

const DOUBLE_COMPARISON_DIFF = 1;

class SegmentController {
    private segments = new Array<Segment>();
    private prepender: SegmentPrepender;
    private appender: SegmentAppender;
    private flashLoader: FlashLoader;
    private notDrawnSegmentCount = 0;
    private effectsRenderingCount = 0;

    constructor(
        private viewPort: ViewPort,
        private segmentsData: Array<SegmentWidthModel>,
        private segmentWidths: Array<number>,
        startPosition: StartPositionResult
    ) {
        let appenderArgs: SegmentAppenderArgs = {
            INITIAL_SCALE: viewPort.getInitialScale(),
            CANVAS_WIDTH: viewPort.getCanvasWidth(),
            SEGMENT_WIDTHS: segmentWidths,
            START_SEGMENT_INDEX: startPosition.segmentIndex,
            START_X: startPosition.x,
            segments: this.segments,
            createSegment: (index, x, width) => {
                let id = this.segmentsData[index].id;
                let segment = new Segment(viewPort, this, index, id, x, width);
                // segment.load();
                return segment;
            }
        };
        this.prepender = new SegmentPrepender(appenderArgs);
        this.appender = new SegmentAppender(appenderArgs);

        let makeFlash = (segmentId: number) => {
            let segment = _.find(this.segments, (s) => { return s.getId() === segmentId; });
            segment.flash();
        };
        this.flashLoader = new FlashLoader(startPosition.segments, makeFlash);
    }

    public onClick(e: TapInput): void {
        let scale = this.viewPort.getScale();

        e.x = (e.x - this.viewPort.getXMove()) / scale;
        e.y = (e.y - this.viewPort.getYMove() - this.viewPort.getY()) / scale;

        let clickedSegment: Segment;
        for (let segment of this.segments) {
            if (segment.isClicked(e)) {
                clickedSegment = segment;
                break;
            }
        }

        if (clickedSegment) {
            clickedSegment.fitOnViewPort(e.y);
            clickedSegment.showProductIfUnderCursor();
        } else {
            console.error('cannot find clicked segment');
        }
    }

    public checkIfNonDrawnSegmentsExistsAndReset(): boolean {
        let nonDrawnSegmentsExists = this.notDrawnSegmentCount > 0;
        this.notDrawnSegmentCount = 0;
        return nonDrawnSegmentsExists;
    }

    public checkIfAnyEffectsRendering(): boolean {
      return this.effectsRenderingCount > 0;
    }

    public reportEffectRenderingStart(): void {
      this.effectsRenderingCount++;
    }

    public reportEffectRenderingStop(): void {
      this.effectsRenderingCount--;
    }

    public draw(timestamp: number): void {
        for (let segment of this.segments) {
            segment.draw(timestamp);
        }
    }

    public preloadSegments() {
        let visibleAndNotReadySegmentsExists = this.visibleAndNotReadySegmentsExists();
        for (let segment of this.segments) {
          if (!segment.checkIfLoading()) {
            if (segment.isInCanvasVisibleArea()) {
              segment.load();
            } else if (!visibleAndNotReadySegmentsExists) {
              segment.load();
            }
          }
        }

        for (let segment of this.segments) {
          segment.releaseCanvasIfNotInUse();
        }

        for (let segment of this.segments) {
          segment.createCanvasIfNecessary();
        }

        let xMove = this.viewPort.getXMove();
        let scale = this.viewPort.getScale();
        let initialScale = this.viewPort.getInitialScale();
        xMove *= initialScale / scale;

        let wasSegmentsAppended = this.appender.work(xMove);
        let wasSegmentsPrepended = this.prepender.work(xMove);
        let mustBeRedraw = wasSegmentsAppended || wasSegmentsPrepended;

        if (mustBeRedraw) {
          this.notDrawnSegmentCount++;
        }

        if (this.flashLoader) {
          if (this.flashLoader.canBeFlashed()) {
            this.flashLoader.flash();
            this.flashLoader = null;
          } else {
            for (let segment of this.segments) {
              if (!segment.isInCanvasVisibleArea()) {
                this.flashLoader.segmentUnvisibled(segment.getId());
              }
            }
          }
        }
    }

    public visibleAndNotReadySegmentsExists(): boolean {
      for (let segment of this.segments) {
        if (segment.isInCanvasVisibleArea() && !segment.checkIfCanDrawCanvas()) {
          return true;
        }
      }
      return false;
    }

    public segmentLoaded(event: SegmentLoadedEvent) {
        if (this.flashLoader) {
            this.flashLoader.segmentLoaded(event);
        }
        this.notDrawnSegmentCount++;
    }

    public fitMiddleSegmentOnViewPort(): void {
      this.onClick({
         x: this.viewPort.getCanvasWidth() / 2,
         y: 0
      });
    }

    public fitLeftSegmentOnViewPort(): void {
      let segments = _.sortBy(this.segments, (s) => { return -s.getX(); });
      let canvasWidth = this.viewPort.getCanvasWidth();
      let middleX = (-this.viewPort.getXMove() + canvasWidth / 2)  / this.viewPort.getZoomScale();
      for (let segment of segments) {
        let segmentMiddleX = segment.getX() + segment.getWidth() / 2;
        if (middleX - DOUBLE_COMPARISON_DIFF > segmentMiddleX) {
          segment.fitOnViewPort(-1);
          return;
        }
      }
    }

    public fitRightSegmentOnViewPort(): void {
      let segments = _.sortBy(this.segments, (s) => { return s.getX(); });
      let canvasWidth = this.viewPort.getCanvasWidth();
      let middleX = (-this.viewPort.getXMove() + canvasWidth / 2)  / this.viewPort.getZoomScale();
      for (let segment of segments) {
        let segmentMiddleX = segment.getX() + segment.getWidth() / 2;
        if (middleX + DOUBLE_COMPARISON_DIFF < segmentMiddleX) {
          segment.fitOnViewPort(-1);
          return;
        }
      }
    }

    public handleMouseMove(x: number, y: number) {
      x = (x - this.viewPort.getXMove()) / this.viewPort.getScale();
      y = (y - this.viewPort.getYMove()) / this.viewPort.getScale();
      for (let segment of this.segments) {
        if (x >= segment.getX() && x <= segment.getX() + segment.getWidth()) {
          return segment.handleMouseMove(x, y);
        }
      }
    }

    public isClickable(x: number, y: number) {
      x = (x - this.viewPort.getXMove()) / this.viewPort.getScale();
      y = (y - this.viewPort.getYMove()) / this.viewPort.getScale();
      for (let segment of this.segments) {
        if (x >= segment.getX() && x <= segment.getX() + segment.getWidth()) {
          return segment.isClickable(x, y);
        }
      }

      return false;
    }

    public unload(): void {
        for (let segment of this.segments) {
            segment.unload();
        }
    }
}

export = SegmentController;
