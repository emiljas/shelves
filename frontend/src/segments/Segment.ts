'use strict';

import ViewPort = require('../ViewPort');
import SegmentController = require('./SegmentController');
import SegmentRepository = require('../repository/SegmentRepository');
import KnownImageModel = require('../models/KnownImageModel');
import ProductIconModel = require('../models/ProductIconModel');
import ImageModel = require('../models/ImageModel');
import HeaderTitleFrameModel = require('../models/HeaderTitleFrameModel');
import PriceModel = require('../models/PriceModel');
import TextModel = require('../models/TextModel');
import TextType = require('../models/TextType');
import ImageType = require('../models/ImageType');
import ProductPositionModel = require('../models/ProductPositionModel');
import DebugPlaceModel = require('../models/DebugPlaceModel');
import TapInput = require('../touch/TapInput');
import loadImage = require('../utils/loadCancelableImage');
import createWhitePixelImg = require('../utils/createWhitePixelImg');
import ISegmentPlace = require('./ISegmentPlace');
import KnownImages = require('../images/KnownImages');
import Images = require('../images/Images');
import FlashEffect = require('../flash/FlashEffect');
import AnimateInput = require('../AnimateInput');
import CartDict = require('../cart/CartDict');

declare var Rossmann: any;

let segmentRepository = new SegmentRepository();

const SEGMENT_COLOR = '#D2D1CC';
const DARK_SEGMENT_COLOR = '#666666';
const SEGMENT_BORDER_LINE_WIDTH = 2;
const CURVE_R = 5;
const QUANTITY_CIRCLE_R = 20;

let TEXT_TYPE_FONT: any = {};
TEXT_TYPE_FONT[TextType.Price] = 'bold 11px Arial';
TEXT_TYPE_FONT[TextType.PromoPrice] = 'bold 11px Arial';
TEXT_TYPE_FONT[TextType.OldPrice] = 'bold 9px Arial';
TEXT_TYPE_FONT[TextType.Header] = '27px Arial';

let TEXT_TYPE_COLOR: any = {};
TEXT_TYPE_COLOR[TextType.Price] = '#333333';
TEXT_TYPE_COLOR[TextType.PromoPrice] = '#333333';
TEXT_TYPE_COLOR[TextType.OldPrice] = '#333333';
TEXT_TYPE_COLOR[TextType.Header] = '#0067B2';

let TEXT_TYPE_ALIGN: any = {};
TEXT_TYPE_ALIGN[TextType.Price] = 'right';
TEXT_TYPE_ALIGN[TextType.PromoPrice] = 'right';
TEXT_TYPE_ALIGN[TextType.OldPrice] = 'left';
TEXT_TYPE_ALIGN[TextType.Header] = 'center';

let TEXT_TYPE_BASE_LINE: any = {};
TEXT_TYPE_BASE_LINE[TextType.Price] = 'middle';
TEXT_TYPE_BASE_LINE[TextType.Price] = 'middle';
TEXT_TYPE_BASE_LINE[TextType.OldPrice] = 'middle';
TEXT_TYPE_BASE_LINE[TextType.Header] = 'middle';

class Segment implements ISegmentPlace {
    private isDrawnAtLeastOne = false;
    private isLoading = false;
    private isLoaded = false;
    private canDrawCanvas = false;
    private isProductTooltipOpen = false;
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private spriteImg: HTMLImageElement;
    private height: number;
    private zoomWidth: number;
    private zoomHeight: number;
    private middleX: number;
    private knownImages1: Array<KnownImageModel>;
    private knownImages2: Array<KnownImageModel>;
    private productIcons: Array<ProductIconModel>;
    private highlightedProductIcon: ProductIconModel;
    private images: Array<ImageModel>;
    private headerTitleFrames: Array<HeaderTitleFrameModel>;
    private prices: Array<PriceModel>;
    private hookPrices: Array<PriceModel>;
    private highlightedPrice: PriceModel;
    private texts: Array<TextModel>;
    private productPositions: Array<ProductPositionModel>;
    private hightlightedProductPositions: Array<ProductPositionModel>;
    private debugPlaces: Array<DebugPlaceModel>;
    private plnId: number;
    private planogramUrl: string;
    private seoTitle: string;
    private requestInProgressPromise: Promise<any> = null;
    private knownImgs: KnownImages;
    private imgs: Images;
    private cartDict: CartDict;

