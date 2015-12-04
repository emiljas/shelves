'use strict';

import ViewPort = require('./ViewPort');

import SegmentRepository = require('./repository/SegmentRepository');
const segmentRepository = new SegmentRepository();

//should be deleted when setAttribute on server side!
let downloadSegmentWidths = segmentRepository.getWidths().then(function(widths) {
    let shelvesContainer = document.querySelector('#shelves1');
    shelvesContainer.setAttribute('data-segment-widths', JSON.stringify(widths));
    return Promise.resolve();
});

let viewPort: ViewPort;

downloadSegmentWidths.then(function() {
    viewPort = ViewPort.init('#shelves1');
    viewPort.start();
});

const RESIZE_DEBOUNCED_WAIT = 500;
window.addEventListener('resize', _.debounce(function(event: UIEvent) {
    resize();
}, RESIZE_DEBOUNCED_WAIT));

function resize() {
    'use strict';
    viewPort.unbind();

    viewPort = ViewPort.init('#shelves1');
    viewPort.start();
}
