import ISegmentPlace = require('../../src/segments/ISegmentPlace');

class MockSegmentPlace implements ISegmentPlace {
    constructor(private index: number, private x: number) {
    }

    public getIndex(): number { return this.index; }
    public getX(): number { return this.x; }
}

export = MockSegmentPlace;
