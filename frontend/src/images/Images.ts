import loadImage = require('../utils/loadImage');
import ImageModel = require('../models/ImageModel');

class Images {
    private images: any = {};
    private promises = new Array<Promise<void>>();

    constructor(images: Array<ImageModel>) {
      this.promises = _.map(images, (i) => { return this.load(i.url); });
    }

    public downloadAll(): Promise<void[]> {
      return Promise.all(this.promises);
    }

    public getByUrl(url: string): HTMLImageElement {
      return this.images[url];
    }

    private load(url: string): Promise<void> {
      return loadImage(url).then((img) => {
         this.images[url] = img;
         return Promise.resolve();
      });
    }

}

export = Images;
