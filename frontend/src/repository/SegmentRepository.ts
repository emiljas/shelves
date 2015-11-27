'use strict';

import Repository = require('./Repository');
import SegmentModel = require('../models/SegmentModel');

class SegmentRepository extends Repository {
    public getWidths(): Promise<Array<number>> {
        debugger;
        return this.getJson<Array<number>>('/getSegmentWidths');
    }

    public getByPosition(index: number): Promise<SegmentModel> {
        debugger;
        return this.getJson<SegmentModel>('/getSegment?index=' + index);
    }
}

export = SegmentRepository;
