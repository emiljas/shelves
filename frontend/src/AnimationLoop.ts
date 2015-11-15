'use strict';

import FpsMeasurer from './FpsMeasurer';
import SG from './ShelvesGlobals';
import draw from './draw';

export default class AnimcationLoop {
  public static start() {
    window.requestAnimationFrame(AnimcationLoop.loop);
  }

  private static loop(timestamp: number) {
    SG.timestamp = timestamp;

    SG.ctx.clearRect(0, 0, SG.canvas.width, SG.canvas.height);

    if(!isNearZeroPx(SG.distanceToMove)) {
      var secondsFromAnimationStart = (SG.timestamp - SG.animationTimestamp) / 1000;
      var d = Math.sin(secondsFromAnimationStart) * SG.distanceToMove;

      SG.moveDistance += d;
      SG.distanceToMove -= d;
    }

    SG.ctx.save();
    SG.ctx.translate(SG.moveDistance, 0);
    SG.ctx.scale(SG.scale, SG.scale);
    draw();
    SG.ctx.restore();

    SG.lastTimestamp = timestamp;
    window.requestAnimationFrame(AnimcationLoop.loop);
    FpsMeasurer.instance.tick(timestamp);
  }
}

var DIFF = 0.5;
function isNearZeroPx(value: number) {
  return Math.abs(value) < DIFF;
}
