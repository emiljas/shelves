const PADDING = 4;

const PRELOADER_WIDTH = 160;
const PRELOADER_HEIGHT = 130;
const PRELOADER_WIDGET_CENTER_X = PRELOADER_WIDTH / 2;
const PRELOADER_WIDGET_CENTER_Y = 45;
const PRELOADER_TEXT_Y = 105;
const PRELOADER_TEXT = 'Proszę czekać...';
const PRELOADER_WIDGET_R = 19;
const COS_45 = Math.cos(Math.PI / 4);
const STEP_DURATION = 100;

const CIRCLE_COUNT = 8;
const CIRCLE_RADIUS = 3;
const XXL_CIRCLE_RADIUS = 6;
const XL_CIRCLE_RADIUS = 5;
const L_CIRCLE_RADIUS = 4;

const BORDER_CURVE_R = 5;

class Preloader {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private scale: number;
  private fontFillStyle: string;
  private lastStepTime: number;
  private rotateIndex = 0;

  private circleRadius: number;
  private lCircleRadius: number;
  private xlCircleRadius: number;
  private xxlCircleRadius: number;
  private preloaderWidgetR: number;
  private preloaderWidgetCenterX: number;
  private preloaderWidgetCenterY: number;
  private preloaderTextY: number;
  private preloaderWidth: number;
  private preloaderHeight: number;
  private padding: number;
  private borderCurveR: number;

  public getCanvas(): HTMLCanvasElement { return this.canvas; }

  constructor(width: number) {
    this.scale = width / PRELOADER_WIDTH;
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');

    this.circleRadius = CIRCLE_RADIUS * this.scale;
    this.lCircleRadius = L_CIRCLE_RADIUS * this.scale;
    this.xlCircleRadius = XL_CIRCLE_RADIUS * this.scale;
    this.xxlCircleRadius = XXL_CIRCLE_RADIUS * this.scale;
    this.preloaderWidgetR = PRELOADER_WIDGET_R * this.scale;
    this.preloaderWidgetCenterX = PRELOADER_WIDGET_CENTER_X * this.scale;
    this.preloaderWidgetCenterY = PRELOADER_WIDGET_CENTER_Y * this.scale;
    this.preloaderTextY = PRELOADER_TEXT_Y * this.scale;
    this.preloaderWidth = PRELOADER_WIDTH * this.scale;
    this.preloaderHeight = PRELOADER_HEIGHT * this.scale;
    this.padding = PADDING * this.scale;
    this.borderCurveR = BORDER_CURVE_R * this.scale;

    this.canvas.width = this.preloaderWidth;
    this.canvas.height = this.preloaderHeight;
    this.fontFillStyle = this.calculateFontFillStyle();

    this.drawBackground();
    this.drawText();
  }

  public handleAnimationFrame(time: number): boolean {
    if (!this.lastStepTime || time - this.lastStepTime > STEP_DURATION) {
      this.lastStepTime = time;
    } else {
      return false;
    }

    this.ctx.fillStyle = 'white';
    this.ctx.fillRect(
      this.preloaderWidgetCenterX - this.preloaderWidgetR - 2 * this.xxlCircleRadius,
      this.preloaderWidgetCenterY - this.preloaderWidgetR - 2 * this.xxlCircleRadius,
      2 * this.preloaderWidgetR + 4 * this.xxlCircleRadius,
      2 * this.preloaderWidgetR + 4 * this.xxlCircleRadius
    );

    this.ctx.translate(this.preloaderWidgetCenterX, this.preloaderWidgetCenterY);
    this.ctx.rotate(this.rotateIndex * (Math.PI / 4));

    let d = this.drawCircleRelativeToPreloaderCenter.bind(this);

    d(0                               , -this.preloaderWidgetR          , this.lCircleRadius);
    d(this.preloaderWidgetR * COS_45  , -this.preloaderWidgetR * COS_45 , this.xlCircleRadius);
    d(this.preloaderWidgetR           , 0                               , this.xxlCircleRadius);
    d(this.preloaderWidgetR * COS_45  , this.preloaderWidgetR * COS_45  , this.circleRadius);
    d(0                               , this.preloaderWidgetR           , this.circleRadius);
    d(-this.preloaderWidgetR * COS_45 , this.preloaderWidgetR * COS_45  , this.circleRadius);
    d(-this.preloaderWidgetR          , 0                               , this.circleRadius);
    d(-this.preloaderWidgetR * COS_45 , -this.preloaderWidgetR * COS_45 , this.circleRadius);

    this.ctx.rotate(-this.rotateIndex * (Math.PI / 4));

    if (this.rotateIndex === CIRCLE_COUNT - 1) {
      this.rotateIndex = 0;
    } else {
      this.rotateIndex++;
    }
    this.ctx.translate(-this.preloaderWidgetCenterX, -this.preloaderWidgetCenterY);

    return true;
  }

  private drawBackground(): void {
    let dx = this.padding;
    let dy = this.padding;
    let w = this.preloaderWidth - 2 * this.padding;
    let h = this.preloaderHeight - 2 * this.padding;

    this.ctx.shadowColor = 'black';
    this.ctx.shadowBlur = this.padding * 0.5;
    this.ctx.shadowOffsetX = 0;
    this.ctx.shadowOffsetY = 0;

    this.ctx.fillStyle = 'white';
    this.ctx.beginPath();
    this.ctx.moveTo(dx + this.borderCurveR, dy);
    this.ctx.lineTo(dx + w - this.borderCurveR, dy);
    this.ctx.quadraticCurveTo(dx + w, dy, dx + w, dy + this.borderCurveR);
    this.ctx.lineTo(dx + w, dy + h - this.borderCurveR);
    this.ctx.quadraticCurveTo(dx + w, dy + h, dx + w - this.borderCurveR, dy + h);
    this.ctx.lineTo(dx + this.borderCurveR, dy + h);
    this.ctx.quadraticCurveTo(dx, dy + h, dx, dy + h - this.borderCurveR);
    this.ctx.lineTo(dx, dy + this.borderCurveR);
    this.ctx.quadraticCurveTo(dx, dy, dx + this.borderCurveR, dy);
    this.ctx.closePath();
    this.ctx.fill();

    this.ctx.shadowBlur = 0;
  }

  private drawText(): void {
    this.ctx.font = this.fontFillStyle;
    this.ctx.fillStyle = 'black';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(PRELOADER_TEXT, this.preloaderWidth / 2, this.preloaderTextY);
  }

  private drawCircleRelativeToPreloaderCenter(x: number, y: number, r: number) {
    this.ctx.beginPath();
    this.ctx.arc(x, y, r, 0, 2 * Math.PI);
    this.ctx.fillStyle = 'red';
    this.ctx.fill();
    this.ctx.closePath();
  }

  private calculateFontFillStyle(): string {
    let fontSize = 16;
    do {
      this.ctx.font = 'bold ' + fontSize + 'px Ariel';
      if (this.ctx.measureText(PRELOADER_TEXT).width < this.preloaderWidth) {
        break;
      }
      fontSize--;
    } while (fontSize > 0);

    return this.ctx.font;
  }
}

export = Preloader;
