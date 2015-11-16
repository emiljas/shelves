'use strict';

export default class SG {
  static canvas: HTMLCanvasElement;
  static ctx: CanvasRenderingContext2D;
  static timestamp: number;

  static moveXDistance: number;
  static moveYDistance: number;

  static distanceToMove: number;
  static lastTimestamp: number;
  static animationTimestamp: number;

  static scale = 0.33;

  static init(): void {
    SG.canvas = <HTMLCanvasElement>document.getElementById('shelvesCanvas');
    SG.ctx = SG.canvas.getContext('2d');
    SG.timestamp = 0;

    SG.moveXDistance = 0;
    SG.moveYDistance = 0;

    SG.distanceToMove = 0;
  }
}
