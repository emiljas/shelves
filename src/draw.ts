'use strict';

import SG from './ShelvesGlobals';

var segmentsData = [
  { width: 200, color: 'rgb(100, 100, 100)' },
  { width: 200, color: 'rgb(30, 150, 0)' },
  { width: 200, color: 'rgb(140, 10, 200)' },
  { width: 100, color: 'rgb(10, 100, 100)' },
  { width: 200, color: 'rgb(30, 10, 0)' },
  { width: 200, color: 'rgb(140, 255, 200)' },
];

export default function draw() {
  var x = 0;

  for(var data of segmentsData) {
    SG.ctx.fillStyle = data.color;
    SG.ctx.fillRect(x, 0, data.width, 100);

    x += data.width;
  }
}
