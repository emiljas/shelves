// 'use strict';
//
// var fpsDiv = document.createElement('div');
// fpsDiv.classList.add('debugContainer');
// fpsDiv.classList.add('left');
//
// var fps = {
//   min: 0,
//   cur: 0,
//   max: 0
// };
//
// setInterval(function() {
//   if(window.fpsMeasurer) {
//     fps.cur = window.fpsMeasurer.get();
//     fps.min = Math.min(fps.min || Number.MAX_VALUE, fps.cur);
//     fps.max = Math.max(fps.max, fps.cur);
//
//     if(fps.max)
//       fpsDiv.textContent = 'FPS: min.' + fps.min + ' ' + 'cur.' + fps.cur + ' ' + 'max.' + fps.max;
//   }
// }, 500);
//
// var featuresDiv = document.createElement('div');
// featuresDiv.classList.add('debugContainer');
// featuresDiv.classList.add('right');
//
// checkFeature('canvas');
// checkFeature('requestanimationframe');
// checkFeature('xhr2');
// checkFeature('webworkers');
// checkFeature('transferables');
// checkFeature('touchevents');
// checkFeature('eventlistener');
//
// function checkFeature(featureName) {
//   var p = document.createElement('p');
//   p.textContent = featureName;
//   if(Modernizr[featureName])
//     p.classList.add('green');
//   else
//     p.classList.add('red');
//   featuresDiv.appendChild(p);
// }
//
// document.body.appendChild(fpsDiv);
// document.body.appendChild(featuresDiv);
