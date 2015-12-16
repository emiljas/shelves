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

	__webpack_require__(1);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	Promise.config({
	    warnings: true,
	    longStackTraces: false,
	    cancellation: true
	});
	var ViewPort = __webpack_require__(2);
	var SegmentRepository = __webpack_require__(6);
	var segmentRepository = new SegmentRepository();
	// import enableDebug = require('./debug/enableDebug');
	//should be deleted when setAttribute on server side!
	var downloadSegmentWidths = segmentRepository.getWidths().then(function (widths) {
	    var shelvesContainer = document.querySelector('#shelves1');
	    shelvesContainer.setAttribute('data-segment-widths', JSON.stringify(widths));
	    return Promise.resolve();
	});
	var viewPort;
	downloadSegmentWidths.then(function () {
	    viewPort = new ViewPort('#shelves1');
	    viewPort.start();
	    // enableDebug(); //DEBUG ONLY
	    var RESIZE_DEBOUNCED_WAIT = 200;
	    var MOBILE_CHROME_HEADER_HEIGHT = 56;
	    var lastDocumentSize = getDocumentSize();
	    window.addEventListener('resize', _.debounce(function (event) {
	        var documentSize = getDocumentSize();
	        var isWidthUpdated = lastDocumentSize.width !== documentSize.width;
	        var isHeightUpdated = Math.abs(lastDocumentSize.height - documentSize.height) > MOBILE_CHROME_HEADER_HEIGHT;
	        if (isWidthUpdated || isHeightUpdated) {
	            resize();
	            lastDocumentSize = documentSize;
	        }
	    }, RESIZE_DEBOUNCED_WAIT));
	    function getDocumentSize() {
	        return {
	            width: document.documentElement.clientWidth,
	            height: document.documentElement.clientHeight
	        };
	    }
	    function resize() {
	        'use strict';
	        viewPort.unbind();
	        viewPort = new ViewPort('#shelves1');
	        viewPort.start();
	    }
	});


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var Events = __webpack_require__(3);
	var SegmentController = __webpack_require__(4);
	var touch = __webpack_require__(12);
	var DrawingController = __webpack_require__(13);
	var ValueAnimatorController = __webpack_require__(14);
	var CanvasPool = __webpack_require__(17);
	var ViewPort = (function () {
	    function ViewPort(containerId) {
	        var _this = this;
	        this.isDeleted = false;
	        this.events = new Events();
	        this.xMove = 0;
	        this.yMove = 0;
	        this.drawingController = new DrawingController();
	        this.valueAnimatorController = new ValueAnimatorController();
	        this.frameRequestCallback = function (timestamp) { _this.onAnimationFrame(timestamp); };
	        // (<any>window)['vp'] = this; //DEBUG ONLY
	        this.container = document.querySelector(containerId);
	        this.canvas = this.container.querySelector('canvas');
	        this.fitCanvas();
	        this.canvasWidth = this.canvas.width;
	        this.canvasHeight = this.canvas.height;
	        this.y = this.container.getBoundingClientRect().top;
	        this.fitPlaceHolder(containerId);
	        this.container.classList.remove('loading');
	        this.ctx = this.canvas.getContext('2d');
	        this.segmentWidths = JSON.parse(this.container.getAttribute('data-segment-widths'));
	        this.segmentHeight = parseInt(this.container.getAttribute('data-segment-height'), 10);
	        this.maxSegmentWidth = _.max(this.segmentWidths);
	        this.canvasPool = new CanvasPool(this.maxSegmentWidth, this.segmentHeight);
	        this.setInitialScale();
	        this.segmentController = new SegmentController(this, this.segmentWidths);
	        this.bindControl();
	        this.hammerManager = touch(this);
	    }
	    ViewPort.prototype.getCanvas = function () { return this.canvas; };
	    ViewPort.prototype.getCanvasContext = function () { return this.ctx; };
	    ViewPort.prototype.getCanvasWidth = function () { return this.canvasWidth; };
	    ViewPort.prototype.getCanvasHeight = function () { return this.canvasHeight; };
	    ViewPort.prototype.getXMove = function () { return this.xMove; };
	    ViewPort.prototype.setXMove = function (value) { this.xMove = value; };
	    ViewPort.prototype.getYMove = function () { return this.yMove; };
	    ViewPort.prototype.setYMove = function (value) { this.yMove = value; };
	    ViewPort.prototype.getInitialScale = function () { return this.initialScale; };
	    ViewPort.prototype.getZoomScale = function () { return this.zoomScale; };
	    ViewPort.prototype.getScale = function () { return this.scale; };
	    ViewPort.prototype.getY = function () { return this.y; };
	    ViewPort.prototype.getCanvasPool = function () { return this.canvasPool; };
	    ViewPort.prototype.start = function () {
	        window.requestAnimationFrame(this.frameRequestCallback);
	    };
	    ViewPort.prototype.onClick = function (e) {
	        this.segmentController.onClick(e);
	    };
	    ViewPort.prototype.animate = function (propertyName, endValue) {
	        var _this = this;
	        this.valueAnimatorController.add({
	            id: propertyName,
	            start: this[propertyName],
	            end: endValue,
	            timestamp: this.timestamp,
	            onChange: function (value) { _this[propertyName] = value; }
	        });
	    };
	    ViewPort.prototype.beginAnimation = function () {
	        this.drawingController.beginAnimation();
	    };
	    ViewPort.prototype.endAnimation = function () {
	        this.drawingController.endAnimation();
	    };
	    ViewPort.prototype.unbind = function () {
	        this.isDeleted = true;
	        this.segmentController.unload();
	        this.events.removeAllEventListeners();
	        this.hammerManager.destroy();
	    };
	    ViewPort.prototype.fitCanvas = function () {
	        this.canvas.width = document.documentElement.clientWidth;
	        var documentHeight = document.documentElement.clientHeight;
	        var containerY = this.container.getBoundingClientRect().top;
	        var bottomMargin = 0.05 * documentHeight;
	        this.canvas.height = documentHeight - containerY - bottomMargin;
	    };
	    ViewPort.prototype.fitPlaceHolder = function (containerId) {
	        var placeHolder = document.querySelector('.shelvesPlaceHolder[data-place-holder-for="' + containerId + '"]');
	        placeHolder.style.height = this.container.getBoundingClientRect().height + 'px';
	    };
	    ViewPort.prototype.setInitialScale = function () {
	        this.initialScale = this.canvasHeight / this.segmentHeight;
	        this.zoomScale = Math.min(this.canvasWidth / (1.25 * this.maxSegmentWidth), 1);
	        this.scale = this.initialScale;
	    };
	    ViewPort.prototype.bindControl = function () {
	        var _this = this;
	        var backBtn = this.container.querySelector('.leftSlideBtn');
	        this.events.addEventListener(backBtn, 'click', function (e) {
	            e.preventDefault();
	            _this.slideLeft();
	        });
	        var nextBtn = this.container.querySelector('.rightSlideBtn');
	        this.events.addEventListener(nextBtn, 'click', function (e) {
	            e.preventDefault();
	            _this.slideRight();
	        });
	        var zoomInBtn = this.container.querySelector('.zoomInBtn');
	        this.events.addEventListener(zoomInBtn, 'click', function (e) {
	            e.preventDefault();
	            _this.scale += 0.01;
	        });
	        var zoomOutBtn = this.container.querySelector('.zoomOutBtn');
	        this.events.addEventListener(zoomOutBtn, 'click', function (e) {
	            e.preventDefault();
	            _this.scale -= 0.01;
	        });
	    };
	    ViewPort.prototype.slideRight = function () {
	        var xMove = this.xMove - this.canvasWidth;
	        this.animate('xMove', xMove);
	    };
	    ViewPort.prototype.slideLeft = function () {
	        var xMove = this.xMove + this.canvasWidth;
	        this.animate('xMove', xMove);
	    };
	    ViewPort.prototype.onAnimationFrame = function (timestamp) {
	        this.timestamp = timestamp;
	        this.valueAnimatorController.onAnimationFrame(timestamp);
	        if (this.mustBeRedraw()) {
	            this.blockVerticalMoveOutsideCanvas();
	            this.draw();
	        }
	        else {
	            this.segmentController.preloadSegments();
	        }
	        // FpsMeasurer.instance.tick(timestamp); //DEBUG ONLY
	        if (!this.isDeleted) {
	            window.requestAnimationFrame(this.frameRequestCallback);
	        }
	    };
	    ;
	    ViewPort.prototype.draw = function () {
	        this.drawnXMove = this.xMove;
	        this.drawnYMove = this.yMove;
	        this.drawnScale = this.scale;
	        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	        this.ctx.save();
	        this.ctx.translate(this.xMove, this.yMove);
	        this.ctx.scale(this.scale, this.scale);
	        this.segmentController.draw();
	        this.ctx.restore();
	    };
	    ViewPort.prototype.mustBeRedraw = function () {
	        return this.xMove !== this.drawnXMove
	            || this.yMove !== this.drawnYMove
	            || this.scale !== this.drawnScale
	            || this.segmentController.checkIfNonDrawnSegmentsExistsAndReset();
	    };
	    ViewPort.prototype.blockVerticalMoveOutsideCanvas = function () {
	        this.yMove = Math.min(0, this.yMove);
	        this.yMove = Math.max(this.yMove, this.canvasHeight - this.canvasHeight * (this.scale / this.initialScale));
	    };
	    return ViewPort;
	})();
	module.exports = ViewPort;


