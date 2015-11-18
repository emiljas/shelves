'use strict';

import Repository from './Repository';

export default class SegmentRepository extends Repository {
    public getWidths(): Promise<Array<number>> {
        return this.getJson<Array<number>>('/getSegmentWidths');
    }

    public getByPosition(position: number): Promise<SegmentModel> {
        return this.getJson<SegmentModel>('/getSegment?position=' + position)
    }
}
