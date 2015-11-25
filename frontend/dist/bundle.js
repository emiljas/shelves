/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var Canvas = __webpack_require__(1);
	// import windowResize from './windowResize';
	// import touch from './touch';
	// import Segment from './Segment';
	// import enableDebug from './debug/enableDebug';
	var SegmentRepository = __webpack_require__(4);
	var segmentRepository = new SegmentRepository();
	//should be deleted when setAttribute on server side!
	var downloadSegmentWidths = segmentRepository.getWidths().then(function (widths) {
	    var canvases = document.querySelectorAll('canvas');
	    for (var i = 0; i < canvases.length; i++) {
	        var canvas = canvases[i];
	        canvas.setAttribute('data-segment-widths', JSON.stringify(widths));
	    }
	    return Promise.resolve();
	});
	downloadSegmentWidths.then(function () {
	    var canvas1 = Canvas.init('#shelvesCanvas1');
	    // windowResize();
	    // touch();
	    canvas1.start();
	    _.times(5, function () {
	        canvas1.appendSegment();
	    });
	    // Segment.prependSegment(canvas);
	    // enableDebug();
	    // let canvas2 = Canvas.init('#shelvesCanvas2');
	    // canvas2.start();
	    // _.times(5, function() {
	    //     canvas2.appendSegment();
	    // });
	    //
	    // let canvas3 = Canvas.init('#shelvesCanvas3');
	    // canvas3.start();
	    // _.times(5, function() {
	    //     canvas3.appendSegment();
	    // });
	    // const SEGMENT_RATIO_MOVE = 0.7;
	    // let backBtn = document.getElementById('backBtn');
	    // backBtn.addEventListener('click', function() {
	    //   let move = canvas.distanceToMove + canvas.canvasWidth * SEGMENT_RATIO_MOVE;
	    //   canvas.moveX(move);
	    // }, false);
	    //
	    // let nextBtn = document.getElementById('nextBtn');
	    // nextBtn.addEventListener('click', function() {
	    //   let move = canvas.distanceToMove - canvas.canvasWidth * SEGMENT_RATIO_MOVE;
	    //   canvas.moveX(move);
	    // }, false);
	});

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var Segments = __webpack_require__(2);
	var FpsMeasurer = __webpack_require__(6);
	var touch = __webpack_require__(7);
	var Canvas = (function () {
	    function Canvas() {
	        var _this = this;
	        this.scale = 0.33;
	        this.frameRequestCallback = function (timestamp) {
	            _this.loop(timestamp);
	        };
	    }
	    Canvas.init = function (canvasId) {
	        var canvas = new Canvas();
	        canvas.canvasElement = document.querySelector(canvasId);
	        canvas.canvasWidth = canvas.canvasElement.width;
	        canvas.canvasHeight = canvas.canvasElement.height;
	        canvas.ctx = canvas.canvasElement.getContext('2d');
	        canvas.timestamp = 0;
	        canvas.xMove = 0;
	        canvas.yMove = 0;
	        canvas.distanceToMove = 0;
	        canvas.segments = new Segments(canvas);
	        touch(canvas);
	        return canvas;
	    };
	    Canvas.prototype.start = function () {
	        window.requestAnimationFrame(this.frameRequestCallback);
	    };
	    Canvas.prototype.appendSegment = function () {
	        this.segments.appendSegment();
	    };
	    Canvas.prototype.moveX = function (move) {
	        this.animationTimestamp = this.timestamp;
	        this.distanceToMove = move;
	    };
	    Canvas.prototype.loop = function (timestamp) {
	        this.timestamp = timestamp;
	        this.yMove = Math.min(0, this.yMove);
	        this.yMove = Math.max(this.yMove, this.canvasHeight - this.canvasHeight * (this.scale / 0.33));
	        this.ctx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
	        if (!isNearZeroPx(this.distanceToMove)) {
	            var secondsFromAnimationStart = (this.timestamp - this.animationTimestamp) / 1000;
	            var xMovePerFrame = Math.sin(secondsFromAnimationStart) * this.distanceToMove;
	            this.xMove += xMovePerFrame;
	            this.distanceToMove -= xMovePerFrame;
	        }
	        this.ctx.save();
	        this.ctx.translate(this.xMove, this.yMove);
	        this.ctx.scale(this.scale, this.scale);
	        this.segments.draw();
	        this.ctx.restore();
	        this.lastTimestamp = timestamp;
	        FpsMeasurer.instance.tick(timestamp);
	        window.requestAnimationFrame(this.frameRequestCallback);
	    };
	    ;
	    return Canvas;
	})();
	var DIFF = 0.5;
	function isNearZeroPx(value) {
	    'use strict';

	    return Math.abs(value) < DIFF;
	}
	module.exports = Canvas;

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var SegmentPrepender = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./append/SegmentPrepender\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	var SegmentAppender = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./append/SegmentAppender\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	var Segments = (function () {
	    function Segments(canvas) {
	        this.segments = new Array();
	        this.canvas = canvas;
	        this.segmentWidths = JSON.parse(canvas.canvasElement.getAttribute('data-segment-widths'));
	        this.prepender = new SegmentPrepender(this.segmentWidths);
	        this.appender = new SegmentAppender(this.segmentWidths);
	    }
	    Segments.prototype.draw = function () {
	        for (var _i = 0, _a = this.segments; _i < _a.length; _i++) {
	            var segment = _a[_i];
	            segment.draw();
	        }
	        this.preloadSegments();
	    };
	    Segments.prototype.preloadSegments = function () {
	        // this.appender.append();
	        // if (this.canvas.xMove * 3 + this.backX > 0) {
	        //     this.prependSegment();
	        // }
	        //
	        // if (this.canvas.xMove * 3 - this.canvas.canvasWidth * 3 + this.frontX < 0) {
	        //     this.appendSegment();
	        // }
	    };
	    Segments.prototype.appendSegment = function () {
	        this.appender.append();
	    };
	    return Segments;
	})();
	module.exports = Segments;

