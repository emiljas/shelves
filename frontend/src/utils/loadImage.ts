function loadImage(url: string) {
    'use strict';
    return new Promise<HTMLImageElement>(<any>((resolve: any, reject: any, onCancel: any) => {
        url = 'http://192.168.1.104:3000/DesktopModules/RossmannV4Modules/Shelves2/ImageProxy.ashx?src=' + encodeURIComponent(url);

        let req = new XMLHttpRequest();
        req.open('get', url);
        req.responseType = 'blob';
        req.send();
        req.onload = function () {
            let img = new Image();
            let imgSrc = window.URL.createObjectURL(req.response);
            img.src = imgSrc;

            img.onload = function() {
              window.URL.revokeObjectURL(imgSrc);
              resolve(img);
            };

            img.onerror = function(err) {
                reject(err);
            };
        };

        onCancel(function() {
          req.abort();
        });
    }));
}

export = loadImage;
