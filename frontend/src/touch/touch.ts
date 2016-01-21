'use strict';

import ViewPort = require('../ViewPort');

const PAN_LAST_STEP_MAX_DURATION = 100;

interface PanStep {
  time: number;
  xMove: number;
  yMove: number;
}

interface PanLastMove {
  time: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  xDiff: number;
  yDiff: number;
  s: number;
}

function touch(viewPort: ViewPort) {
    'use strict';

    let hammer = new Hammer(viewPort.getCanvas(), {
        touchAction: 'none'
    });
    hammer.get('pan').set({ direction: Hammer.DIRECTION_ALL });

    let lastDeltaX = 0;
    let lastDeltaY = 0;
    let panSteps = new Array<PanStep>();

    hammer.on('panstart', function() {
      viewPort.stopAnimation('xMove');
      viewPort.stopAnimation('xMove');
    });

    hammer.on('pan', function(e: HammerInput) {
        let xMove = viewPort.getXMove() + e.deltaX - lastDeltaX;
        viewPort.setXMove(xMove);
        lastDeltaX = e.deltaX;

        let yMove = viewPort.getYMove() + e.deltaY - lastDeltaY;
        viewPort.setYMove(yMove);
        lastDeltaY = e.deltaY;

        panSteps.push({
          time: Date.now(),
          xMove,
          yMove
        });
    });

    function calculateLastMove(): PanLastMove {
      let endStep: PanStep;
      if (panSteps.length > 0) {
        endStep = panSteps[panSteps.length - 1];
      } else {
        return null;
      }

      for (let i = panSteps.length - 1; i >= 0; i--) {
        let step = panSteps[i];
        if (/*(endStep.xMove !== step.xMove || endStep.yMove !== step.yMove)
          ||*/ endStep.time - step.time > PAN_LAST_STEP_MAX_DURATION) {
            let lastMove: PanLastMove = {
              time: endStep.time - step.time,
              x1: step.xMove,
              y1: step.yMove,
              x2: endStep.xMove,
              y2: endStep.yMove,
              xDiff: 0,
              yDiff: 0,
              s: 0
            };
            lastMove.xDiff = 1000 * (-(endStep.xMove - step.xMove)) / (2 * lastMove.time);
            lastMove.yDiff = 1000 * (-(endStep.yMove - step.yMove)) / (2 * lastMove.time);
            lastMove.s = Math.sqrt(Math.pow(lastMove.xDiff, 2) + Math.pow(lastMove.yDiff, 2));

            return lastMove;
        }
      }
    }

    hammer.on('panend', function(e: HammerInput) {

      let lastMove = calculateLastMove();

      if (lastMove && lastMove.s > 0) {
        let sinAlfa = lastMove.yDiff  / lastMove.s;
        let cosAlfa = lastMove.xDiff / lastMove.s;

        let newXDiff = lastMove.s * cosAlfa;
        let newYDiff = lastMove.s * sinAlfa;

        viewPort.animate('xMove', viewPort.getXMove() - newXDiff);
        viewPort.animate('yMove', viewPort.getYMove() - newYDiff);
      }

      panSteps = [];

      lastDeltaX = 0;
      lastDeltaY = 0;
    });

    hammer.on('tap', function(e) {
        viewPort.onClick(e.center);
    });

    return hammer;
}

export = touch;
