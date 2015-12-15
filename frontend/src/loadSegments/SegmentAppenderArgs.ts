import ISegmentPlace = require('../segments/ISegmentPlace');

interface SegmentAppenderArgs {
    INITIAL_SCALE: number;
    CANVAS_WIDTH: number;
    SEGMENT_WIDTHS: Array<number>;
    START_SEGMENT_INDEX: number;
    START_X: number;
    segments: Array<ISegmentPlace>;
    createSegment: (index: number, x: number) => ISegmentPlace;
}

export = SegmentAppenderArgs;
