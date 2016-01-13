import SegmentWidthModel = require('../models/SegmentWidthModel');

interface StartPositionResult {
  segmentIndex: number;
  x: number;
  segments: Array<SegmentWidthModel>;
}

export = StartPositionResult;
