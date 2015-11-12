'use strict';

import SG from './ShelvesGlobals';
import enableDebug from './enableDebug';
import AnimcationLoop from './AnimationLoop';

SG.init();
AnimcationLoop.start();
enableDebug();

SG.canvas.addEventListener("touchstart", handleStart, false);
SG.canvas.addEventListener("touchend", handleEnd, false);
SG.canvas.addEventListener("touchcancel", handleCancel, false);
SG.canvas.addEventListener("touchmove", handleMove, false);


var backBtn = document.getElementById('backBtn');
backBtn.addEventListener('click', function() {
  SG.distanceToMove = SG.distanceToMove - 250;
  SG.animationTimestamp = SG.timestamp;
}, false);

var nextBtn = document.getElementById('nextBtn');
nextBtn.addEventListener('click', function() {
  SG.distanceToMove = SG.distanceToMove + 250;
  SG.animationTimestamp = SG.timestamp;
}, false);

var isCanvasTouched = false;
var lastMoveX;

function handleStart(e) {
  e.preventDefault();
  isCanvasTouched = true;
}

function handleEnd() {
  isCanvasTouched = false;
  lastMoveX = null;
}

function handleCancel() {
  isCanvasTouched = false;
  lastMoveX = null;
}

function handleMove(evt) {
  isCanvasTouched = true;
  var touch = evt.touches[0];

  if(lastMoveX != null) {
    SG.moveDistance += touch.pageX - lastMoveX;
  }
  lastMoveX = touch.pageX;
}
