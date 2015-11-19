'use strict';

import Canvas from './Canvas';
import windowResize from './windowResize';
import touch from './touch';
import Segment from './Segment';
import enableDebug from './debug/enableDebug';

import SegmentRepository from './repository/SegmentRepository';
let segmentRepository = new SegmentRepository();


Canvas.init('#shelvesCanvas1').then(function(_canvas) {
  var canvas: Canvas;
  canvas = _canvas;

  // windowResize();
  // touch();

  canvas.start();

  _.times(5, function() {
      canvas.appendSegment();
  });
  // Segment.prependSegment(canvas);

  // enableDebug();
});

Canvas.init('#shelvesCanvas2').then(function(_canvas) {
  var canvas = _canvas;
  canvas.start();

  _.times(5, function() {
      canvas.appendSegment();
  });
});


// const SEGMENT_RATIO_MOVE = 0.7;
// let backBtn = document.getElementById('backBtn');
// backBtn.addEventListener('click', function() {
//   let move = canvas.distanceToMove + canvas.canvasWidth * SEGMENT_RATIO_MOVE;
//   canvas.moveX(move);
// }, false);
//
// let nextBtn = document.getElementById('nextBtn');
// nextBtn.addEventListener('click', function() {
//   let move = canvas.distanceToMove - canvas.canvasWidth * SEGMENT_RATIO_MOVE;
//   canvas.moveX(move);
// }, false);
