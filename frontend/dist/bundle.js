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

	var ViewPort = __webpack_require__(1);
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
	    var viewPort1 = ViewPort.init('#shelvesCanvas1');
	    // windowResize();
	    // touch();
	    viewPort1.start();
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
	    var backBtn = document.getElementById('backBtn');
	    backBtn.addEventListener('click', function () {
	        viewPort1.slideLeft();
	    }, false);
	    var nextBtn = document.getElementById('nextBtn');
	    nextBtn.addEventListener('click', function () {
	        viewPort1.slideRight();
	    }, false);
	});

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var Segments = __webpack_require__(2);
	var FpsMeasurer = __webpack_require__(8);
	var touch = __webpack_require__(9);
	var ViewPort = (function () {
	    function ViewPort() {
	        var _this = this;
	        this.scale = 0.33;
	        this.frameRequestCallback = function (timestamp) {
	            _this.loop(timestamp);
	        };
	    }
	    ViewPort.init = function (canvasId) {
	        var viewPort = new ViewPort();
	        viewPort.canvas = document.querySelector(canvasId);
	        viewPort.width = viewPort.canvas.width;
	        viewPort.height = viewPort.canvas.height;
	        viewPort.ctx = viewPort.canvas.getContext('2d');
	        viewPort.timestamp = 0;
	        viewPort.xMove = 0;
	        viewPort.yMove = 0;
	        viewPort.distanceToMove = 0;
	        viewPort.segments = new Segments(viewPort);
	        touch(viewPort);
	        return viewPort;
	    };
	    ViewPort.prototype.getCanvas = function () {
	        return this.canvas;
	    };
	    ViewPort.prototype.getCanvasContext = function () {
	        return this.ctx;
	    };
	    ViewPort.prototype.getWidth = function () {
	        return this.width;
	    };
	    ViewPort.prototype.getXMove = function () {
	        return this.xMove;
	    };
	    ViewPort.prototype.setXMove = function (value) {
	        this.xMove = value;
	    };
	    ViewPort.prototype.getYMove = function () {
	        return this.yMove;
	    };
	    ViewPort.prototype.setYMove = function (value) {
	        this.yMove = value;
	    };
	    ViewPort.prototype.getScale = function () {
	        return this.scale;
	    };
	    ViewPort.prototype.setScale = function (value) {
	        this.scale = value;
	    };
	    ViewPort.prototype.start = function () {
	        window.requestAnimationFrame(this.frameRequestCallback);
	    };
	    ViewPort.prototype.slideLeft = function () {
	        var SEGMENT_RATIO_MOVE = 0.7;
	        var move = this.distanceToMove + this.width * SEGMENT_RATIO_MOVE;
	        this.moveX(move);
	    };
	    ViewPort.prototype.slideRight = function () {
	        var SEGMENT_RATIO_MOVE = 0.7;
	        var move = this.distanceToMove - this.width * SEGMENT_RATIO_MOVE;
	        this.moveX(move);
	    };
	    ViewPort.prototype.moveX = function (move) {
	        this.animationTimestamp = this.timestamp;
	        this.distanceToMove = move;
	    };
	    ViewPort.prototype.loop = function (timestamp) {
	        this.timestamp = timestamp;
	        this.yMove = Math.min(0, this.yMove);
	        this.yMove = Math.max(this.yMove, this.height - this.height * (this.scale / 0.33));
	        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	        this.slideIfNecessary();
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
	    ViewPort.prototype.slideIfNecessary = function () {
	        if (!isNearZeroPx(this.distanceToMove)) {
	            var secondsFromAnimationStart = (this.timestamp - this.animationTimestamp) / 1000;
	            var xMovePerFrame = Math.sin(secondsFromAnimationStart) * this.distanceToMove;
	            this.xMove += xMovePerFrame;
	            this.distanceToMove -= xMovePerFrame;
	        }
	    };
	    return ViewPort;
	})();
	var DIFF = 0.5;
	function isNearZeroPx(value) {
	    'use strict';

	    return Math.abs(value) < DIFF;
	}
	module.exports = ViewPort;

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var Segment = __webpack_require__(3);
	var SegmentPrepender = __webpack_require__(6);
	var SegmentAppender = __webpack_require__(7);
	var Segments = (function () {
	    function Segments(viewPort) {
	        this.segments = new Array();
	        this.viewPort = viewPort;
	        this.segmentWidths = JSON.parse(viewPort.getCanvas().getAttribute('data-segment-widths'));
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
	        var xMove = this.viewPort.getXMove();
	        var canvasWidth = this.viewPort.getWidth();
	        if (this.prepender.shouldPrepend(xMove)) {
	            var result = this.prepender.prepend();
	            this.addSegment(result);
	            console.log('prepend');
	        }
	        if (this.appender.shouldAppend(xMove, canvasWidth)) {
	            var result = this.appender.append();
	            this.addSegment(result);
	            console.log('append');
	        }
	    };
	    Segments.prototype.addSegment = function (result) {
	        var segment = new Segment(this.viewPort, result.index, result.x);
	        this.segments.push(segment);
	    };
	    return Segments;
	})();
	module.exports = Segments;

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var SegmentRepository = __webpack_require__(4);
	var segmentRepository = new SegmentRepository();
	var Segment = (function () {
	    function Segment(viewPort, index, x) {
	        this.isLoaded = false;
	        this.index = index;
	        this.viewPort = viewPort;
	        this.ctx = viewPort.getCanvasContext();
	        this.x = x;
	        this.load(this);
	    }
	    Segment.prototype.load = function (segment) {
	        var _this = this;
	        segmentRepository.getByPosition(this.index).then(function (data) {
	            _this.width = data.width;
	            _this.height = data.height;
	            _this.productPositions = data.productPositions;
	            return loadImage(data.spriteImgUrl);
	        }).then(function (img) {
	            segment.spriteImg = img;
	            segment.isLoaded = true;
	        });
	    };
	    Segment.prototype.draw = function () {
	        if (this.isLoaded) {
	            this.ctx.beginPath();
	            this.ctx.lineWidth = 20;
	            this.ctx.moveTo(this.x, 0);
	            this.ctx.lineTo(this.x + this.width, 0);
	            this.ctx.lineTo(this.x + this.width, this.height);
	            this.ctx.lineTo(this.x, this.height);
	            this.ctx.lineTo(this.x, 0);
	            this.ctx.stroke();
	            var spriteImg = this.spriteImg;
	            var positions = this.productPositions;
	            for (var _i = 0; _i < positions.length; _i++) {
	                var p = positions[_i];
	                if (p.h !== 0) {
	                    this.ctx.drawImage(spriteImg, p.sx, p.sy, p.w, p.h, p.dx + this.x, p.dy, p.w, p.h);
	                }
	            }
	        }
	    };
	    return Segment;
	})();
	function loadImage(url) {
	    'use strict';

	    return new Promise(function (resolve, reject) {
	        var img = new Image();
	        img.src = url;
	        img.addEventListener('load', function () {
	            resolve(img);
	        });
	        img.addEventListener('error', function (e) {
	            reject(e);
	        });
	    });
	}
	module.exports = Segment;

/***/ },
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

	"use strict";

	var SegmentPrepender = (function () {
	    function SegmentPrepender(segmentWidths) {
	        this.currentIndex = 0;
	        this.currentX = 0;
	        this.segmentWidths = segmentWidths;
	        this.segmentCount = segmentWidths.length;
	    }
	    SegmentPrepender.prototype.shouldPrepend = function (xMove) {
	        return xMove * 3 + this.currentX > 0;
	    };
	    SegmentPrepender.prototype.prepend = function () {
	        this.currentIndex = this.getLastIndexIfBelowZero(this.currentIndex - 1);
	        var segmentWidth = this.segmentWidths[this.currentIndex];
	        this.currentX -= segmentWidth;
	        return { index: this.currentIndex, x: this.currentX };
	    };
	    SegmentPrepender.prototype.getLastIndexIfBelowZero = function (index) {
	        if (index === -1) {
	            return this.segmentCount - 1;
	        } else {
	            return index;
	        }
	    };
	    return SegmentPrepender;
	})();
	module.exports = SegmentPrepender;

