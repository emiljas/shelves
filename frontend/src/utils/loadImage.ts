function loadImage(url: string) {
    'use strict';
    return new Promise<HTMLImageElement>(<any>((resolve: any, reject: any, onCancel: any) => {
        let img = new Image();
        img.src = url;

        img.onload = function() {
            resolve(img);
        };

        img.onerror = function(err) {
            reject(err);
        };

        onCancel(function() {
            img.src = '';
        });
    }));
}

export = loadImage;
