'use strict';

import Repository = require('./Repository');
import SegmentModel = require('../models/SegmentModel');

class SegmentRepository extends Repository {
    public getWidths(): Promise<Array<number>> {
        return this.getJson<Array<number>>('/shelves/segmentWidths');
    }

    public getByPosition(index: number): Promise<SegmentModel> {
        return this.getJson<SegmentModel>('/shelves/segment?index=' + index);
    }
}

export = SegmentRepository;
