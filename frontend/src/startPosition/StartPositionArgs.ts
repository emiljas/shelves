import SegmentWidthModel = require('../models/SegmentWidthModel');
import QueryString = require('../QueryString');

interface StartPositionArgs {
  canvasWidth: number;
  initialScale: number;
  segmentsData: Array<SegmentWidthModel>;
  queryString: QueryString;
}

export = StartPositionArgs;