/***/ },
/* 3 */
/***/ function(module, exports) {

	var Events = (function () {
	    function Events() {
	        this.eventArgsList = new Array();
	    }
	    Events.prototype.addEventListener = function (element, type, listener) {
	        this.eventArgsList.push({ element: element, type: type, listener: listener });
	        element.addEventListener(type, listener, false);
	    };
	    Events.prototype.removeAllEventListeners = function () {
	        for (var _i = 0, _a = this.eventArgsList; _i < _a.length; _i++) {
	            var eventArgs = _a[_i];
	            var element = eventArgs.element;
	            var type = eventArgs.type;
	            var listener = eventArgs.listener;
	            element.removeEventListener(type, listener, false);
	        }
	    };
	    return Events;
	})();
	module.exports = Events;


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var Segment = __webpack_require__(5);
	var SegmentPrepender = __webpack_require__(9);
	var SegmentAppender = __webpack_require__(11);
	var SegmentController = (function () {
	    function SegmentController(viewPort, segmentWidths) {
	        var _this = this;
	        this.viewPort = viewPort;
	        this.segmentWidths = segmentWidths;
	        this.segments = new Array();
	        this.notDrawnSegmentCount = 0;
	        var appenderArgs = {
	            INITIAL_SCALE: viewPort.getInitialScale(),
	            CANVAS_WIDTH: viewPort.getCanvasWidth(),
	            SEGMENT_WIDTHS: segmentWidths,
	            START_SEGMENT_INDEX: 0,
	            START_X: 0,
	            segments: this.segments,
	            createSegment: function (index, x) {
	                var segment = new Segment(viewPort, index, x);
	                segment.load().then(function () {
	                    _this.notDrawnSegmentCount++;
	                });
	                return segment;
	            }
	        };
	        this.prepender = new SegmentPrepender(appenderArgs);
	        this.appender = new SegmentAppender(appenderArgs);
	    }
	    SegmentController.prototype.onClick = function (e) {
	        var scale = this.viewPort.getScale();
	        e.x = (e.x - this.viewPort.getXMove()) / scale;
	        e.y = (e.y - this.viewPort.getYMove() - this.viewPort.getY()) / scale;
	        var clickedSegment;
	        for (var _i = 0, _a = this.segments; _i < _a.length; _i++) {
	            var segment = _a[_i];
	            if (segment.isClicked(e)) {
	                clickedSegment = segment;
	                break;
	            }
	        }
	        if (clickedSegment) {
	            clickedSegment.fitOnViewPort(e.y);
	        }
	        else {
	            console.error('cannot find clicked segment');
	        }
	    };
	    SegmentController.prototype.checkIfNonDrawnSegmentsExistsAndReset = function () {
	        var nonDrawnSegmentsExists = this.notDrawnSegmentCount > 0;
	        this.notDrawnSegmentCount = 0;
	        return nonDrawnSegmentsExists;
	    };
	    SegmentController.prototype.draw = function () {
	        for (var _i = 0, _a = this.segments; _i < _a.length; _i++) {
	            var segment = _a[_i];
	            segment.draw();
	        }
	    };
	    SegmentController.prototype.preloadSegments = function () {
	        var xMove = this.viewPort.getXMove();
	        var scale = this.viewPort.getScale();
	        var initialScale = this.viewPort.getInitialScale();
	        xMove *= initialScale / scale;
	        this.appender.work(xMove);
	        this.prepender.work(xMove);
	    };
	    SegmentController.prototype.unload = function () {
	        for (var _i = 0, _a = this.segments; _i < _a.length; _i++) {
	            var segment = _a[_i];
	            segment.unload();
	        }
	    };
	    return SegmentController;
	})();
	module.exports = SegmentController;


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var SegmentRepository = __webpack_require__(6);
	var loadImage = __webpack_require__(8);
	var segmentRepository = new SegmentRepository();
	var Segment = (function () {
	    function Segment(viewPort, index, x) {
	        this.viewPort = viewPort;
	        this.index = index;
	        this.x = x;
	        this.isLoaded = false;
	        this.requestInProgressPromise = null;
	        this.ctx = viewPort.getCanvasContext();
	    }
	    Segment.prototype.getIndex = function () { return this.index; };
	    Segment.prototype.getX = function () { return this.x; };
	    Segment.prototype.load = function () {
	        var _this = this;
	        var getByPositionPromise = this.requestInProgressPromise = segmentRepository.getByPosition(this.index);
	        return getByPositionPromise.then(function (data) {
	            _this.width = data.width;
	            _this.height = data.height;
	            _this.productPositions = data.productPositions;
	            var loadImagePromise = _this.requestInProgressPromise = loadImage(data.spriteImgUrl);
	            return loadImagePromise;
	        })
	            .then(function (img) {
	            _this.requestInProgressPromise = null;
	            _this.spriteImg = img;
	            _this.canvas = _this.createCanvas();
	            _this.isLoaded = true;
	            return Promise.resolve();
	        });
	    };
	    Segment.prototype.draw = function () {
	        if (this.isLoaded) {
	            this.ctx.drawImage(this.canvas, 0, 0, this.width, this.height, this.x, 0, this.width, this.height);
	        }
	    };
	    Segment.prototype.isClicked = function (e) {
	        return e.x > this.x && e.x < this.x + this.width;
	    };
	    Segment.prototype.fitOnViewPort = function (y) {
	        var zoomScale = this.viewPort.getZoomScale();
	        var canvasWidth = this.viewPort.getCanvasWidth();
	        var xMove = (canvasWidth - this.width * zoomScale) / 2 - this.x * zoomScale;
	        var canvasHeight = this.viewPort.getCanvasHeight();
	        var yMove = canvasHeight / 2 - y * zoomScale;
	        this.viewPort.animate('xMove', xMove);
	        this.viewPort.animate('yMove', yMove);
	        this.viewPort.animate('scale', zoomScale);
	    };
	    Segment.prototype.unload = function () {
	        if (this.isLoaded) {
	            this.viewPort.getCanvasPool().release(this.canvas);
	        }
	        else if (this.requestInProgressPromise !== null) {
	            this.requestInProgressPromise.cancel();
	        }
	    };
	    Segment.prototype.createCanvas = function () {
	        var canvas = this.viewPort.getCanvasPool().get();
	        var ctx = canvas.getContext('2d');
	        ctx.beginPath();
	        ctx.lineWidth = 20;
	        ctx.moveTo(0, 0);
	        ctx.lineTo(this.width, 0);
	        ctx.lineTo(this.width, this.height);
	        ctx.lineTo(0, this.height);
	        ctx.lineTo(0, 0);
	        ctx.stroke();
	        var positions = this.productPositions;
	        for (var _i = 0; _i < positions.length; _i++) {
	            var p = positions[_i];
	            ctx.drawImage(this.spriteImg, p.sx, p.sy, p.w, p.h, p.dx, p.dy, p.w, p.h);
	        }
	        //debug only!
	        ctx.font = 'bold 250px Ariel';
	        ctx.fillStyle = 'black';
	        ctx.textAlign = 'center';
	        ctx.fillText(this.getIndex().toString(), this.width / 2, 600);
	        return canvas;
	    };
	    return Segment;
	})();
	module.exports = Segment;


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Repository = __webpack_require__(7);
	var SegmentRepository = (function (_super) {
	    __extends(SegmentRepository, _super);
	    function SegmentRepository() {
	        _super.apply(this, arguments);
	    }
	    SegmentRepository.prototype.getWidths = function () {
	        // return this.getJson<Array<number>>('/getSegmentWidths');
	        return this.getJson('/shelves/segmentWidths');
	    };
	    SegmentRepository.prototype.getByPosition = function (index) {
	        // return this.getJson<SegmentModel>('/getSegment?index=' + index);
	        return this.getJson('/shelves/segment?index=' + index);
	    };
	    return SegmentRepository;
	})(Repository);
	module.exports = SegmentRepository;


/***/ },
/* 7 */
/***/ function(module, exports) {

	'use strict';
	// const SERVER_URL = 'http://localhost:3000';
	// const SERVER_URL = 'http://192.168.1.104:3000';
	// const SERVER_URL = 'http://www.api.devrossmann.pl';
	var SERVER_URL = 'http://www.api.localhost.pl';
	var Repository = (function () {
	    function Repository() {
	    }
	    Repository.prototype.getJson = function (url) {
	        return new Promise((function (resolve, reject, onCancel) {
	            var req = new XMLHttpRequest();
	            req.onload = function (e) {
	                if (req.status === 200) {
	                    resolve(JSON.parse(req.responseText));
	                }
	                else {
	                    reject({
	                        status: req.status,
	                        message: req.responseText
	                    });
	                }
	            };
	            req.open('get', SERVER_URL + url, true);
	            req.setRequestHeader('Accept', '*/*');
	            req.send();
	            onCancel(function () {
	                req.abort();
	            });
	        }));
	    };
	    return Repository;
	})();
	module.exports = Repository;


/***/ },
/* 8 */
/***/ function(module, exports) {

	function loadImage(url) {
	    'use strict';
	    return new Promise((function (resolve, reject, onCancel) {
	        url = '/DesktopModules/RossmannV4Modules/Shelves2/ImageProxy.ashx?src=' + encodeURIComponent(url);
	        var req = new XMLHttpRequest();
	        req.open('get', url);
	        req.responseType = 'blob';
	        req.send();
	        req.onload = function () {
	            var img = new Image();
	            var imgSrc = window.URL.createObjectURL(req.response);
	            img.src = imgSrc;
	            img.onload = function () {
	                window.URL.revokeObjectURL(imgSrc);
	                resolve(img);
	            };
	            img.onerror = function (err) {
	                reject(err);
	            };
	        };
	        onCancel(function () {
	            req.abort();
	        });
	    }));
	}
	module.exports = loadImage;


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	var LoopIndex = __webpack_require__(10);
	var SegmentPrepender = (function () {
	    function SegmentPrepender(args) {
	        this.args = args;
	        this.currentX = 0;
	        var segmentCount = args.SEGMENT_WIDTHS.length;
	        this.loopIndex = new LoopIndex(segmentCount, args.START_SEGMENT_INDEX);
	        this.currentIndex = args.START_SEGMENT_INDEX;
	        this.currentX = args.START_X / args.INITIAL_SCALE;
	    }
	    SegmentPrepender.prototype.work = function (xMove) {
	        while (this.shouldPrepend(xMove)) {
	            this.prepend();
	        }
	        this.unloadUnvisibleSegments(xMove);
	    };
	    SegmentPrepender.prototype.shouldPrepend = function (xMove) {
	        var freeSpace = xMove + this.currentX * this.args.INITIAL_SCALE;
	        return Math.round(freeSpace + this.args.CANVAS_WIDTH) > 0;
	    };
	    SegmentPrepender.prototype.prepend = function () {
	        this.currentIndex = this.loopIndex.prev();
	        var segmentWidth = this.args.SEGMENT_WIDTHS[this.currentIndex];
	        this.currentX -= segmentWidth;
	        var segment = this.args.createSegment(this.currentIndex, this.currentX);
	        this.args.segments.push(segment);
	    };
	    SegmentPrepender.prototype.unloadUnvisibleSegments = function (xMove) {
	        for (var _i = 0, _a = this.args.segments; _i < _a.length; _i++) {
	            var segment = _a[_i];
	            var segmentX = segment.getX();
	            var segmentWidth = this.getSegmentWidth(segment);
	            if (this.isSegmentBeforeCanvasVisibleArea(xMove, segmentX, segmentWidth)) {
	                this.currentIndex = this.loopIndex.next();
	                this.currentX += segmentWidth;
	                segment.unload();
	                _.pull(this.args.segments, segment);
	            }
	        }
	    };
	    SegmentPrepender.prototype.isSegmentBeforeCanvasVisibleArea = function (xMove, segmentX, segmentWidth) {
	        var distanceFromCanvasLeftEdge = xMove + segmentX * this.args.INITIAL_SCALE + segmentWidth * this.args.INITIAL_SCALE;
	        return Math.round(distanceFromCanvasLeftEdge) < -this.args.CANVAS_WIDTH;
	    };
	    SegmentPrepender.prototype.getSegmentWidth = function (segment) {
	        var segmentWidth = this.args.SEGMENT_WIDTHS[segment.getIndex()];
	        return segmentWidth;
	    };
	    return SegmentPrepender;
	})();
	module.exports = SegmentPrepender;


/***/ },
/* 10 */
/***/ function(module, exports) {

	var LoopIndex = (function () {
	    function LoopIndex(itemsCount, index) {
	        this.itemsCount = itemsCount;
	        this.index = index;
	    }
	    LoopIndex.prototype.prev = function () {
	        this.index = this.getLastIndexIfBelowZero(this.index - 1);
	        return this.index;
	    };
	    LoopIndex.prototype.next = function () {
	        this.index = this.getZeroIndexIfUnderLast(this.index + 1);
	        return this.index;
	    };
	    LoopIndex.prototype.getZeroIndexIfUnderLast = function (index) {
	        if (index === this.itemsCount) {
	            return 0;
	        }
	        else {
	            return index;
	        }
	    };
	    LoopIndex.prototype.getLastIndexIfBelowZero = function (index) {
	        if (index === -1) {
	            return this.itemsCount - 1;
	        }
	        else {
	            return index;
	        }
	    };
	    return LoopIndex;
	})();
	module.exports = LoopIndex;


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	var LoopIndex = __webpack_require__(10);
	/*
	dodaje i usuwa segmenty
	pierwszy segment dodany jest w x = START_X i ma index START_SEGMENT_INDEX
	*/
	var SegmentAppender = (function () {
	    function SegmentAppender(args) {
	        this.args = args;
	        this.nextIndex = 0;
	        this.nextX = 0;
	        this.segmentCount = args.SEGMENT_WIDTHS.length;
	        this.loopIndex = new LoopIndex(this.segmentCount, args.START_SEGMENT_INDEX);
	        this.nextX = args.START_X / this.args.INITIAL_SCALE;
	    }
	    SegmentAppender.prototype.work = function (xMove) {
	        while (this.shouldAppend(xMove)) {
	            this.append();
	        }
	        this.unloadUnvisibleSegments(xMove);
	    };
	    SegmentAppender.prototype.shouldAppend = function (xMove) {
	        var freeSpace = -xMove + this.args.CANVAS_WIDTH - this.nextX * this.args.INITIAL_SCALE;
	        return Math.round(freeSpace + this.args.CANVAS_WIDTH) > 0;
	    };
	    SegmentAppender.prototype.append = function () {
	        var segmentWidth = this.args.SEGMENT_WIDTHS[this.nextIndex];
	        var segment = this.args.createSegment(this.nextIndex, this.nextX);
	        this.args.segments.push(segment);
	        this.nextX += segmentWidth;
	        this.nextIndex = this.loopIndex.next();
	    };
	    SegmentAppender.prototype.unloadUnvisibleSegments = function (xMove) {
	        for (var _i = 0, _a = this.args.segments; _i < _a.length; _i++) {
	            var segment = _a[_i];
	            if (this.isSegmentAfterCanvasVisibleArea(xMove, segment.getX())) {
	                this.nextIndex = this.loopIndex.prev();
	                var segmentWidth = this.args.SEGMENT_WIDTHS[this.nextIndex];
	                this.nextX -= segmentWidth;
	                segment.unload();
	                _.pull(this.args.segments, segment);
	            }
	        }
	    };
	    SegmentAppender.prototype.isSegmentAfterCanvasVisibleArea = function (xMove, segmentX) {
	        var distanceFromCanvasRightEdge = xMove - this.args.CANVAS_WIDTH + segmentX * this.args.INITIAL_SCALE;
	        return Math.round(distanceFromCanvasRightEdge) > this.args.CANVAS_WIDTH;
	    };
	    return SegmentAppender;
	})();
	module.exports = SegmentAppender;


/***/ },
/* 12 */
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
	    hammer.on('tap', function (e) {
	        viewPort.onClick(e.center);
	    });
	    return hammer;
	}
	module.exports = touch;


