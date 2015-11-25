'use strict';

import ViewPort = require('./ViewPort');
// import windowResize from './windowResize';
// import touch from './touch';
// import Segment from './Segment';
// import enableDebug from './debug/enableDebug';

import SegmentRepository = require('./repository/SegmentRepository');
let segmentRepository = new SegmentRepository();

//should be deleted when setAttribute on server side!
let downloadSegmentWidths = segmentRepository.getWidths().then(function(widths) {
    let canvases = document.querySelectorAll('canvas');
    for (let i = 0; i < canvases.length; i++) {
        let canvas = canvases[i];
        canvas.setAttribute('data-segment-widths', JSON.stringify(widths));
    }

    return Promise.resolve();
});

downloadSegmentWidths.then(function() {
    let viewPort1 = ViewPort.init('#shelvesCanvas1');
    // windowResize();
    // touch();
    viewPort1.start();
    // Segment.prependSegment(canvas);
    // enableDebug();

    // let canvas2 = Canvas.init('#shelvesCanvas2');
    // canvas2.start();
    // _.times(5, function() {
    //     canvas2.appendSegment();
    // });
    //
    // let canvas3 = Canvas.init('#shelvesCanvas3');
    // canvas3.start();
    // _.times(5, function() {
    //     canvas3.appendSegment();
    // });

    // const SEGMENT_RATIO_MOVE = 0.7;
    let backBtn = document.getElementById('backBtn');
    backBtn.addEventListener('click', () => { viewPort1.slideLeft(); }, false);

    let nextBtn = document.getElementById('nextBtn');
    nextBtn.addEventListener('click', () => { viewPort1.slideRight(); }, false);

});
