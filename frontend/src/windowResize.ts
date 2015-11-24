// import SG from './ShelvesGlobals';
//
// const RESIZE_DEBOUNCED_WAIT = 500;
//
// function resizeCanvas() {
//     let shelvesCanvasContainer = document.getElementById('shelvesCanvasContainer');
//     SG.canvas.width = shelvesCanvasContainer.offsetWidth;
//     SG.canvas.height = SG.SEGMENT_HEIGHT * SG.scale;
//     SG.canvasWidth = SG.canvas.width;
//     SG.canvasHeight = SG.canvas.height;
// }

function windowResize() {
  'use strict';
  // window.addEventListener('resize', _.debounce(function(event: UIEvent) {
  //     resizeCanvas();
  // }, RESIZE_DEBOUNCED_WAIT));
  // resizeCanvas();
};

export = windowResize;
