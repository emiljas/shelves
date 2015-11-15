import * as _ from 'lodash';

interface RandomPositionsArgs {
    coordsList: Array<Coords>;
    segmentWidth: number;
    segmentHeight: number;
    limit?: number;
}

export default function randomProductPositionsOnSegment(args: RandomPositionsArgs) {
    var finder = new PositionFinder(args);
    return finder.find();
}

const POSITION_FINDER_LIMIT = 10000;

class PositionFinder {
    private coordsList: Array<Coords>;
    private segmentWidth: number;
    private segmentHeight: number;
    private productPositions = [];
    private limit: number;

    constructor(args: RandomPositionsArgs) {
        this.coordsList = args.coordsList;
        this.segmentWidth = args.segmentWidth;
        this.segmentHeight = args.segmentHeight;
        this.limit = args.limit || POSITION_FINDER_LIMIT;
    }

    find(): Array<ProductPositionModel> {
        for (let coords of this.coordsList) {
            var position = this.seekForFreePlace(coords);
            this.productPositions.push(position);
        }
        return this.productPositions;
    }

    seekForFreePlace(coords: Coords) {
        var i = 0;
        var position: ProductPositionModel;
        do {
            position = this.randomPosition(coords);
        }
        while (this.collisionExists(position) && !this.isLimitReached(i++));
        return position;
    }

    isLimitReached(i: number) {
      return i + 1 == this.limit;
    }

    randomPosition(coords: Coords): ProductPositionModel {
        var dx = _.random(this.segmentWidth - coords.width);
        var dy = _.random(this.segmentHeight - coords.height);
        return {
            sx: coords.x,
            sy: coords.y,
            w: coords.width,
            h: coords.height,
            dx: dx,
            dy: dy
        };
    }

    collisionExists(position: ProductPositionModel) {
        for (let takenPosition of this.productPositions)
            if (this.isCollision(takenPosition, position))
                return true;
        return false;
    }

    isCollision(taken: ProductPositionModel, random: ProductPositionModel): boolean {
      //http://stackoverflow.com/questions/306316/determine-if-two-rectangles-overlap-each-other
        var p1x1 = taken.dx,
            p1y1 = taken.dy,
            p1x2 = taken.dx + taken.w,
            p1y2 = taken.dy + taken.h,
            p2x1 = random.dx,
            p2y1 = random.dy,
            p2x2 = random.dx + random.w,
            p2y2 = random.dy + random.h;

        return p1x1 < p2x2
            && p1x2 > p2x1
            && p1y1 < p2y2
            && p1y2 > p2y1;
    }
}