    private flashEffect: FlashEffect;

    constructor(
        private viewPort: ViewPort,
        private segmentController: SegmentController,
        private index: number,
        private id: number,
        private x: number,
        private width: number
    ) {
        this.cartDict = CartDict.GetInstance();
        this.height = this.viewPort.getSegmentHeight();
        this.ctx = viewPort.getCanvasContext();
        this.middleX = this.x + this.width / 2;
    }

    public getIndex(): number { return this.index; }
    public getId(): number { return this.id; }
    public getX(): number { return this.x; }
    public getWidth(): number { return this.width; }
    public getPlanogramUrl(): string { return this.planogramUrl; }
    public getPlanogramId(): number { return this.plnId; }
    public getSeoTitle(): string { return this.seoTitle; }
    public checkIfDrawnAtLeastOne(): boolean { return this.isDrawnAtLeastOne; }
    public checkIfLoading(): boolean { return this.isLoading; }
    public checkIfPreloading(): boolean { return this.isInCanvasVisibleArea() && !this.isLoaded; }
    public checkIfCanDrawCanvas(): boolean { return this.canDrawCanvas; }

    public load() {
        this.isLoading = true;

        return this.viewPort.getKnownImages().then((images) => {
            this.knownImgs = images;
            let getByIdPromise = this.requestInProgressPromise = segmentRepository.getById(this.id);
            return getByIdPromise;
        }).then((data) => {
            this.zoomWidth = Math.min(this.width * this.viewPort.getZoomScale(), this.viewPort.getMaxCanvasWidth());
            this.zoomHeight = Math.min(this.height * this.viewPort.getZoomScale(), this.viewPort.getMaxCanvasHeight());
            this.knownImages1 = data.knownImages1;
            this.knownImages2 = data.knownImages2;
            this.productIcons = data.productIcons;
            this.images = data.images;
            this.headerTitleFrames = data.headerTitleFrames;
            this.prices = data.prices;
            this.hookPrices = data.hookPrices;
            this.texts = data.texts;
            this.productPositions = data.productPositions;
            this.debugPlaces = data.debugPlaces;
            this.plnId = data.plnId;
            this.planogramUrl = data.planogramUrl;
            this.seoTitle = data.seoTitle;

            this.segmentController.handleSegmentDataLoaded(this);

            let loadImagePromise = this.requestInProgressPromise = this.loadImage(data.spriteImgUrl);
            return loadImagePromise;
        })
            .then((img) => {
                this.requestInProgressPromise = null;
                this.spriteImg = img;
                return Promise.resolve();
            })
            .then(() => {
                this.imgs = new Images(this.images);
                return this.imgs.downloadAll();
            })
            .then(() => {
                this.canDrawCanvas = true;
            });
    }

    public draw(timestamp: number) {
        if (this.isInCanvasVisibleArea()) {
            if (this.isLoaded) {
                this.ctx.drawImage(this.canvas, 0, 0, this.zoomWidth, this.zoomHeight, this.x, 0, this.width, this.height);

                if (this.flashEffect) {
                    if (this.flashEffect.isEnded()) {
                        this.flashEffect = null;
                        this.segmentController.reportEffectRenderingStop();
                    } else {
                        this.flashEffect.flash(timestamp, this.x, 0, this.width, this.height);
                    }
                }
            } else {
                this.ctx.fillStyle = SEGMENT_COLOR;
                this.ctx.fillRect(this.x, 0, this.width, this.height);

                this.ctx.strokeStyle = DARK_SEGMENT_COLOR;
                this.ctx.lineWidth = SEGMENT_BORDER_LINE_WIDTH;
                this.ctx.strokeRect(this.x, 0, this.width, this.height);

                let scale = this.viewPort.getScale();
                let middleY = (this.viewPort.getCanvasHeight() / 2 - this.viewPort.getYMove()) / scale;

                let preloader = this.viewPort.getPreloader().getCanvas();
                let preloaderWidth = preloader.width / scale;
                let preloaderHeight = preloader.height / scale;
                this.ctx.drawImage(preloader, this.middleX - preloaderWidth / 2, middleY - preloaderHeight / 2, preloaderWidth, preloaderHeight);
            }
        }

        this.isDrawnAtLeastOne = true;
    }

