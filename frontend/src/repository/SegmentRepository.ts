'use strict';

import Repository = require('./Repository');

class SegmentRepository extends Repository {
    public getWidths(): Promise<Array<number>> {
        return this.getJson<Array<number>>('/getSegmentWidths');
    }

    public getByPosition(index: number): Promise<SegmentModel> {
        return this.getJson<SegmentModel>('/getSegment?index=' + index);
    }
}

export = SegmentRepository;
