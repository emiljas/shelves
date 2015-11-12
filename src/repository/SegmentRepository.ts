/// <reference path="../../typings/tsd.d.ts" />

'use strict';

export default class SegmentRepository {
  private segments = [];

  public getByPosition(position: number) {
    return Promise.resolve().then(() => {
      if(this.segments.length == 0)
        throw new Error('no data');

      return this.segments[position - 1];
    });

    // return new Promise((resolve, reject) => {
    //   // resolve(this.segments[position - 1]);
    // });
  }

  public injectSegments(segments) {
    this.segments = segments;
  }
}
