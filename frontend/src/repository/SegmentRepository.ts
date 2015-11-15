'use strict';

export default class SegmentRepository {

  public getByPosition(position: number): Promise<SegmentModel> {
    return new Promise<SegmentModel>((resolve, reject) => {
      var req = new XMLHttpRequest();
      req.addEventListener("load", (e) => {
        resolve(JSON.parse(req.responseText));
      });
      req.open("GET", "http://192.168.1.104:3000/getSegment?position=" + position);
      req.send();
    });
  }

}