    public createCanvasIfNecessary(): void {
        if (this.canDrawCanvas && !this.canvas && this.isInCanvasVisibleArea()) {
            this.canvas = this.createCanvas();

            this.isLoaded = true;
            this.segmentController.segmentLoaded({ segmentId: this.id });
        }
    }

    public releaseCanvasIfNotInUse(): void {
        if (this.isLoaded && !this.isInCanvasVisibleArea()) {
            this.isLoaded = false;
            this.viewPort.getCanvasPool().release(this.canvas);
            this.canvas = null;
        }
    }

    public isClicked(x: number, y: number): boolean {
        return x >= this.x && x <= this.x + this.width;
    }

    public isClickable(x: number, y: number) {
        if (this.isLoaded) {
            for (let product of this.productPositions) {
                if (x >= this.x + product.dx
                    && x <= this.x + product.dx + product.w
                    && y >= product.dy
                    && y <= product.dy + product.h) {
                    return true;
                }
            }
        }

        return false;
    }

    public handleMouseMove(x: number, y: number): void {
        if (this.isLoaded) {
            let product = this.getProductUnderCursor(x, y);
            let tempHighlightedPrice = this.highlightedPrice;
            let tempHighlightedProductPositions = this.hightlightedProductPositions;
            let tempHighlightedProductIcon = this.highlightedProductIcon;

            if (product) {
                this.isProductTooltipOpen = true;
                Rossmann.Modules.Shelves2.queueShowingProductTooltip({
                    planogramProductId: product.ppId,
                    //x, y relative to page
                    productId: product.productId,
                    productName: product.name,
                    x: this.viewPort.getXMove() + (this.x + product.dx + product.w / 2) * this.viewPort.getScale(),
                    y: this.viewPort.getY() + this.viewPort.getYMove() + (product.dy + product.h / 2) * this.viewPort.getScale(),
                    width: product.w,
                    height: product.h,
                    photoUrl: product.photoUrl,
                    photoRatio: product.photoRatio,
                    minY: this.viewPort.getY()
                });

                this.hightlightedProductPositions = [product];

                let price = _.find(this.prices, (p) => { return p.priceId === product.priceId; });
                if (!price) {
                    price = _.find(this.hookPrices, (p) => { return p.priceId === product.priceId; });
                }
                this.highlightedPrice = price;

                let productIcon = _.find(this.productIcons, (p) => { return p.ppId === product.ppId; });
                this.highlightedProductIcon = productIcon;

            } else {
                this.hightlightedProductPositions = null;
                this.highlightedPrice = null;
                this.highlightedProductIcon = null;
                this.isProductTooltipOpen = false;
                Rossmann.Modules.Shelves2.closeProductTooltip();
            }

            if (this.hightlightedProductPositions !== tempHighlightedProductPositions
                || this.highlightedPrice !== tempHighlightedPrice
                || this.highlightedProductIcon !== tempHighlightedProductIcon) {
                this.drawCanvas(this.canvas);
                this.segmentController.segmentLoaded({ segmentId: this.id });
            }
        }
    }

    public handleMouseOut() {
        if (this.isLoaded) {
            let tempHighlightedPrice = this.highlightedPrice;
            let tempHighlightedProductPositions = this.hightlightedProductPositions;
            let tempHighlightedProductIcon = this.highlightedProductIcon;

            this.highlightedPrice = null;
            this.hightlightedProductPositions = null;
            this.highlightedProductIcon = null;

            if (this.hightlightedProductPositions !== tempHighlightedProductPositions
                || this.highlightedPrice !== tempHighlightedPrice
                || this.highlightedProductIcon !== tempHighlightedProductIcon) {
                this.drawCanvas(this.canvas);
                this.segmentController.segmentLoaded({ segmentId: this.id });
            }

            if (this.isProductTooltipOpen) {
                this.isProductTooltipOpen = false;
                Rossmann.Modules.Shelves2.closeProductTooltip();
            }
        }
    }

