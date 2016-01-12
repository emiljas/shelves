'use strict';

import Repository = require('./Repository');
import SegmentModel = require('../models/SegmentModel');
import SegmentWidthModel = require('../models/SegmentWidthModel');

class SegmentRepository extends Repository {
    public getWidths(): Promise<Array<SegmentWidthModel>> {
        return this.getJson<Array<SegmentWidthModel>>('/DesktopModules/RossmannV4Modules/Shelves2/GetSegmentWidths.ashx');
    }

    public getById(id: number): Promise<SegmentModel> {
        return this.getJson<SegmentModel>('/DesktopModules/RossmannV4Modules/Shelves2/GetSegment.ashx?id=' + id);
    }
}

export = SegmentRepository;
