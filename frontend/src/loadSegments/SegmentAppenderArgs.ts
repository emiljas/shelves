import SegmentPlace = require('../segments/SegmentPlace');

interface SegmentAppenderArgs {
    INITIAL_SCALE: number;
    CANVAS_WIDTH: number;
    SEGMENT_WIDTHS: Array<number>;
    START_SEGMENT_INDEX: number;
    START_X: number;
    segments: Array<SegmentPlace>;
    createSegment: (index: number, x: number) => SegmentPlace;
}

export = SegmentAppenderArgs;