    public handleProductQuantityChanged(): void {
      if (this.isLoaded) {
        this.drawCanvas(this.canvas);
        this.segmentController.segmentLoaded({ segmentId: this.id });
      }
    }

    public showProductIfClicked(e: TapInput): void {
        let product = this.getProductUnderCursor(e.x, e.y);
        if (product) {
            Rossmann.Modules.Shelves2.showProduct(product.ppId, product.productId);
        }
    }

    public isInCanvasVisibleArea(): boolean {
        let xMove = this.viewPort.getXMove();
        let scale = this.viewPort.getScale();
        let canvasWidth = this.viewPort.getCanvasWidth();

        let isBeforeVisibleArea = xMove / scale + this.x + this.width <= 0;
        let isAfterVisibleArea = xMove / scale - canvasWidth / scale + this.x >= 0;
        return !isBeforeVisibleArea && !isAfterVisibleArea;
    }

    public fitOnViewPort(y?: number): void {
        let zoomScale = this.viewPort.getZoomScale();

        let canvasWidth = this.viewPort.getCanvasWidth();
        let xMove = (canvasWidth - this.width * zoomScale) / 2 - this.x * zoomScale;

        let canvasHeight = this.viewPort.getCanvasHeight();
        let yMove = canvasHeight / 2 - y * zoomScale;

        var animateInputs = new Array<AnimateInput>();

        animateInputs.push({propertyName: 'xMove', endValue: xMove});
        if (y != null) {
          animateInputs.push({propertyName: 'yMove', endValue: yMove});
        }

        let scale = this.viewPort.getScale();
        if (scale !== zoomScale) {
            animateInputs.push({propertyName: 'scale', endValue: zoomScale});
            this.viewPort.notifyAboutZoomChange(true);
        }

        this.viewPort.animateBatch(animateInputs);
    }

    public flash(): void {
        this.flashEffect = new FlashEffect(this.ctx);
        this.segmentController.reportEffectRenderingStart();
    }

    public hasProduct(productId: number): boolean {
        return _.find(this.productPositions, (p) => { return p.productId === productId; }) != null;
    }

    public showProduct(productId: number) {
        let product = this.getProduct(productId);
        this.fitOnViewPort(product.dy);
        Rossmann.Modules.Shelves2.showProduct(product.ppId, product.productId);
    }

    public getProduct(productId: number): ProductPositionModel {
        return _.find(this.productPositions, (p) => { return p.productId === productId; });
    }

    public unload(): void {
        if (this.isLoaded) {
            this.viewPort.getCanvasPool().release(this.canvas);
        } else if (this.requestInProgressPromise !== null) {
            this.requestInProgressPromise.cancel();
        }
    }

    private createCanvas(): HTMLCanvasElement {
        let canvas = this.viewPort.getCanvasPool().get();
        this.drawCanvas(canvas);
        return canvas;
    }

