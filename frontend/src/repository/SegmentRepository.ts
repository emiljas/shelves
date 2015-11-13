/// <reference path="../../typings/tsd.d.ts" />

'use strict';

export default class SegmentRepository {

  public getByPosition(position: number) {
    return new Promise((resolve, reject) => {
      var req = new XMLHttpRequest();
      req.addEventListener("load", (e) => {
        resolve(JSON.parse(req.responseText));
      });
      req.open("GET", "http://localhost:3000/getSegment?position=" + position);
      req.send();
    });
  }

}
