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

let lastModified = addDays(new Date(), -1);
let expires = addDays(new Date(), 1);

app.get('/DesktopModules/RossmannV4Modules/Shelves2/ImageProxy.ashx', function(req, res) {
    res.setHeader('Last-Modified', lastModified.toUTCString());
    res.setHeader('Expires', expires.toUTCString());
    let url = req.query.src;
    let picReq = request(url);
    picReq.on('error', function() {
    });
    req.pipe(picReq, () => { console.log("HERE"); }).pipe(res);
});

const MAX_POSITION = 300;
var segmentWidths = [];
for (var index = 0; index < MAX_POSITION - 1; index++) {
    segmentWidths.push((index % 3 === 0) ? 400 : 930);
}

app.get('/shelves/segmentWidths', function(req, res) {
    res.setHeader('Last-Modified', lastModified.toUTCString());
    res.setHeader('Expires', expires.toUTCString());
    res.send(JSON.stringify(segmentWidths));
});

app.get('/shelves/segment', function(req, res) {
    let index = req.query.index;

    if (index < 0 || index > MAX_POSITION - 1)
        throw "invalid argument: position";

    let url = 'http://www.rossmann.pl/DesktopModules/RossmannV4Modules/Shelves/GetSegmentHtml.ashx?json=%7B%22SegmentId%22%3A34516%2C%22Move%22%3A' + index + '%7D';
    request(url, (err, result, body) => {
        if (err) {
            console.log(err);
        }
        if (body) {
            let segmentHtmlResponse = parseSegmentHtmlResponse(body);
            let segmentWidth = segmentWidths[index];
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

            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Last-Modified', lastModified.toUTCString());
            res.setHeader('Expires', expires.toUTCString());
            res.send(JSON.stringify(response));
        }
    });
});

function addDays(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

var server = app.listen(3000, function() {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
});
