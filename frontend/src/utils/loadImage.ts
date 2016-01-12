function loadImage(url: string) {
    'use strict';

    return new Promise<HTMLImageElement>((resolve, reject) => {
      let img = new Image();
      img.src = url;

      img.onload = function() {
          resolve(img);
      };

      img.onerror = function(err) {
          reject(err);
      };
    });
}

export = loadImage;
