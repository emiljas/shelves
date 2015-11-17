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

app.get('/getSegment', function (req, res) {
  var position = req.query.position;
  var url = 'http://www.rossmann.pl/DesktopModules/RossmannV4Modules/Shelves/GetSegmentHtml.ashx?json=%7B%22SegmentId%22%3A32301%2C%22Move%22%3A' + position + '%7D';
  request(url, (err, result, body) => {
    var segmentHtmlResponse = parseSegmentHtmlResponse(body);
    var segmentWidth = (position % 3 == 0) ? 400 : 930;
    var segmentHeight = 1920;
    var productPositions = randomProductPositionsOnSegment({
      coordsList: segmentHtmlResponse.coordsList,
      segmentWidth: segmentWidth,
      segmentHeight: segmentHeight
    });

    var response: SegmentModel = {
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
