'use strict';

import SG from './ShelvesGlobals';
import Canvas from './Canvas';
import windowResize from './windowResize';
import touch from './touch';
import enableDebug from './debug/enableDebug';

SG.init();
windowResize();
touch();
Canvas.instance.start();

const SEGMENT_RATIO_MOVE = 0.7;
let backBtn = document.getElementById('backBtn');
backBtn.addEventListener('click', function() {
  let move = SG.distanceToMove + SG.canvasWidth * SEGMENT_RATIO_MOVE;
  Canvas.instance.moveX(move);
}, false);

let nextBtn = document.getElementById('nextBtn');
nextBtn.addEventListener('click', function() {
  let move = SG.distanceToMove - SG.canvasWidth * SEGMENT_RATIO_MOVE;
  Canvas.instance.moveX(move);
}, false);

enableDebug();
