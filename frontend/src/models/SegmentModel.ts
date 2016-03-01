import KnownImageModel = require('./KnownImageModel');
import HeaderTitleFrameModel = require('./HeaderTitleFrameModel');
import PriceModel = require('./PriceModel');
import TextModel = require('./TextModel');
import ImageModel = require('./ImageModel');
import ProductPositionModel = require('./ProductPositionModel');
import DebugPlaceModel = require('./DebugPlaceModel');

interface SegmentModel {
  width: number;
  height: number;
  spriteImgUrl: string;
  knownImages1: Array<KnownImageModel>;
  knownImages2: Array<KnownImageModel>;
  headerTitleFrames: Array<HeaderTitleFrameModel>;
  prices: Array<PriceModel>;
  hookPrices: Array<PriceModel>;
  texts: Array<TextModel>;
  images: Array<ImageModel>;
  productPositions: Array<ProductPositionModel>;
  debugPlaces: Array<DebugPlaceModel>;
  plnId: number;
  planogramUrl: string;
  seoTitle: string;
}

export = SegmentModel;
