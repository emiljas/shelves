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
	// import enableDebug = require('./debug/enableDebug');
	var viewPort;
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
	    'use strict';
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


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var Events = __webpack_require__(3);
	var KnownImages = __webpack_require__(4);
	var SegmentController = __webpack_require__(7);
	var touch = __webpack_require__(19);
	var DrawingController = __webpack_require__(20);
	var ValueAnimatorController = __webpack_require__(21);
	var CanvasPool = __webpack_require__(24);
	var QueryString = __webpack_require__(25);
	var StartPosition = __webpack_require__(26);
	var ViewPort = (function () {
	    function ViewPort(containerId) {
	        var _this = this;
	        this.isDeleted = false;
	        this.events = new Events();
	        this.knownImagesPromise = KnownImages.downloadAll();
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
	        this.segmentsData = JSON.parse(this.container.getAttribute('data-segment-widths'));
	        this.segmentWidths = _.map(this.segmentsData, function (s) { return s.width; });
	        this.maxSegmentWidth = _.max(this.segmentWidths);
	        this.segmentHeight = parseInt(this.container.getAttribute('data-segment-height'), 10);
	        this.canvasPool = new CanvasPool(this.maxSegmentWidth, this.segmentHeight);
	        this.setInitialScale();
	        this.queryString = new QueryString(this.container);
	        var startPosition = new StartPosition({
	            canvasWidth: this.canvasWidth,
	            initialScale: this.initialScale,
	            segmentsData: this.segmentsData,
	            queryString: this.queryString
	        });
	        this.startPosition = startPosition.calculate();
	        this.segmentController = new SegmentController(this, this.segmentsData, this.segmentWidths, this.startPosition);
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
	    ViewPort.prototype.getKnownImages = function () { return this.knownImagesPromise; };
	    ViewPort.prototype.getCanvasPool = function () { return this.canvasPool; };
	    ViewPort.prototype.getQueryString = function () { return this.queryString; };
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
	        this.segmentController.draw(this.timestamp);
	        // this.ctx.rect(0, 0, this.canvas.width / this.scale, this.canvas.height / this.scale);
	        // this.ctx.fillStyle = 'rgba(255, 140, 0, ' + this.a + ')';
	        // this.ctx.fill();
	        //
	        // this.a -= 0.01;
	        // console.log(this.a);
	        this.ctx.restore();
	    };
	    ViewPort.prototype.mustBeRedraw = function () {
	        return this.xMove !== this.drawnXMove
	            || this.yMove !== this.drawnYMove
	            || this.scale !== this.drawnScale
	            || this.segmentController.checkIfNonDrawnSegmentsExistsAndReset()
	            || this.segmentController.checkIfAnyEffectsRendering();
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

	var ImageType = __webpack_require__(5);
	var loadImage = __webpack_require__(6);
	var baseUrl = '/DesktopModules/RossmannV4Modules/Shelves2/Img/';
	var KnownImages = (function () {
	    function KnownImages() {
	        this.images = new Array();
	        this.addImage(ImageType.ShelfLeftCorner, 'shelfLeftCorner.png');
	        this.addImage(ImageType.ShelfRightCorner, 'shelfRightCorner.png');
	        this.addImage(ImageType.Shelf, 'shelf.png');
	        this.addImage(ImageType.ShelfBackground, 'shelfBackground.png');
	        this.addImage(ImageType.ShelfLeftBackground, 'shelfLeftBackground.png');
	        this.addImage(ImageType.ShelfRightBackground, 'shelfRightBackground.png');
	        this.addImage(ImageType.FooterBackground, 'footerBackground.png');
	    }
	    KnownImages.downloadAll = function () {
	        var images = new KnownImages();
	        var promises = new Array();
	        for (var _i = 0, _a = images.images; _i < _a.length; _i++) {
	            var image = _a[_i];
	            promises.push(images.loadImage(image));
	        }
	        return Promise.all(promises).then(function () {
	            return images;
	        });
	    };
	    KnownImages.prototype.getByType = function (type) {
	        return this.images[type].img;
	    };
	    KnownImages.prototype.loadImage = function (image) {
	        return loadImage(image.url).then(function (img) {
	            image.img = img;
	        });
	    };
	    KnownImages.prototype.addImage = function (type, url) {
	        this.images[type] = { type: type, url: baseUrl + url, img: null };
	    };
	    return KnownImages;
	})();
	module.exports = KnownImages;


/***/ },
/* 5 */
/***/ function(module, exports) {

	var ImageType;
	(function (ImageType) {
	    ImageType[ImageType["ShelfLeftCorner"] = 0] = "ShelfLeftCorner";
	    ImageType[ImageType["ShelfRightCorner"] = 1] = "ShelfRightCorner";
	    ImageType[ImageType["Shelf"] = 2] = "Shelf";
	    ImageType[ImageType["ShelfBackground"] = 3] = "ShelfBackground";
	    ImageType[ImageType["ShelfLeftBackground"] = 4] = "ShelfLeftBackground";
	    ImageType[ImageType["ShelfRightBackground"] = 5] = "ShelfRightBackground";
	    ImageType[ImageType["FooterBackground"] = 6] = "FooterBackground";
	})(ImageType || (ImageType = {}));
	module.exports = ImageType;


/***/ },
/* 6 */
/***/ function(module, exports) {

	function loadImage(url) {
	    'use strict';
	    return new Promise(function (resolve, reject) {
	        var img = new Image();
	        img.src = url;
	        img.onload = function () {
	            resolve(img);
	        };
	        img.onerror = function (err) {
	            reject(err);
	        };
	    });
	}
	module.exports = loadImage;


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var Segment = __webpack_require__(8);
	var SegmentPrepender = __webpack_require__(15);
	var SegmentAppender = __webpack_require__(17);
	var FlashLoader = __webpack_require__(18);
	var SegmentController = (function () {
	    function SegmentController(viewPort, segmentsData, segmentWidths, startPosition) {
	        var _this = this;
	        this.viewPort = viewPort;
	        this.segmentsData = segmentsData;
	        this.segmentWidths = segmentWidths;
	        this.segments = new Array();
	        this.notDrawnSegmentCount = 0;
	        this.effectsRenderingCount = 0;
	        window['c'] = this;
	        var appenderArgs = {
	            INITIAL_SCALE: viewPort.getInitialScale(),
	            CANVAS_WIDTH: viewPort.getCanvasWidth(),
	            SEGMENT_WIDTHS: segmentWidths,
	            START_SEGMENT_INDEX: startPosition.segmentIndex,
	            START_X: startPosition.x,
	            segments: this.segments,
	            createSegment: function (index, x) {
	                var id = _this.segmentsData[index].id;
	                var segment = new Segment(viewPort, _this, index, id, x);
	                segment.load().then(function () {
	                    _this.notDrawnSegmentCount++;
	                });
	                return segment;
	            }
	        };
	        this.prepender = new SegmentPrepender(appenderArgs);
	        this.appender = new SegmentAppender(appenderArgs);
	        var makeFlash = function (segmentId) {
	            var segment = _.find(_this.segments, function (s) { return s.getId() === segmentId; });
	            segment.flash();
	        };
	        this.flashLoader = new FlashLoader(startPosition.segments, makeFlash);
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
	    SegmentController.prototype.checkIfAnyEffectsRendering = function () {
	        return this.effectsRenderingCount > 0;
	    };
	    SegmentController.prototype.reportEffectRenderingStart = function () {
	        this.effectsRenderingCount++;
	    };
	    SegmentController.prototype.reportEffectRenderingStop = function () {
	        this.effectsRenderingCount--;
	    };
	    SegmentController.prototype.draw = function (timestamp) {
	        for (var _i = 0, _a = this.segments; _i < _a.length; _i++) {
	            var segment = _a[_i];
	            segment.draw(timestamp);
	        }
	    };
	    SegmentController.prototype.preloadSegments = function () {
	        var xMove = this.viewPort.getXMove();
	        var scale = this.viewPort.getScale();
	        var initialScale = this.viewPort.getInitialScale();
	        xMove *= initialScale / scale;
	        this.appender.work(xMove);
	        this.prepender.work(xMove);
	        if (this.flashLoader && this.flashLoader.canBeFlashed()) {
	            this.flashLoader.flash();
	            this.flashLoader = null;
	        }
	    };
	    SegmentController.prototype.segmentLoaded = function (event) {
	        if (this.flashLoader) {
	            this.flashLoader.segmentLoaded(event);
	        }
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
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var SegmentRepository = __webpack_require__(9);
	var loadImage = __webpack_require__(11);
	var createWhitePixelImg = __webpack_require__(12);
	var Images = __webpack_require__(13);
	var FlashEffect = __webpack_require__(14);
	var segmentRepository = new SegmentRepository();
	var Segment = (function () {
	    function Segment(viewPort, segmentController, index, id, x) {
	        this.viewPort = viewPort;
	        this.segmentController = segmentController;
	        this.index = index;
	        this.id = id;
	        this.x = x;
	        this.isLoaded = false;
	        this.requestInProgressPromise = null;
	        this.ctx = viewPort.getCanvasContext();
	    }
	    Segment.prototype.getIndex = function () { return this.index; };
	    Segment.prototype.getId = function () { return this.id; };
	    Segment.prototype.getX = function () { return this.x; };
	    Segment.prototype.load = function () {
	        var _this = this;
	        return this.viewPort.getKnownImages().then(function (images) {
	            _this.knownImgs = images;
	            var getByIdPromise = _this.requestInProgressPromise = segmentRepository.getById(_this.id);
	            return getByIdPromise;
	        }).then(function (data) {
	            _this.width = data.width;
	            _this.height = data.height;
	            _this.shelves = data.shelves;
	            _this.knownImages = data.knownImages;
	            _this.images = data.images;
	            _this.productPositions = data.productPositions;
	            var loadImagePromise = _this.requestInProgressPromise = _this.loadImage(data.spriteImgUrl);
	            return loadImagePromise;
	        })
	            .then(function (img) {
	            _this.requestInProgressPromise = null;
	            _this.spriteImg = img;
	            return Promise.resolve();
	        })
	            .then(function () {
	            _this.imgs = new Images(_this.images);
	            return _this.imgs.downloadAll();
	        })
	            .then(function () {
	            _this.canvas = _this.createCanvas();
	            _this.isLoaded = true;
	            _this.segmentController.segmentLoaded({ segmentId: _this.id });
	            return Promise.resolve();
	        });
	    };
	    Segment.prototype.draw = function (timestamp) {
	        if (this.isLoaded) {
	            this.ctx.drawImage(this.canvas, 0, 0, this.width, this.height, this.x, 0, this.width, this.height);
	            if (this.flashEffect) {
	                if (this.flashEffect.isEnded()) {
	                    this.flashEffect = null;
	                }
	                else {
	                    this.flashEffect.flash(timestamp, this.x, 0, this.width, this.height);
	                }
	            }
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
	    Segment.prototype.flash = function () {
	        this.flashEffect = new FlashEffect(this.ctx);
	        this.segmentController.reportEffectRenderingStart();
	    };
	    Segment.prototype.unload = function () {
	        if (this.isLoaded) {
	            this.viewPort.getCanvasPool().release(this.canvas);
	        }
	        else if (this.requestInProgressPromise !== null) {
	            this.requestInProgressPromise.cancel();
	        }
	    };
	    Segment.prototype.loadImage = function (url) {
	        if (url) {
	            return loadImage(url);
	        }
	        else {
	            return createWhitePixelImg();
	        }
	    };
	    Segment.prototype.createCanvas = function () {
	        var canvas = this.viewPort.getCanvasPool().get();
	        var ctx = canvas.getContext('2d');
	        ctx.beginPath();
	        ctx.lineWidth = 5;
	        ctx.moveTo(0, 0);
	        ctx.lineTo(this.width, 0);
	        ctx.lineTo(this.width, this.height);
	        ctx.lineTo(0, this.height);
	        ctx.lineTo(0, 0);
	        ctx.stroke();
	        for (var _i = 0, _a = this.knownImages; _i < _a.length; _i++) {
	            var image = _a[_i];
	            var img = this.knownImgs.getByType(image.type);
	            if (image.w && image.h) {
	                ctx.drawImage(img, image.dx, image.dy, image.w, image.h);
	            }
	            else {
	                ctx.drawImage(img, image.dx, image.dy);
	            }
	        }
	        for (var _b = 0, _c = this.images; _b < _c.length; _b++) {
	            var image = _c[_b];
	            var img = this.imgs.getByUrl(image.url);
	            if (image.w && image.h) {
	                ctx.drawImage(img, image.dx, image.dy, image.w, image.h);
	            }
	            else {
	                ctx.drawImage(img, image.dx, image.dy);
	            }
	        }
	        for (var _d = 0, _e = this.productPositions; _d < _e.length; _d++) {
	            var p = _e[_d];
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
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Repository = __webpack_require__(10);
	var SegmentRepository = (function (_super) {
	    __extends(SegmentRepository, _super);
	    function SegmentRepository() {
	        _super.apply(this, arguments);
	    }
	    SegmentRepository.prototype.getWidths = function () {
	        return this.getJson('/DesktopModules/RossmannV4Modules/Shelves2/GetSegmentWidths.ashx');
	    };
	    SegmentRepository.prototype.getById = function (id) {
	        return this.getJson('/DesktopModules/RossmannV4Modules/Shelves2/GetSegment.ashx?id=' + id);
	    };
	    return SegmentRepository;
	})(Repository);
	module.exports = SegmentRepository;


/***/ },
/* 10 */
/***/ function(module, exports) {

	'use strict';
	// const SERVER_URL = 'http://localhost:3000';
	// const SERVER_URL = 'http://192.168.1.104:3000';
	// const SERVER_URL = 'http://www.api.devrossmann.pl';
	// const SERVER_URL = 'http://www.api.localhost.pl';
	var SERVER_URL = '';
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
/* 11 */
/***/ function(module, exports) {

	function loadCancelableImage(url) {
	    'use strict';
	    return new Promise((function (resolve, reject, onCancel) {
	        // url = '/DesktopModules/RossmannV4Modules/Shelves2/ImageProxy.ashx?src=' + encodeURIComponent(url);
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
	                img.onerror = function (err) {
	                    reject(err);
	                };
	            };
	            onCancel(function () {
	                req.abort();
	            });
	        };
	    }));
	}
	module.exports = loadCancelableImage;


/***/ },
/* 12 */
/***/ function(module, exports) {

	function createWhitePixelImg() {
	    'use strict';
	    return new Promise(function (resolve, reject) {
	        var img = new Image();
	        img.src = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
	        img.onload = function () {
	            resolve(img);
	        };
	        img.onerror = function (err) {
	            console.log('createWhitePixelImg', err);
	            reject(err);
	        };
	    });
	}
	module.exports = createWhitePixelImg;


/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	var loadImage = __webpack_require__(6);
	var Images = (function () {
	    function Images(images) {
	        var _this = this;
	        this.images = {};
	        this.promises = new Array();
	        this.promises = _.map(images, function (i) { return _this.load(i.url); });
	    }
	    Images.prototype.downloadAll = function () {
	        return Promise.all(this.promises);
	    };
	    Images.prototype.getByUrl = function (url) {
	        return this.images[url];
	    };
	    Images.prototype.load = function (url) {
	        var _this = this;
	        return loadImage(url).then(function (img) {
	            _this.images[url] = img;
	            return Promise.resolve();
	        });
	    };
	    return Images;
	})();
	module.exports = Images;


/***/ },
/* 14 */
/***/ function(module, exports) {

	var FLASH_EFFECT_DURATION_SEC = 1;
	var FLASH_EFFECT_MAX_OPACITY = 0.4;
	var FlashEffect = (function () {
	    function FlashEffect(ctx) {
	        this.ctx = ctx;
	        this.opacity = 0;
	    }
	    FlashEffect.prototype.flash = function (timestamp, x, y, width, height) {
	        if (!this.startTimestamp) {
	            this.startTimestamp = timestamp;
	        }
	        this.seconds = (timestamp - this.startTimestamp) / 1000;
	        this.opacity = Math.sin(this.seconds / FLASH_EFFECT_DURATION_SEC * Math.PI) * FLASH_EFFECT_MAX_OPACITY;
	        this.ctx.beginPath();
	        this.ctx.rect(x, y, width, height);
	        this.ctx.fillStyle = 'rgba(255, 215, 0, ' + this.opacity + ')';
	        this.ctx.fill();
	    };
	    FlashEffect.prototype.isEnded = function () {
	        return this.seconds >= FLASH_EFFECT_DURATION_SEC;
	    };
	    return FlashEffect;
	})();
	module.exports = FlashEffect;


/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	var LoopIndex = __webpack_require__(16);
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
/* 16 */
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
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	var LoopIndex = __webpack_require__(16);
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
	        this.nextIndex = args.START_SEGMENT_INDEX;
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
/* 18 */
/***/ function(module, exports) {

	var FlashLoader = (function () {
	    function FlashLoader(segments, makeFlash) {
	        this.segments = segments;
	        this.makeFlash = makeFlash;
	        this.loadedSegments = {};
	    }
	    FlashLoader.prototype.segmentLoaded = function (event) {
	        this.loadedSegments[event.segmentId] = true;
	    };
	    FlashLoader.prototype.canBeFlashed = function () {
	        for (var _i = 0, _a = this.segments; _i < _a.length; _i++) {
	            var segment = _a[_i];
	            if (this.loadedSegments[segment.id] !== true) {
	                return false;
	            }
	        }
	        return true;
	    };
	    FlashLoader.prototype.flash = function () {
	        for (var _i = 0, _a = this.segments; _i < _a.length; _i++) {
	            var segment = _a[_i];
	            this.makeFlash(segment.id);
	        }
	    };
	    return FlashLoader;
	})();
	module.exports = FlashLoader;


/***/ },
/* 19 */
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
/* 20 */
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
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	var ValueAnimator = __webpack_require__(22);
	var AnimatedValuesLock = __webpack_require__(23);
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
/* 22 */
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
/* 23 */
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
/* 24 */
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


/***/ },
/* 25 */
/***/ function(module, exports) {

	var QueryString = (function () {
	    function QueryString(container) {
	        this.container = container;
	        this.IsPlanogramIdSetUp = this.getBoolAttr('data-is-planogram-id-set-up');
	        this.PlanogramId = this.getIntAttr('data-planogram-id');
	        this.IsSegmentIdSetUp = this.getBoolAttr('data-is-segment-id-set-up');
	        this.SegmentId = this.getIntAttr('data-segment-id');
	        this.IsProductIdSetUp = this.getBoolAttr('data-is-product-id-set-up');
	        this.ProductId = this.getIntAttr('data-product-id');
	    }
	    QueryString.prototype.getBoolAttr = function (key) {
	        var value = this.container.getAttribute(key);
	        return value === 'True';
	    };
	    QueryString.prototype.getIntAttr = function (key) {
	        var value = this.container.getAttribute(key);
	        return parseInt(value, 10);
	    };
	    return QueryString;
	})();
	module.exports = QueryString;


/***/ },
/* 26 */
/***/ function(module, exports) {

	var StartPosition = (function () {
	    function StartPosition(args) {
	        this.args = args;
	    }
	    StartPosition.prototype.calculate = function () {
	        if (this.args.queryString.IsPlanogramIdSetUp) {
	            var planogramId = this.args.queryString.PlanogramId;
	            var segmentIndex = this.getSegmentIndexByPlanogramId(planogramId);
	            var segments = this.getSegmentsByPlanogramId(planogramId, segmentIndex);
	            var planogramWidth = this.calculatePlanogramWidth(segments);
	            var x = (this.args.canvasWidth - planogramWidth) / 2;
	            if (x < 0) {
	                x = 0;
	            }
	            return { segmentIndex: segmentIndex, x: x, segments: segments };
	        }
	        else {
	            return { segmentIndex: 0, x: 0, segments: [] };
	        }
	    };
	    StartPosition.prototype.getSegmentIndexByPlanogramId = function (planogramId) {
	        return _.findIndex(this.args.segmentsData, function (s) { return s.plnId === planogramId; });
	    };
	    StartPosition.prototype.getSegmentsByPlanogramId = function (planogramId, segmentIndex) {
	        var segments = new Array();
	        for (var i = segmentIndex; i < this.args.segmentsData.length; i++) {
	            var segment = this.args.segmentsData[i];
	            if (segment.plnId === planogramId) {
	                segments.push(segment);
	            }
	            else {
	                break;
	            }
	        }
	        return segments;
	    };
	    StartPosition.prototype.calculatePlanogramWidth = function (segments) {
	        var width = _.sum(segments, function (s) { return s.width; });
	        return width * this.args.initialScale;
	    };
	    return StartPosition;
	})();
	module.exports = StartPosition;


/***/ }
/******/ ]);