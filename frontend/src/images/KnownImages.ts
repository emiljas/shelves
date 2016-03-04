import ImageType = require('../models/ImageType');
import loadImage = require('../utils/loadImage');

const baseUrl = '/DesktopModules/RossmannV4Modules/Shelves2/Img/';

interface Image {
    type: ImageType;
    url: string;
    img: HTMLImageElement;
}

class KnownImages {
    private images = new Array<Image>();

    constructor() {
        this.addImage(ImageType.ShelfLeftCorner, 'shelfLeftCorner.png');
        this.addImage(ImageType.ShelfRightCorner, 'shelfRightCorner.png');
        this.addImage(ImageType.Shelf, 'shelf.png');
        this.addImage(ImageType.ShelfBackground, 'shelfBackground.png');
        this.addImage(ImageType.ShelfLeftBackground, 'shelfLeftBackground.png');
        this.addImage(ImageType.ShelfRightBackground, 'shelfRightBackground.png');
        this.addImage(ImageType.FooterBackground, 'footerBackground.png');
        this.addImage(ImageType.PegboardHook, 'pegboardHook.png');
        this.addImage(ImageType.PriceBackground, 'priceBackground.png');
        this.addImage(ImageType.PromoPriceBackground, 'promoPriceBackground.png');
        this.addImage(ImageType.NewProduct, 'newProduct.png');
        this.addImage(ImageType.SpecialProduct, 'specialProduct.png');
        this.addImage(ImageType.SuperOfferProduct, 'superOfferProduct.png');
    }

    public static downloadAll(): Promise<KnownImages> {
        let images = new KnownImages();

        let promises = new Array<Promise<void>>();
        for (let image of images.images) {
            promises.push(images.loadImage(image));
        }
        return Promise.all(promises).then(() => {
          return images;
        });
    }

    public getByType(type: ImageType): HTMLImageElement {
        return this.images[type].img;
    }

    private loadImage(image: Image): Promise<void> {
        return loadImage(image.url).then((img) => {
            image.img = img;
        });
    }

    private addImage(type: ImageType, url: string): void {
        this.images[type] = { type, url: baseUrl + url, img: null };
    }
}

export = KnownImages;