/***/ },
/* 3 */,
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var __extends = undefined && undefined.__extends || function (d, b) {
	    for (var p in b) {
	        if (b.hasOwnProperty(p)) d[p] = b[p];
	    }function __() {
	        this.constructor = d;
	    }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Repository = __webpack_require__(5);
	var SegmentRepository = (function (_super) {
	    __extends(SegmentRepository, _super);
	    function SegmentRepository() {
	        _super.apply(this, arguments);
	    }
	    SegmentRepository.prototype.getWidths = function () {
	        return this.getJson('/getSegmentWidths');
	    };
	    SegmentRepository.prototype.getByPosition = function (index) {
	        return this.getJson('/getSegment?index=' + index);
	    };
	    return SegmentRepository;
	})(Repository);
	module.exports = SegmentRepository;

/***/ },
/* 5 */
/***/ function(module, exports) {

	'use strict';

	var SERVER_URL = 'http://localhost:3000';
	var Repository = (function () {
	    function Repository() {}
	    Repository.prototype.getJson = function (url) {
	        return new Promise(function (resolve, reject) {
	            var req = new XMLHttpRequest();
	            req.onload = function (e) {
	                if (req.status === 200) {
	                    resolve(JSON.parse(req.responseText));
	                } else {
	                    reject({
	                        status: req.status,
	                        message: req.responseText
	                    });
	                }
	            };
	            req.open('get', SERVER_URL + url, true);
	            req.send();
	        });
	    };
	    return Repository;
	})();
	module.exports = Repository;

/***/ },
/* 6 */
/***/ function(module, exports) {

	'use strict';

	var FpsMeasurer = (function () {
	    function FpsMeasurer() {
	        this.elapsed = 0;
	        this.last = null;
	    }
	    Object.defineProperty(FpsMeasurer, "instance", {
	        get: function get() {
	            if (!this._instance) {
	                this._instance = new FpsMeasurer();
	            }
	            return this._instance;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    FpsMeasurer.prototype.tick = function (now) {
	        this.elapsed = (now - (this.last || now)) / 1000;
	        this.last = now;
	    };
	    FpsMeasurer.prototype.get = function () {
	        return Math.round(1 / this.elapsed);
	    };
	    return FpsMeasurer;
	})();
	module.exports = FpsMeasurer;

/***/ },
/* 7 */
/***/ function(module, exports) {

	'use strict';

	function touch(canvas) {
	    'use strict';

	    var hammer = new Hammer(canvas.canvasElement, {
	        touchAction: 'none'
	    });
	    hammer.get('pan').set({ direction: Hammer.DIRECTION_ALL });
	    var lastDeltaX = 0;
	    var lastDeltaY = 0;
	    hammer.on('pan', function (e) {
	        canvas.xMove += e.deltaX - lastDeltaX;
	        lastDeltaX = e.deltaX;
	        canvas.yMove += e.deltaY - lastDeltaY;
	        lastDeltaY = e.deltaY;
	    });
	    hammer.on('panend', function (e) {
	        lastDeltaX = 0;
	        lastDeltaY = 0;
	    });
	    hammer.on('tap', function () {
	        if (canvas.scale === 0.33) {
	            canvas.scale = 1;
	        } else {
	            canvas.scale = 0.33;
	        }
	    });
	}
	module.exports = touch;

/***/ }
/******/ ]);