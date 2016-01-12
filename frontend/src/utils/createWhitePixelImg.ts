function createWhitePixelImg(): Promise<HTMLImageElement> {
    'use strict';

    return new Promise<HTMLImageElement>((resolve, reject) => {
        let img = new Image();
        img.src = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';

        img.onload = function() {
            resolve(img);
        };

        img.onerror = function(err) {
          console.log('createWhitePixelImg', err);
            reject(err);
        };
    });
}

export = createWhitePixelImg;
