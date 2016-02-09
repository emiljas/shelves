import ImageType = require('./ImageType');

interface KnownImageModel {
    type: ImageType;
    repeat: boolean;
    w: number; //width
    h: number; //height
    dx: number; //destination x
    dy: number; //destincation y
}

export = KnownImageModel;
