'use strict';

import SG from './ShelvesGlobals';
import SegmentRepository from './repository/SegmentRepository';

let segmentsData = [
];

let segmentRepository = new SegmentRepository();
let promises = [];
for (let position = 1; position < 4; position++) {
    promises.push(segmentRepository.getByPosition(position));
}

Promise.all(promises).then((data) => {
    segmentsData = data;

    for (let d of data) {
        let img = new Image();
        img.src = d.spriteImgUrl;
        loadImg(img, d);
    }
});

function loadImg(img, d) {
    img.addEventListener('load', () => {
        d.img = img;
    }, false);
}

var x = 0;
export default function draw() {
    x = 0;
    for (let data of segmentsData) {
        drawSegment(data);
    }
}

function drawSegment(data) {
    if (data.img) {
        for (let c of data.coords) {
            SG.ctx.drawImage(data.img, c.x, c.y, c.width, c.height, c.destinationX + x, c.destinationY, c.width, c.height);
        }
        x += 200;
    }
}
