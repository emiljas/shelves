'use strict';

import ViewPort = require('../ViewPort');
import SegmentController = require('./SegmentController');
import SegmentRepository = require('../repository/SegmentRepository');
import KnownImageModel = require('../models/KnownImageModel');
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

let segmentRepository = new SegmentRepository();

const SEGMENT_COLOR = '#D2D1CC';
const DARK_SEGMENT_COLOR = '#666666';
const SEGMENT_BORDER_LINE_WIDTH = 2;
const CURVE_R = 5;

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
    private isLoading = false;
    private isLoaded = false;
    private canDrawCanvas = false;
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private spriteImg: HTMLImageElement;
    private height: number;
    private zoomWidth: number;
    private zoomHeight: number;
    private middleX: number;
    private knownImages1: Array<KnownImageModel>;
    private knownImages2: Array<KnownImageModel>;
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
    private requestInProgressPromise: Promise<any> = null;
    private knownImgs: KnownImages;
    private imgs: Images;
    private flashEffect: FlashEffect;

    constructor(
        private viewPort: ViewPort,
        private segmentController: SegmentController,
        private index: number,
        private id: number,
        private x: number,
        private width: number
    ) {
        this.height = this.viewPort.getSegmentHeight();
        this.ctx = viewPort.getCanvasContext();
        this.middleX = this.x + this.width / 2;
    }

    public getIndex(): number { return this.index; }
    public getId(): number { return this.id; }
    public getX(): number { return this.x; }
    public getWidth(): number { return this.width; }
    public checkIfLoading(): boolean { return this.isLoading; }
    public checkIfCanDrawCanvas(): boolean { return this.canDrawCanvas; }

    public load(): void {
      this.isLoading = true;

        this.viewPort.getKnownImages().then((images) => {
            this.knownImgs = images;
            let getByIdPromise = this.requestInProgressPromise = segmentRepository.getById(this.id);
            return getByIdPromise;
        }).then((data) => {
            this.zoomWidth = this.width * this.viewPort.getZoomScale();
            this.zoomHeight = this.height * this.viewPort.getZoomScale();
            this.knownImages1 = data.knownImages1;
            this.knownImages2 = data.knownImages2;
            this.images = data.images;
            this.headerTitleFrames = data.headerTitleFrames;
            this.prices = data.prices;
            this.hookPrices = data.hookPrices;
            this.texts = data.texts;
            this.productPositions = data.productPositions;
            this.debugPlaces = data.debugPlaces;
            this.plnId = data.plnId;

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

              let middleY = (this.viewPort.getCanvasHeight() / 2 - this.viewPort.getYMove()) / this.viewPort.getScale();
              this.ctx.font = 'bold ' + this.viewPort.getFontSize() + 'px Ariel';
              this.ctx.fillStyle = 'black';
              this.ctx.textAlign = 'center';
              this.ctx.fillText('Trwa ładowanie..', this.middleX, middleY);
            }
        }
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

    public isClicked(e: TapInput): boolean {
        return e.x >= this.x && e.x <= this.x + this.width;
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

        if (product) {
          this.hightlightedProductPositions = [product];
          let price = _.find(this.prices, (p) => { return p.priceId === product.priceId; });
          if (!price) {
            price = _.find(this.hookPrices, (p) => { return p.priceId === product.priceId; });
          }
          this.highlightedPrice = price;

        } else {
          this.hightlightedProductPositions = null;
          this.highlightedPrice = null;
        }

        if (this.hightlightedProductPositions !== tempHighlightedProductPositions
          || this.highlightedPrice !== tempHighlightedPrice) {
          this.drawCanvas(this.canvas);
          this.segmentController.segmentLoaded({segmentId: this.id});
        }
      }
    }

    public handleMouseOut() {
        if (this.isLoaded) {
          let tempHighlightedPrice = this.highlightedPrice;
          let tempHighlightedProductPositions = this.hightlightedProductPositions;

          this.highlightedPrice = null;
          this.hightlightedProductPositions = null;

          if (this.hightlightedProductPositions !== tempHighlightedProductPositions
            || this.highlightedPrice !== tempHighlightedPrice) {
            this.drawCanvas(this.canvas);
            this.segmentController.segmentLoaded({segmentId: this.id});
          }
        }
    }
    public showProductIfClicked(e: TapInput): void {
      let product = this.getProductUnderCursor(e.x, e.y);
      if (product) {
        console.log('product cliecked: ' + product.priceId);
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

    public fitOnViewPort(y: number): void {
        let zoomScale = this.viewPort.getZoomScale();

        let canvasWidth = this.viewPort.getCanvasWidth();
        let xMove = (canvasWidth - this.width * zoomScale) / 2 - this.x * zoomScale;

        let canvasHeight = this.viewPort.getCanvasHeight();
        let yMove = canvasHeight / 2 - y * zoomScale;

        this.viewPort.animate('xMove', xMove);
        if (y !== -1) {
            this.viewPort.animate('yMove', yMove);
        }

        let scale = this.viewPort.getScale();
        if (scale !== zoomScale) {
            this.viewPort.animate('scale', zoomScale);
            this.viewPort.notifyAboutZoomChange(true);
        }
    }

    public flash(): void {
        this.flashEffect = new FlashEffect(this.ctx);
        this.segmentController.reportEffectRenderingStart();
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
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        for (let text of this.texts) {
          this.drawText(ctx, text);
        }

        for (let p of this.productPositions) {
            ctx.drawImage(this.spriteImg, p.sx, p.sy, p.w, p.h, p.dx, p.dy, p.w, p.h);
        }

        for (let price of this.prices) {
          this.drawPrice(ctx, price);
        }

        for (let price of this.hookPrices) {
          this.drawPrice(ctx, price);
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
        ctx.font = 'bold 250px Ariel';
        ctx.fillStyle = 'black';
        ctx.textAlign = 'center';
        ctx.fillText(this.plnId.toString(), this.width / 2, 600);

        this.drawHighlightedProductAndPrice(ctx);

        ctx.strokeStyle = DARK_SEGMENT_COLOR;
        ctx.lineWidth = SEGMENT_BORDER_LINE_WIDTH;
        ctx.strokeRect(0, 0, this.width, this.height);

        ctx.restore();
    }

    private drawHighlightedProductAndPrice(ctx: CanvasRenderingContext2D) {
        if (this.hightlightedProductPositions && this.highlightedPrice) {
          ctx.shadowColor = '#ffd700';
          ctx.shadowBlur = 20;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;

          for (var p of this.hightlightedProductPositions) {
            ctx.drawImage(this.spriteImg, p.sx, p.sy, p.w, p.h, p.dx, p.dy, p.w, p.h);
          }

          this.drawPrice(ctx, this.highlightedPrice);

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
      // console.log(text.value, width);
      // console.log(text.dx, text.dy + 4.5, text.dx + width, text.dy - 4.5);
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
        for (var i = this.productPositions.length - 1; i >= 0; i--) {
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
