import ShelfModel = require('./ShelfModel');
import KnownImageModel = require('./KnownImageModel');
import ImageModel = require('./ImageModel');
import ProductPositionModel = require('./ProductPositionModel');

interface SegmentModel {
  width: number;
  height: number;
  spriteImgUrl: string;
  shelves: Array<ShelfModel>;
  knownImages: Array<KnownImageModel>;
  images: Array<ImageModel>;
  productPositions: Array<ProductPositionModel>;
}

export = SegmentModel;
