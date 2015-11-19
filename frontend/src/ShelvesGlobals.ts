'use strict';

import SegmentRepository from './repository/SegmentRepository';
import Segment from './Segment';

let segmentRepository = new SegmentRepository();

export default class SG {
    private static _segmentWidths: Array<number>;
    public static get segmentWidths(): Array<number> { return SG._segmentWidths; }
    public static get SEGMENT_HEIGHT(): number { return 1920; }
    public static segments = new Array<Segment>();

    public static canvas: HTMLCanvasElement;
    public static canvasWidth: number;
    public static canvasHeight: number;
    public static ctx: CanvasRenderingContext2D;
    public static timestamp: number;

    public static xMove: number;
    public static yMove: number;

    public static distanceToMove: number;
    public static lastTimestamp: number;

    public static scale = 0.33;

    public static init(): Promise<void> {
        SG.canvas = <HTMLCanvasElement>document.getElementById('shelvesCanvas');
        SG.canvasWidth = SG.canvas.width;
        SG.canvasHeight = SG.canvas.height;
        SG.ctx = SG.canvas.getContext('2d');
        SG.timestamp = 0;
        SG.xMove = 0;
        SG.yMove = 0;
        SG.distanceToMove = 0;

        return segmentRepository.getWidths().then(function(widths) {
          SG._segmentWidths = widths;
          return Promise.resolve();
        });
    }
}
