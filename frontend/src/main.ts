'use strict';

import SG from './ShelvesGlobals';
import enableDebug from './enableDebug';
import AnimcationLoop from './AnimationLoop';

SG.init();
AnimcationLoop.start();
enableDebug();

var RESIZE_DEBOUNCED_WAIT = 500;
window.addEventListener('resize', _.debounce(function(event: UIEvent){
  resizeCanvas();
}, RESIZE_DEBOUNCED_WAIT));
resizeCanvas();

function resizeCanvas() {
  var shelvesCanvasContainer = document.getElementById('shelvesCanvasContainer');
  var height = window.innerHeight
            || document.documentElement.clientHeight
            || document.body.clientHeight;

  SG.canvas.width = shelvesCanvasContainer.offsetWidth;
  SG.canvas.height = height;
}

SG.canvas.addEventListener("pointerdown", (e: PointerEvent) => {
  e.preventDefault();
  isCanvasTouched = true;
}, false);

SG.canvas.addEventListener("pointerup", () => {
  isCanvasTouched = false;
  lastMoveX = null;
}, false);

SG.canvas.addEventListener("pointerout", () => {
  isCanvasTouched = false;
  lastMoveX = null;
}, false);

SG.canvas.addEventListener("pointercancel", () => {
  isCanvasTouched = false;
  lastMoveX = null;
}, false);

SG.canvas.addEventListener("pointermove", (e: PointerEvent) => {
  if(isCanvasTouched) {
    var touch = {pageX: e.pageX, pageY: e.pageY};

    if(lastMoveX != null) {
      SG.moveDistance += touch.pageX - lastMoveX;
    }
    lastMoveX = touch.pageX;
  }
}, false);


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
var lastMoveX: number;