/***/ },
/* 13 */
/***/ function(module, exports) {

	var DrawingController = (function () {
	    function DrawingController() {
	        this.animationCount = 0;
	    }
	    DrawingController.prototype.beginAnimation = function () {
	        this.animationCount++;
	    };
	    DrawingController.prototype.endAnimation = function () {
	        this.animationCount--;
	    };
	    DrawingController.prototype.mustRedraw = function () {
	        return this.animationCount > 0;
	    };
	    return DrawingController;
	})();
	module.exports = DrawingController;


/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	var ValueAnimator = __webpack_require__(15);
	var AnimatedValuesLock = __webpack_require__(16);
	var ValueAnimatorController = (function () {
	    function ValueAnimatorController() {
	        this.animators = new Array();
	        this.lock = new AnimatedValuesLock();
	    }
	    ValueAnimatorController.prototype.add = function (args) {
	        if (this.lock.isUnlock(args.id)) {
	            this.lock.lock(args.id);
	            this.animators.push(new ValueAnimator(args));
	        }
	    };
	    ValueAnimatorController.prototype.onAnimationFrame = function (timestamp) {
	        for (var _i = 0, _a = this.animators; _i < _a.length; _i++) {
	            var animator = _a[_i];
	            animator.onAnimationFrame(timestamp);
	            this.removeAnimatorIfDone(animator);
	        }
	    };
	    ValueAnimatorController.prototype.removeAnimatorIfDone = function (animator) {
	        if (animator.isDone()) {
	            _.pull(this.animators, animator);
	            this.lock.unlock(animator.getId());
	        }
	    };
	    return ValueAnimatorController;
	})();
	module.exports = ValueAnimatorController;


/***/ },
/* 15 */
/***/ function(module, exports) {

	var HALF_OF_PI = Math.PI / 2;
	var ValueAnimator = (function () {
	    function ValueAnimator(args) {
	        this._isDone = false;
	        this.args = args;
	        this.value = args.start;
	        this.difference = args.end - args.start;
	    }
	    ValueAnimator.prototype.getId = function () {
	        return this.args.id;
	    };
	    ValueAnimator.prototype.isDone = function () { return this._isDone; };
	    ValueAnimator.prototype.onAnimationFrame = function (timestamp) {
	        var secsFromStart = (timestamp - this.args.timestamp) / 1000;
	        if (secsFromStart >= 1) {
	            this._isDone = true;
	            this.args.onChange(this.args.end);
	        }
	        else {
	            var value = this.args.start + Math.sin(secsFromStart * HALF_OF_PI) * this.difference;
	            this.args.onChange(value);
	        }
	    };
	    return ValueAnimator;
	})();
	module.exports = ValueAnimator;


/***/ },
/* 16 */
/***/ function(module, exports) {

	var AnimatedValuesLock = (function () {
	    function AnimatedValuesLock() {
	        this.dict = {};
	    }
	    AnimatedValuesLock.prototype.lock = function (id) {
	        this.dict[id] = true;
	    };
	    AnimatedValuesLock.prototype.unlock = function (id) {
	        delete this.dict[id];
	    };
	    AnimatedValuesLock.prototype.isUnlock = function (id) {
	        return !this.dict[id];
	    };
	    return AnimatedValuesLock;
	})();
	module.exports = AnimatedValuesLock;


/***/ },
/* 17 */
/***/ function(module, exports) {

	var CanvasPool = (function () {
	    function CanvasPool(maxCanvasWidth, maxCanvasHeight) {
	        this.maxCanvasWidth = maxCanvasWidth;
	        this.maxCanvasHeight = maxCanvasHeight;
	        this.items = new Array();
	    }
	    CanvasPool.prototype.get = function () {
	        var availableItem = this.getAvailableItem();
	        if (availableItem !== null) {
	            availableItem.inUse = true;
	            return availableItem.canvas;
	        }
	        var canvas = document.createElement('canvas');
	        canvas.width = this.maxCanvasWidth;
	        canvas.height = this.maxCanvasHeight;
	        this.items.push({
	            canvas: canvas,
	            inUse: true
	        });
	        return canvas;
	    };
	    CanvasPool.prototype.release = function (canvas) {
	        var item = _.find(this.items, function (i) { return i.canvas === canvas; });
	        item.canvas.getContext('2d').clearRect(0, 0, this.maxCanvasWidth, this.maxCanvasHeight);
	        item.inUse = false;
	    };
	    CanvasPool.prototype.getAvailableItem = function () {
	        for (var _i = 0, _a = this.items; _i < _a.length; _i++) {
	            var item = _a[_i];
	            if (!item.inUse) {
	                return item;
	            }
	        }
	        return null;
	    };
	    return CanvasPool;
	})();
	module.exports = CanvasPool;


/***/ }
/******/ ]);