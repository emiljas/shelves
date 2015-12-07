function loadImage(url: string) {
    'use strict';
    return new Promise<HTMLImageElement>(function(resolve, reject) {
        let img = new Image();
        img.src = url;
        img.addEventListener('load', function() {
            resolve(img);
        });
        img.addEventListener('error', function(e: ErrorEvent) {
            reject(e);
        });
    });
}

export = loadImage;
