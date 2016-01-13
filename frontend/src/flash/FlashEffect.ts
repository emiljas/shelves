const FLASH_EFFECT_DURATION_SEC = 1;
const FLASH_EFFECT_MAX_OPACITY = 0.4;

class FlashEffect {
  private startTimestamp: number;
  private opacity = 0;
  private seconds: number;

  constructor(private ctx: CanvasRenderingContext2D) {
  }

  public flash(timestamp: number, x: number, y: number, width: number, height: number) {
    if (!this.startTimestamp) {
      this.startTimestamp = timestamp;
    }

    this.seconds = (timestamp - this.startTimestamp) / 1000;
    this.opacity = Math.sin(this.seconds / FLASH_EFFECT_DURATION_SEC * Math.PI) * FLASH_EFFECT_MAX_OPACITY;

    this.ctx.beginPath();
    this.ctx.rect(x, y, width, height);
    this.ctx.fillStyle = 'rgba(255, 215, 0, ' + this.opacity + ')';
    this.ctx.fill();
  }

  public isEnded(): boolean {
    return this.seconds >= FLASH_EFFECT_DURATION_SEC;
  }
}

export = FlashEffect;
