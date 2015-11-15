import ut from './UnitTestUtils';
import * as Promise from 'bluebird';
const fs = <any>Promise.promisifyAll(require('fs'));
import parseSegmentHtmlResponse from '../src/parseSegmentHtmlResponse';

describe('parseSegmentHtmlResponse', () => {

  it('extracts sprite url', () => {
    var expectedSpriteImgUrl = 'http://www.ros.net.pl/RossmannV4_Shelves_Sprites/33294_b3dfd0ea88f1794198b999f19c81dd28/output.png';
    var spriteImgUrl = parseResponse().then((result) => {
      return result.spriteImgUrl;
    });
    return ut.assert.eventually.equal(spriteImgUrl, expectedSpriteImgUrl);
  });

  it("extracts product's coords", (done) => {
    var expectedCoords = [
      { width: 1, height: 2, x: 3, y: 4 },
      { width: 5, height: 6, x: 7, y: 8 },
      { width: 9, height: 10, x: 11, y: 12 }
    ];
    parseResponse().then((result) => {
      return result.coordsList;
    }).then((coordsList) => {
      ut.assert.deepEqual(coordsList[0], expectedCoords[0]);
      ut.assert.deepEqual(coordsList[1], expectedCoords[1]);
      ut.assert.deepEqual(coordsList[2], expectedCoords[2]);
    })
    .then(done)
    .catch(done);
  });

  function parseResponse(): Promise<SegmentHtmlResponseData> {
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