    private drawCanvas(canvas: HTMLCanvasElement): void {
        let ctx = canvas.getContext('2d');

        ctx.save();
        ctx.scale(this.viewPort.getZoomScale(), this.viewPort.getZoomScale());

        ctx.fillStyle = SEGMENT_COLOR;
        ctx.fillRect(0, 0, this.width, this.height);

        this.drawKnownImages(ctx, this.knownImages1);

        for (let image of this.images) {
            let img = this.imgs.getByUrl(image.url);
            if (image.w && image.h) {
                ctx.drawImage(img, image.dx, image.dy, image.w, image.h);
            } else {
                ctx.drawImage(img, image.dx, image.dy);
            }
        }

        this.drawKnownImages(ctx, this.knownImages2);

        ctx.font = TEXT_TYPE_FONT[TextType.Header];
        let maxHeaderTitleWidth = 0;
        for (let f of this.headerTitleFrames) {
            maxHeaderTitleWidth = Math.max(ctx.measureText(' ' + f.value + ' ').width, maxHeaderTitleWidth);
        }

        ctx.fillStyle = 'white';
        for (let f of this.headerTitleFrames) {
            ctx.shadowColor = 'black';
            ctx.shadowBlur = 20;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;

            let w = maxHeaderTitleWidth;
            let h = f.h;
            let dx = (f.headerWidth - w) / 2;
            let dy = f.dy;

            ctx.beginPath();
            ctx.moveTo(dx + CURVE_R, dy);
            ctx.lineTo(dx + w - CURVE_R, dy);
            ctx.quadraticCurveTo(dx + w, dy, dx + w, dy + CURVE_R);
            ctx.lineTo(dx + w, dy + h - CURVE_R);
            ctx.quadraticCurveTo(dx + w, dy + h, dx + w - CURVE_R, dy + h);
            ctx.lineTo(dx + CURVE_R, dy + h);
            ctx.quadraticCurveTo(dx, dy + h, dx, dy + h - CURVE_R);
            ctx.lineTo(dx, dy + CURVE_R);
            ctx.quadraticCurveTo(dx, dy, dx + CURVE_R, dy);
            ctx.closePath();
            ctx.fill();
        }
        ctx.shadowBlur = 0;

        for (let text of this.texts) {
            this.drawText(ctx, text);
        }

        for (let p of this.productPositions) {
            ctx.drawImage(this.spriteImg, p.sx, p.sy, p.w, p.h, p.dx, p.dy, p.w, p.h);
        }

        for (let price of this.prices) {
            this.drawPrice(ctx, price);
        }

        this.drawKnownImages(ctx, this.productIcons);

        for (let price of this.hookPrices) {
            this.drawPrice(ctx, price);
        }

        for (let p of this.productPositions) {
            if (p.isRightTopCorner) {
              this.drawQuantity(ctx, p);
            }
        }

        // debug only!
        // let debugPlacesI = 0;
        // let DEBUG_PLACES_COLORS = ['rgba(0, 255, 0, 0.3)', 'rgba(0, 0, 255, 0.3)', 'rgba(255, 0, 0, 0.3)'];
        // for (let s of this.debugPlaces) {
        //   ctx.beginPath();
        //   ctx.fillStyle = DEBUG_PLACES_COLORS[debugPlacesI % DEBUG_PLACES_COLORS.length];
        //   ctx.fillRect(s.dx, s.dy, s.w, s.h);
        //   ctx.closePath();
        //
        //   debugPlacesI++;
        // }

        //debug only!
        // ctx.font = 'bold 250px Ariel';
        // ctx.fillStyle = 'black';
        // ctx.textAlign = 'center';
        // ctx.fillText(this.index.toString(), this.width / 2, 600);

        this.drawHighlightedProductAndPrice(ctx);

        ctx.strokeStyle = DARK_SEGMENT_COLOR;
        ctx.lineWidth = SEGMENT_BORDER_LINE_WIDTH;
        ctx.strokeRect(0, 0, this.width, this.height);

        ctx.restore();
    }

    private drawQuantity(ctx: CanvasRenderingContext2D, p: ProductPositionModel): void {
      let quantity = this.cartDict.getDict()[p.productId];
      if (quantity && quantity > 0) {
        let x = p.dx + p.w;
        let y = p.dy;

        ctx.fillStyle = '#00CC00';
        ctx.beginPath();
        ctx.arc(x, y, QUANTITY_CIRCLE_R, 0, 2 * Math.PI, false);
        ctx.closePath();
        ctx.fill();

        ctx.font = 'bold 20px Ariel';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('+' + quantity, x, y);
      }
    }

    private drawHighlightedProductAndPrice(ctx: CanvasRenderingContext2D) {
        if (this.hightlightedProductPositions && this.highlightedPrice) {
            ctx.shadowColor = '#ffd700';
            ctx.shadowBlur = 20;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;

            for (let p of this.hightlightedProductPositions) {
                ctx.drawImage(this.spriteImg, p.sx, p.sy, p.w, p.h, p.dx, p.dy, p.w, p.h);
            }

            if (this.highlightedProductIcon) {
                this.drawKnownImage(ctx, this.highlightedProductIcon);
            }

            this.drawPrice(ctx, this.highlightedPrice);

            for (var p of this.hightlightedProductPositions) {
                let rightTopProduct = _.find(this.productPositions, (pp) => {
                  return pp.ppId === p.ppId && pp.isRightTopCorner;
                });
                this.drawQuantity(ctx, rightTopProduct);
            }

            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
        }
    }

