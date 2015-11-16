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
  SG.canvas.width = shelvesCanvasContainer.offsetWidth;
  SG.canvas.height = 1920 * SG.scale;
}

let hammer = new Hammer(SG.canvas, {
  touchAction: 'none'
});
hammer.get('pan').set({ direction: Hammer.DIRECTION_ALL });
// hammer.get('pinch').set({ enable: true });
// hammer.get('rotate').set({ enable: true });

let lastDeltaX = 0;
let lastDeltaY = 0;
hammer.on("pan", function(e: HammerInput) {
  console.log("A");

  SG.moveXDistance += e.deltaX - lastDeltaX;
  lastDeltaX = e.deltaX;

  SG.moveYDistance += e.deltaY - lastDeltaY;
  lastDeltaY = e.deltaY;
});

hammer.on('panend', function(e: HammerInput) {
  lastDeltaX = 0;
  lastDeltaY = 0;
});

hammer.on('tap', function() {
  if(SG.scale == 0.33) {
    SG.canvas.height *= 3;
    SG.scale = 1;
  }
  else {
    SG.canvas.height /= 3;
    SG.scale = 0.33;
  }
});

var backBtn = document.getElementById('backBtn');
backBtn.addEventListener('click', function() {
  SG.distanceToMove = SG.distanceToMove + 250;
  SG.animationTimestamp = SG.timestamp;
}, false);

var nextBtn = document.getElementById('nextBtn');
nextBtn.addEventListener('click', function() {
  SG.distanceToMove = SG.distanceToMove - 250;
  SG.animationTimestamp = SG.timestamp;
}, false);
