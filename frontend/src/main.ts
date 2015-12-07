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

    const RESIZE_DEBOUNCED_WAIT = 200;
    const MOBILE_CHROME_HEADER_HEIGHT = 56;
    let lastDocumentSize = getDocumentSize();
    window.addEventListener('resize', _.debounce(function(event: UIEvent) {
        let documentSize = getDocumentSize();
        let isWidthUpdated = lastDocumentSize.width !== documentSize.width;
        let isHeightUpdated = Math.abs(lastDocumentSize.height - documentSize.height) > MOBILE_CHROME_HEADER_HEIGHT;
        if (isWidthUpdated || isHeightUpdated) {
            resize();
            lastDocumentSize = documentSize;
        }
    }, RESIZE_DEBOUNCED_WAIT));

    function getDocumentSize() {
        return {
            width: document.documentElement.clientWidth,
            height: document.documentElement.clientHeight
        };
    }

    function resize() {
        'use strict';
        viewPort.unbind();

        viewPort = ViewPort.init('#shelves1');
        viewPort.start();
    }
});
