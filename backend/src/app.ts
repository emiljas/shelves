import * as express from 'express';
import * as request from 'request';
import * as _ from 'lodash';
import parseSegmentHtmlResponse from './parseSegmentHtmlResponse';
import randomProductPositionsOnSegment from './randomProductPositionsOnSegment';

var app = express();

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

const MAX_POSITION = 300;
var segmentWidths = [];
for(var index = 0; index < MAX_POSITION - 1; index++) {
  segmentWidths.push((index % 3 == 0) ? 400 : 930);
}

app.get('/getSegmentWidths', function (req, res) {
  res.json(segmentWidths);
});

app.get('/getSegment', function (req, res) {
  let index = req.query.index;

  if(index < 0 || index > MAX_POSITION - 1)
    throw "invalid argument: position";

  let url = 'http://www.rossmann.pl/DesktopModules/RossmannV4Modules/Shelves/GetSegmentHtml.ashx?json=%7B%22SegmentId%22%3A32301%2C%22Move%22%3A' + (index + 1) + '%7D';
  request(url, (err, result, body) => {
    let segmentHtmlResponse = parseSegmentHtmlResponse(body);
    let segmentWidth = segmentWidths[index];
    console.log(segmentWidth);
    let segmentHeight = 1920;
    let productPositions = randomProductPositionsOnSegment({
      coordsList: segmentHtmlResponse.coordsList,
      segmentWidth: segmentWidth,
      segmentHeight: segmentHeight
    });

    let response: SegmentModel = {
      width: segmentWidth,
      height: segmentHeight,
      spriteImgUrl: segmentHtmlResponse.spriteImgUrl,
      productPositions: productPositions
    };
    res.json(response);
  });
});

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});
