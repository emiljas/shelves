'use strict';

import SG from './ShelvesGlobals';

export default function draw() {
    for (let segment of SG.segments) {
        segment.draw();
    }
}