    private drawPrice(ctx: CanvasRenderingContext2D, price: PriceModel) {
        if (price.imageType === ImageType.PromoPriceBackground) {
            this.drawKnownImage(ctx, {
                type: price.imageType,
                dx: price.promoImageDx,
                dy: price.imageDy
            });

            this.drawStrikethroughText(ctx, {
                value: price.oldTextValue,
                type: price.oldTextType,
                dx: price.oldTextDx,
                dy: price.oldTextDy
            });

            this.drawText(ctx, {
                value: price.textValue,
                type: price.promoTextType,
                dx: price.promoTextDx,
                dy: price.promoTextDy
            });
        } else {
            this.drawKnownImage(ctx, {
                type: price.imageType,
                dx: price.imageDx,
                dy: price.imageDy
            });

            this.drawText(ctx, {
                value: price.textValue,
                type: price.textType,
                dx: price.textDx,
                dy: price.textDy
            });
        }
    }

    private drawKnownImages(ctx: CanvasRenderingContext2D, images: Array<KnownImageModel>): void {
        for (let image of images) {
            this.drawKnownImage(ctx, image);
        }
    }

    private drawKnownImage(ctx: CanvasRenderingContext2D, image: KnownImageModel) {
        let img = this.knownImgs.getByType(image.type);

        if (image.repeat) {
            ctx.beginPath();
            let pattern = ctx.createPattern(img, 'repeat');
            ctx.fillStyle = pattern;
            ctx.fillRect(image.dx, image.dy, image.w, image.h);
        } else if (image.w && image.h) {
            ctx.drawImage(img, image.dx, image.dy, image.w, image.h);
        } else {
            ctx.drawImage(img, image.dx, image.dy);
        }
    }

    private drawText(ctx: CanvasRenderingContext2D, text: TextModel): void {
        ctx.font = TEXT_TYPE_FONT[text.type];
        ctx.fillStyle = TEXT_TYPE_COLOR[text.type];
        ctx.textAlign = TEXT_TYPE_ALIGN[text.type];
        ctx.textBaseline = TEXT_TYPE_BASE_LINE[text.type];
        ctx.fillText(text.value, text.dx, text.dy);
    }

    //tylko dla czcionki 9px
    private drawStrikethroughText(ctx: CanvasRenderingContext2D, text: TextModel): void {
        ctx.fillStyle = TEXT_TYPE_COLOR[text.type];
        ctx.font = TEXT_TYPE_FONT[text.type];
        ctx.textAlign = TEXT_TYPE_ALIGN[text.type];
        ctx.textBaseline = TEXT_TYPE_BASE_LINE[text.type];
        ctx.fillText(text.value, text.dx, text.dy);

        let width = ctx.measureText(text.value).width;
        ctx.beginPath();
        ctx.strokeStyle = '1px ' + TEXT_TYPE_COLOR[text.type];
        ctx.moveTo(text.dx, text.dy + 4.5);
        ctx.lineTo(text.dx + width, text.dy - 4.5);
        ctx.closePath();
        ctx.stroke();
    }

    private loadImage(url: string): Promise<HTMLImageElement> {
        if (url) {
            return loadImage(url);
        } else {
            return createWhitePixelImg();
        }
    }

    private getProductUnderCursor(x: number, y: number): ProductPositionModel {
        if (this.isLoaded) {
            for (let i = this.productPositions.length - 1; i >= 0; i--) {
                let product = this.productPositions[i];
                if (x >= this.x + product.dx
                    && x <= this.x + product.dx + product.w
                    && y >= product.dy
                    && y <= product.dy + product.h) {
                    return product;
                }
            }
        }

        return null;
    }
}

export = Segment;
