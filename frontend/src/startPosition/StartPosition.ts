import StartPositionArgs = require('./StartPositionArgs');
import StartPositionResult = require('./StartPositionResult');
import SegmentWidthModel = require('../models/SegmentWidthModel');

const DEFAULT_START_POSITION_RESULT: StartPositionResult = { segmentIndex: 0, x: 0, segments: [] };

class StartPosition {
    constructor(private args: StartPositionArgs) {
    }

    public calculate(): StartPositionResult {
        if (this.args.queryString.IsPlanogramIdSetUp) {
            let planogramId = this.args.queryString.PlanogramId;
            let segmentIndex = this.getSegmentIndexByPlanogramId(planogramId);
            if (segmentIndex > 0) {
              let segments = this.getSegmentsByPlanogramId(planogramId, segmentIndex);
              let planogramWidth = this.calculatePlanogramWidth(segments);
              let x = (this.args.canvasWidth - planogramWidth) / 2;
              if (x < 0) {
                  x = 0;
              }

              return { segmentIndex, x, segments: segments };
            } else {
              return DEFAULT_START_POSITION_RESULT;
            }
        } else if (this.args.queryString.IsSegmentIdSetUp) {
          let segmentId = this.args.queryString.SegmentId;
          let segmentIndex = this.getSegmentIndexBySegmentId(segmentId);
          if (segmentIndex > 0) {
            let segment = this.args.segmentsData[segmentIndex];
            let x = (this.args.canvasWidth - segment.width * this.args.initialScale) / 2;
            if (x < 0) {
              x = 0;
            }

            return { segmentIndex, x, segments: [segment]  };
          } else {
            return DEFAULT_START_POSITION_RESULT;
          }
        } else {
          return DEFAULT_START_POSITION_RESULT;
        }
    }

    private getSegmentIndexByPlanogramId(planogramId: number): number {
        return _.findIndex(this.args.segmentsData, (s) => { return s.plnId === planogramId; });
    }

    private getSegmentIndexBySegmentId(segmentId: number): number {
      return _.findIndex(this.args.segmentsData, (s) => { return s.id === segmentId; });
    }

    private getSegmentsByPlanogramId(planogramId: number, segmentIndex: number): Array<SegmentWidthModel> {
        let segments = new Array<SegmentWidthModel>();

        for (let i = segmentIndex; i < this.args.segmentsData.length; i++) {
            let segment = this.args.segmentsData[i];
            if (segment.plnId === planogramId) {
              segments.push(segment);
            } else {
                break;
            }
        }

        return segments;
    }

    private calculatePlanogramWidth(segments: Array<SegmentWidthModel>): number {
        let width = _.sum(segments, (s) => { return s.width; });
        return width * this.args.initialScale;
    }
}

export = StartPosition;
