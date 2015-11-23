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

	var _Canvas = __webpack_require__(1);

	var _Canvas2 = _interopRequireDefault(_Canvas);

	var _SegmentRepository = __webpack_require__(4);

	var _SegmentRepository2 = _interopRequireDefault(_SegmentRepository);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var segmentRepository = new _SegmentRepository2.default();
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
	    var canvas1 = _Canvas2.default.init('#shelvesCanvas1');
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

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _Segments = __webpack_require__(2);

	var _Segments2 = _interopRequireDefault(_Segments);

	var _FpsMeasurer = __webpack_require__(6);

	var _FpsMeasurer2 = _interopRequireDefault(_FpsMeasurer);

	var _touch = __webpack_require__(7);

	var _touch2 = _interopRequireDefault(_touch);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Canvas = (function () {
	    function Canvas() {
	        var _this = this;

	        _classCallCheck(this, Canvas);

	        this.scale = 0.33;
	        this.frameRequestCallback = function (timestamp) {
	            _this.loop(timestamp);
	        };
	    }

	    _createClass(Canvas, [{
	        key: 'start',
	        value: function start() {
	            window.requestAnimationFrame(this.frameRequestCallback);
	        }
	    }, {
	        key: 'appendSegment',
	        value: function appendSegment() {
	            this.segments.appendSegment();
	        }
	    }, {
	        key: 'moveX',
	        value: function moveX(move) {
	            this.animationTimestamp = this.timestamp;
	            this.distanceToMove = move;
	        }
	    }, {
	        key: 'loop',
	        value: function loop(timestamp) {
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
	            _FpsMeasurer2.default.instance.tick(timestamp);
	            window.requestAnimationFrame(this.frameRequestCallback);
	        }
	    }], [{
	        key: 'init',
	        value: function init(canvasId) {
	            var canvas = new Canvas();
	            canvas.canvasElement = document.querySelector(canvasId);
	            canvas.canvasWidth = canvas.canvasElement.width;
	            canvas.canvasHeight = canvas.canvasElement.height;
	            canvas.ctx = canvas.canvasElement.getContext('2d');
	            canvas.timestamp = 0;
	            canvas.xMove = 0;
	            canvas.yMove = 0;
	            canvas.distanceToMove = 0;
	            canvas.segments = new _Segments2.default(canvas);
	            (0, _touch2.default)(canvas);
	            return canvas;
	        }
	    }]);

	    return Canvas;
	})();

	exports.default = Canvas;

	var DIFF = 0.5;
	function isNearZeroPx(value) {
	    'use strict';

	    return Math.abs(value) < DIFF;
	}

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _Segment = __webpack_require__(3);

	var _Segment2 = _interopRequireDefault(_Segment);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var SPACE_BETWEEN_SEGMENTS = 50;

	var Segments = (function () {
	    function Segments(canvas) {
	        _classCallCheck(this, Segments);

	        this.segments = new Array();
	        this.backPosition = 0;
	        this.backX = 0;
	        this.frontPosition = 0;
	        this.frontX = 0;
	        this.canvas = canvas;
	        console.log(_Segment2.default);
	        this.segmentWidths = JSON.parse(canvas.canvasElement.getAttribute('data-segment-widths'));
	        this.segmentCount = this.segmentWidths.length;
	    }

	    _createClass(Segments, [{
	        key: 'draw',
	        value: function draw() {
	            var _iteratorNormalCompletion = true;
	            var _didIteratorError = false;
	            var _iteratorError = undefined;

	            try {
	                for (var _iterator = this.segments[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	                    var segment = _step.value;

	                    segment.draw();
	                }
	            } catch (err) {
	                _didIteratorError = true;
	                _iteratorError = err;
	            } finally {
	                try {
	                    if (!_iteratorNormalCompletion && _iterator.return) {
	                        _iterator.return();
	                    }
	                } finally {
	                    if (_didIteratorError) {
	                        throw _iteratorError;
	                    }
	                }
	            }

	            this.preloadSegments();
	        }
	    }, {
	        key: 'preloadSegments',
	        value: function preloadSegments() {
	            if (this.canvas.xMove * 3 + this.backX > 0) {
	                this.prependSegment();
	            }
	            if (this.canvas.xMove * 3 - this.canvas.canvasWidth * 3 + this.frontX < 0) {
	                this.appendSegment();
	            }
	        }
	    }, {
	        key: 'prependSegment',
	        value: function prependSegment() {
	            this.backPosition = this.getLastIndexIfBelowZero(this.backPosition - 1);
	            var index = this.backPosition;
	            var segmentWidth = this.segmentWidths[index];
	            this.backX -= segmentWidth + SPACE_BETWEEN_SEGMENTS;
	            var segment = new _Segment2.default(this.canvas, index, this.backX);
	            this.segments.push(segment);
	            segment.load(segment);
	        }
	    }, {
	        key: 'appendSegment',
	        value: function appendSegment() {
	            this.frontPosition = this.getZeroIndexIfUnderLast(this.frontPosition);
	            var index = this.frontPosition;
	            var segment = new _Segment2.default(this.canvas, index, this.frontX);
	            this.segments.push(segment);
	            var segmentWidth = this.segmentWidths[index];
	            this.frontX += segmentWidth + SPACE_BETWEEN_SEGMENTS;
	            segment.load(segment);
	            this.frontPosition++;
	        }
	    }, {
	        key: 'getLastIndexIfBelowZero',
	        value: function getLastIndexIfBelowZero(index) {
	            if (index === -1) {
	                return this.segmentCount - 1;
	            } else if (index >= 0 && index < this.segmentCount) {
	                return index;
	            } else {
	                throw 'Segments: index < -1';
	            }
	        }
	    }, {
	        key: 'getZeroIndexIfUnderLast',
	        value: function getZeroIndexIfUnderLast(index) {
	            if (index === this.segmentCount) {
	                return 0;
	            } else if (index >= 0 && index < this.segmentCount) {
	                return index;
	            } else {
	                throw 'Segments: index > segment count';
	            }
	        }
	    }]);

	    return Segments;
	})();

	exports.default = Segments;

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _SegmentRepository = __webpack_require__(4);

	var _SegmentRepository2 = _interopRequireDefault(_SegmentRepository);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var segmentRepository = new _SegmentRepository2.default();

	var Segment = (function () {
	    function Segment(canvas, index, x) {
	        _classCallCheck(this, Segment);

	        this.isLoaded = false;
	        this.index = index;
	        this.canvas = canvas;
	        this.x = x;
	        this.load(this);
	    }

	    _createClass(Segment, [{
	        key: 'load',
	        value: function load(segment) {
	            segmentRepository.getByPosition(this.index).then(function (data) {
	                segment.data = data;
	                return loadImage(data.spriteImgUrl);
	            }).then(function (img) {
	                segment.spriteImg = img;
	                segment.isLoaded = true;
	            });
	        }
	    }, {
	        key: 'draw',
	        value: function draw() {
	            var ctx = this.canvas.ctx;
	            if (this.isLoaded) {
	                ctx.beginPath();
	                ctx.lineWidth = 6;
	                ctx.moveTo(this.x, 0);
	                ctx.lineTo(this.x + this.data.width, 0);
	                ctx.lineTo(this.x + this.data.width, this.data.height);
	                ctx.lineTo(this.x, this.data.height);
	                ctx.lineTo(this.x, 0);
	                ctx.stroke();
	                var spriteImg = this.spriteImg;
	                var positions = this.data.productPositions;
	                var _iteratorNormalCompletion = true;
	                var _didIteratorError = false;
	                var _iteratorError = undefined;

	                try {
	                    for (var _iterator = positions[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	                        var p = _step.value;

	                        if (p.h !== 0) {
	                            ctx.drawImage(spriteImg, p.sx, p.sy, p.w, p.h, p.dx + this.x, p.dy, p.w, p.h);
	                        }
	                    }
	                } catch (err) {
	                    _didIteratorError = true;
	                    _iteratorError = err;
	                } finally {
	                    try {
	                        if (!_iteratorNormalCompletion && _iterator.return) {
	                            _iterator.return();
	                        }
	                    } finally {
	                        if (_didIteratorError) {
	                            throw _iteratorError;
	                        }
	                    }
	                }
	            }
	        }
	    }]);

	    return Segment;
	})();

	exports.default = Segment;

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

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _Repository2 = __webpack_require__(5);

	var _Repository3 = _interopRequireDefault(_Repository2);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var SegmentRepository = (function (_Repository) {
	    _inherits(SegmentRepository, _Repository);

	    function SegmentRepository() {
	        _classCallCheck(this, SegmentRepository);

	        return _possibleConstructorReturn(this, Object.getPrototypeOf(SegmentRepository).apply(this, arguments));
	    }

	    _createClass(SegmentRepository, [{
	        key: 'getWidths',
	        value: function getWidths() {
	            return this.getJson('/getSegmentWidths');
	        }
	    }, {
	        key: 'getByPosition',
	        value: function getByPosition(index) {
	            return this.getJson('/getSegment?index=' + index);
	        }
	    }]);

	    return SegmentRepository;
	})(_Repository3.default);

	exports.default = SegmentRepository;

/***/ },
/* 5 */
/***/ function(module, exports) {

	'use strict';

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var SERVER_URL = 'http://localhost:3000';

	var Repository = (function () {
	    function Repository() {
	        _classCallCheck(this, Repository);
	    }

	    _createClass(Repository, [{
	        key: 'getJson',
	        value: function getJson(url) {
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
	        }
	    }]);

	    return Repository;
	})();

	exports.default = Repository;

/***/ },
/* 6 */
/***/ function(module, exports) {

	'use strict';

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var FpsMeasurer = (function () {
	    function FpsMeasurer() {
	        _classCallCheck(this, FpsMeasurer);

	        this.elapsed = 0;
	        this.last = null;
	    }

	    _createClass(FpsMeasurer, [{
	        key: 'tick',
	        value: function tick(now) {
	            this.elapsed = (now - (this.last || now)) / 1000;
	            this.last = now;
	        }
	    }, {
	        key: 'get',
	        value: function get() {
	            return Math.round(1 / this.elapsed);
	        }
	    }], [{
	        key: 'instance',
	        get: function get() {
	            if (!this._instance) {
	                this._instance = new FpsMeasurer();
	            }
	            return this._instance;
	        }
	    }]);

	    return FpsMeasurer;
	})();

	exports.default = FpsMeasurer;

/***/ },
/* 7 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.default = touch;
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

/***/ }
/******/ ]);