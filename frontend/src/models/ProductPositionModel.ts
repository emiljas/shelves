interface ProductPositionModel {
    sx: number; //source x
    sy: number; //source y
    w: number; //width
    h: number; //height
    dx: number; //destination x
    dy: number; //destincation y
    planogramProductId: number;
    productId: number;
    priceId: number;
}

export = ProductPositionModel;
