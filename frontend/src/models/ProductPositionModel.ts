interface ProductPositionModel {
    sx: number; //source x
    sy: number; //source y
    w: number; //width
    h: number; //height
    dx: number; //destination x
    dy: number; //destincation y
    photoUrl: string;
    photoRatio: number;
    name: string;
    ppId: number;
    productId: number;
    priceId: number;
    isRightTopCorner: boolean;
}

export = ProductPositionModel;
