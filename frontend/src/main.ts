'use strict';

import ViewPort = require('./ViewPort');

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
    let viewPort1 = ViewPort.init('#shelves1');
    viewPort1.start();
});
