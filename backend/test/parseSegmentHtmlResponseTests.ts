/// <reference path="../typings/tsd.d.ts" />

import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
import * as Promise from 'bluebird';
const assert = chai.assert;
const fs = <any>Promise.promisifyAll(require('fs'));
import parseSegmentHtmlResponse from '../src/parseSegmentHtmlResponse';

describe('parseSegmentHtmlResponse', () => {

  it('extracts sprite url', () => {
    var expectedSpriteImgUrl = 'http://www.ros.net.pl/RossmannV4_Shelves_Sprites/33294_b3dfd0ea88f1794198b999f19c81dd28/output.png';
    var spriteImgUrl = parseResponse().then((result) => {
      return result.spriteImgUrl;
    });
    return assert.eventually.equal(spriteImgUrl, expectedSpriteImgUrl);
  });

  it("extracts product's coords", (done) => {
    var expectedCoords = [
      { width: 131, height: 198, x: 0, y: 90 },
      { width: 125, height: 185, x: 0, y: 290 },
      { width: 108, height: 212, x: 220, y: 255 }
    ];
    parseResponse().then((result) => {
      return result.coords;
    }).then((coords) => {
      assert.deepEqual(coords[0], expectedCoords[0]);
      assert.deepEqual(coords[1], expectedCoords[1]);
      assert.deepEqual(coords[2], expectedCoords[2]);
    })
    .then(done)
    .catch(done);
  });

  function parseResponse(): Promise<any> {
    return getTestResponse().then((response) => {
      var result = parseSegmentHtmlResponse(response);
      return result;
    });
  }

  function getTestResponse(): Promise<string> {
    return fs.readFileAsync('test/SegmentHtmlResponse.html', 'utf8').then((content: string) => {
      return content;
    });
  }

});
