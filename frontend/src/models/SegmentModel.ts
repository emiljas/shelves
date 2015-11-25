import ProductPositionModel = require('./ProductPositionModel');

interface SegmentModel {
  width: number;
  height: number;
  spriteImgUrl: string;
  productPositions: Array<ProductPositionModel>;
}

export = SegmentModel;
