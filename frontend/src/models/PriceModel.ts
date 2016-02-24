import ImageType = require('./ImageType');
import TextType = require('./TextType');

interface PriceModel {
  shelfId: number;
  productId: number;
  priceId: number;
  imageType: ImageType;
  imageDx: number;
  imageDy: number;
  textValue: string;
  textType: TextType;
  textDx: number;
  textDy: number;
  promoImageDx: number;
  promoTextType: TextType;
  promoTextDx: number;
  promoTextDy: number;
  oldTextValue: string;
  oldTextType: TextType;
  oldTextDx: number;
  oldTextDy: number;
}

export = PriceModel;