/***/ },
/* 7 */
/***/ function(module, exports) {

	"use strict";

	var SegmentAppender = (function () {
	    function SegmentAppender(segmentWidths) {
	        this.nextIndex = 0;
	        this.nextX = 0;
	        this.segmentWidths = segmentWidths;
	        this.segmentCount = segmentWidths.length;
	    }
	    SegmentAppender.prototype.shouldAppend = function (xMove, canvasWidth) {
	        return xMove * 3 - canvasWidth * 3 + this.nextX < 0;
	    };
	    SegmentAppender.prototype.append = function () {
	        this.nextIndex = this.getZeroIndexIfUnderLast(this.nextIndex);
	        var result = { index: this.nextIndex, x: this.nextX };
	        var segmentWidth = this.segmentWidths[this.nextIndex];
	        this.nextX += segmentWidth;
	        this.nextIndex++;
	        return result;
	    };
	    SegmentAppender.prototype.getZeroIndexIfUnderLast = function (index) {
	        if (index === this.segmentCount) {
	            return 0;
	        } else {
	            return index;
	        }
	    };
	    return SegmentAppender;
	})();
	module.exports = SegmentAppender;

/***/ },
/* 8 */
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
/* 9 */
/***/ function(module, exports) {

	'use strict';

	function touch(viewPort) {
	    'use strict';

	    var hammer = new Hammer(viewPort.getCanvas(), {
	        touchAction: 'none'
	    });
	    hammer.get('pan').set({ direction: Hammer.DIRECTION_ALL });
	    var lastDeltaX = 0;
	    var lastDeltaY = 0;
	    hammer.on('pan', function (e) {
	        viewPort.setXMove(viewPort.getXMove() + e.deltaX - lastDeltaX);
	        lastDeltaX = e.deltaX;
	        viewPort.setYMove(viewPort.getYMove() + e.deltaY - lastDeltaY);
	        lastDeltaY = e.deltaY;
	    });
	    hammer.on('panend', function (e) {
	        lastDeltaX = 0;
	        lastDeltaY = 0;
	    });
	    hammer.on('tap', function () {
	        if (viewPort.getScale() === 0.33) {
	            viewPort.setScale(1);
	        } else {
	            viewPort.setScale(0.33);
	        }
	    });
	}
	module.exports = touch;

/***/ }
/******/ ]);