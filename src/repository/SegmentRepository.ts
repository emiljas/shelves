/// <reference path="../../typings/tsd.d.ts" />

'use strict';

export default class SegmentRepository {
  private segments = [];

  constructor() {
  }

  public getByPosition(position: number) {
    return new Promise(function(resolve, reject) {
      reject('a');
      // if(this.segments.length == 0)
      //   throw new Error('no data');
    });
  }
}
