class QueryString {
  public IsPlanogramIdSetUp: boolean;
  public PlanogramId: number;

  public IsSegmentIdSetUp: boolean;
  public SegmentId: number;

  public IsProductIdSetUp: boolean;
  public ProductId: number;

  private container: HTMLDivElement;

  constructor(private containerOrSegmentId: HTMLDivElement | number) {
    if (typeof(containerOrSegmentId) === 'number') {
      let segmentId = <number>containerOrSegmentId;

      this.IsPlanogramIdSetUp = false;
      this.IsSegmentIdSetUp = true;
      this.SegmentId = segmentId;
      this.IsProductIdSetUp = false;
    } else {
      this.container = <HTMLDivElement>containerOrSegmentId;

      this.IsPlanogramIdSetUp = this.getBoolAttr('data-is-planogram-id-set-up');
      this.PlanogramId = this.getIntAttr('data-planogram-id');

      this.IsSegmentIdSetUp = this.getBoolAttr('data-is-segment-id-set-up');
      this.SegmentId = this.getIntAttr('data-segment-id');

      this.IsProductIdSetUp = this.getBoolAttr('data-is-product-id-set-up');
      this.ProductId = this.getIntAttr('data-product-id');
    }
  }

  private getBoolAttr(key: string) {
    let value = this.container.getAttribute(key);
    return value === 'True';
  }

  private getIntAttr(key: string) {
    let value = this.container.getAttribute(key);
    return parseInt(value, 10);
  }
}

export = QueryString;
