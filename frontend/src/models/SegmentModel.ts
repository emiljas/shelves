import KnownImageModel = require('./KnownImageModel');
import ImageModel = require('./ImageModel');
import ProductPositionModel = require('./ProductPositionModel');
import DebugPlaceModel = require('./DebugPlaceModel');

interface SegmentModel {
  width: number;
  height: number;
  spriteImgUrl: string;
  knownImages1: Array<KnownImageModel>;
  knownImages2: Array<KnownImageModel>;
  images: Array<ImageModel>;
  productPositions: Array<ProductPositionModel>;
  debugPlaces: Array<DebugPlaceModel>;
  plnId: number;
}

export = SegmentModel;
