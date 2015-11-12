const express = require('express');
const request = require('request');
import parseSegmentHtmlResponse from './parseSegmentHtmlResponse';
var app = express();

app.get('/getSegment', function (req, res) {
  var url = 'http://www.rossmann.pl/DesktopModules/RossmannV4Modules/Shelves/GetSegmentHtml.ashx?json=%7B%22SegmentId%22%3A32301%2C%22Move%22%3A' + 12 + '%7D';
  request(url, (err, result, body) => {
    res.json(parseSegmentHtmlResponse(body));
  });
});

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});
