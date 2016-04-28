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

	module.exports = __webpack_require__(1);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
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
	var SEGMENT_COLOR = '#D2D1CC';
	var Events = __webpack_require__(3);
	var Control = __webpack_require__(4);
	var KnownImages = __webpack_require__(7);
	var SegmentController = __webpack_require__(9);
	var touch = __webpack_require__(23);
	var DrawingController = __webpack_require__(24);
	var ValueAnimatorController = __webpack_require__(25);
	var CanvasPool = __webpack_require__(27);
	var Preloader = __webpack_require__(28);
	var QueryString = __webpack_require__(29);
	var StartPosition = __webpack_require__(30);
	var CartDict = __webpack_require__(18);
	var Historyjs = History;
	var VERTICAL_SLIDE_RATIO = 0.8;
	var SCROLL_LINE_HEIGHT = 20;
	var PRODUCT_TOOLTIP_VERTICAL_WIDTH = 185;
	var PRODUCT_TOOLTIP_VERTICAL_HEIGHT = 280;
	var PRODUCT_TOOLTIP_HORIZONTAL_WIDTH = 250;
	var PRODUCT_TOOLTIP_HORIZONTAL_HEIGHT = 200;
	var lastSegmentId;
	var ViewPort = (function () {
	    function ViewPort(containerId) {
	        var _this = this;
	        this.isDeleted = false;
	        this.shouldRedrawPreloaders = false;
	        this.events = new Events();
	        this.knownImagesPromise = KnownImages.downloadAll();
	        this.xMove = 0;
	        this.yMove = 0;
	        this.isMagnified = false;
	        this.isTopScrollBlock = true;
	        this.isBottomScrollBlock = true;
	        this.drawingController = new DrawingController();
	        this.valueAnimatorController = new ValueAnimatorController();
	        this.frameRequestCallback = function (timestamp) { _this.onAnimationFrame(timestamp); };
	        // (<any>window)['vp'] = this; //DEBUG ONLY
	        this.container = document.querySelector(containerId);
	        this.canvas = this.container.querySelector('canvas');
	        this.fitCanvas();
	        this.canvasWidth = this.canvas.width;
	        this.canvasHeight = this.canvas.height;
	        var containerRect = this.container.getBoundingClientRect();
	        this.x = containerRect.left;
	        this.y = containerRect.top;
	        this.fitPlaceHolder(containerId);
	        this.container.classList.remove('loading');
	        this.ctx = this.canvas.getContext('2d');
	        this.segmentsData = JSON.parse(this.container.getAttribute('data-segment-widths'));
	        this.segmentWidths = _.map(this.segmentsData, function (s) { return s.width; });
	        this.maxSegmentWidth = _.max(this.segmentWidths);
	        this.segmentHeight = parseInt(this.container.getAttribute('data-segment-height'), 10);
	        this.calculateScales();
	        this.maxCanvasWidth = Math.round(this.maxSegmentWidth * this.zoomScale);
	        this.maxCanvasHeight = Math.round(this.segmentHeight * this.zoomScale);
	        this.canvasPool = new CanvasPool(this.maxCanvasWidth, this.maxCanvasHeight);
	        var minSegmentWidth = 356;
	        var preloaderWidth = Math.round(minSegmentWidth * this.initialScale * 0.95);
	        this.preloader = new Preloader(preloaderWidth);
	        var noFlash;
	        if (lastSegmentId) {
	            this.queryString = new QueryString(lastSegmentId);
	            noFlash = true;
	        }
	        else {
	            this.queryString = new QueryString(this.container);
	            noFlash = false;
	        }
	        var startPosition = new StartPosition({
	            canvasWidth: this.canvasWidth,
	            initialScale: this.initialScale,
	            segmentsData: this.segmentsData,
	            queryString: this.queryString
	        });
	        this.startPosition = startPosition.calculate();
	        var startProductId = this.queryString.IsProductIdSetUp ? this.queryString.ProductId : null;
	        this.segmentController = new SegmentController(this, this.segmentsData, this.segmentWidths, this.startPosition, startProductId, noFlash);
	        this.initControl();
	        this.hammerManager = touch(this);
	        this.events.addEventListener(this.canvas, 'mousemove', function (e) { _this.handleMouseMove(e); });
	        this.events.addEventListener(this.canvas, 'touchstart', function (e) { _this.handleTouchStart(e); });
	        this.scrollPageHeight = document.documentElement.clientHeight;
	        this.events.addEventListener(this.canvas, 'wheel', function (e) { e.preventDefault(); _this.handleScroll(e); });
	        var tooltip = document.getElementById('shelves2ProductTooltip');
	        this.events.addEventListener(tooltip, 'wheel', function (e) { e.preventDefault(); e.stopPropagation(); _this.handleScroll(e); });
	        this.setUrlOncePer250ms = _.throttle(function () { _this.setUrl(); }, 250);
	        CartDict.GetInstance().handleProductQuantityChangedCallback = function () {
	            _this.segmentController.handleProductQuantityChanged();
	        };
	        this.setIsProductTooltipEnabled();
	        //
	        // (<any>window).x = this.control_left.bind(this);
	        // (<any>window).y = this.control_right.bind(this);
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
	    ViewPort.prototype.getX = function () { return this.x; };
	    ViewPort.prototype.getY = function () { return this.y; };
	    ViewPort.prototype.getSegmentHeight = function () { return this.segmentHeight; };
	    ViewPort.prototype.getKnownImages = function () { return this.knownImagesPromise; };
	    ViewPort.prototype.getCanvasPool = function () { return this.canvasPool; };
	    ViewPort.prototype.getPreloader = function () { return this.preloader; };
	    ViewPort.prototype.getQueryString = function () { return this.queryString; };
	    ViewPort.prototype.getEvents = function () { return this.events; };
	    ViewPort.prototype.checkIfMagnified = function () { return this.isMagnified; };
	    ViewPort.prototype.checkIfTopScrollBlock = function () { return this.isTopScrollBlock; };
	    ViewPort.prototype.checkIfBottomScrollBlock = function () { return this.isBottomScrollBlock; };
	    ViewPort.prototype.getMaxCanvasWidth = function () { return this.maxCanvasWidth; };
	    ViewPort.prototype.getMaxCanvasHeight = function () { return this.maxCanvasHeight; };
	    ViewPort.prototype.getStartX = function () { return this.startPosition.x; };
	    ViewPort.prototype.checkIfAnimationsInProgressExists = function () { return this.valueAnimatorController.animationsInProgressExists(); };
	    ViewPort.prototype.checkIfProductTooltipEnabled = function () { return this.isProductTooltipEnabled; };
	    ViewPort.prototype.start = function () {
	        window.requestAnimationFrame(this.frameRequestCallback);
	    };
	    ViewPort.prototype.onClick = function (e) {
	        this.segmentController.onClick(e);
	    };
	    ViewPort.prototype.animate = function (input) {
	        var args = this.createValueAnimatorArgs(input);
	        this.valueAnimatorController.add(args);
	    };
	    ViewPort.prototype.animateBatch = function (inputs) {
	        var _this = this;
	        var argsList = _.map(inputs, function (i) { return _this.createValueAnimatorArgs(i); });
	        this.valueAnimatorController.addBatch(argsList);
	    };
	    ViewPort.prototype.createValueAnimatorArgs = function (input) {
	        var _this = this;
	        return {
	            id: input.propertyName,
	            start: this[input.propertyName],
	            end: input.endValue,
	            timestamp: this.timestamp,
	            onChange: function (value) { _this[input.propertyName] = value; }
	        };
	    };
	    ViewPort.prototype.stopAnimation = function (propertyName) {
	        this.valueAnimatorController.remove(propertyName);
	    };
	    ViewPort.prototype.beginAnimation = function () {
	        this.drawingController.beginAnimation();
	    };
	    ViewPort.prototype.endAnimation = function () {
	        this.drawingController.endAnimation();
	    };
	    ViewPort.prototype.control_left = function () {
	        if (!this.valueAnimatorController.animationsInProgressExists()) {
	            if (this.isMagnified) {
	                this.segmentController.fitLeftSegmentOnViewPort();
	            }
	            else {
	                this.slideLeft();
	            }
	        }
	    };
	    ViewPort.prototype.control_right = function () {
	        if (!this.valueAnimatorController.animationsInProgressExists()) {
	            if (this.isMagnified) {
	                this.segmentController.fitRightSegmentOnViewPort();
	            }
	            else {
	                this.slideRight();
	            }
	        }
	    };
	    ViewPort.prototype.control_top = function () {
	        if (!this.valueAnimatorController.animationsInProgressExists()) {
	            this.animate({ propertyName: 'yMove', endValue: this.yMove + VERTICAL_SLIDE_RATIO * this.canvasHeight });
	        }
	    };
	    ViewPort.prototype.control_bottom = function () {
	        if (!this.valueAnimatorController.animationsInProgressExists()) {
	            this.animate({ propertyName: 'yMove', endValue: this.yMove - VERTICAL_SLIDE_RATIO * this.canvasHeight });
	        }
	    };
	    ViewPort.prototype.control_zoom = function () {
	        if (!this.valueAnimatorController.animationsInProgressExists()) {
	            this.notifyAboutZoomChange(true);
	            this.segmentController.fitMiddleSegmentOnViewPort();
	        }
	    };
	    ViewPort.prototype.control_unzoom = function () {
	        if (!this.valueAnimatorController.animationsInProgressExists()) {
	            this.notifyAboutZoomChange(false);
	            var x = -this.xMove + this.canvasWidth / 2;
	            this.animateBatch([
	                { propertyName: 'xMove', endValue: this.canvasWidth / 2 - x * (this.initialScale / this.zoomScale) },
	                { propertyName: 'yMove', endValue: 0 },
	                { propertyName: 'scale', endValue: this.initialScale }
	            ]);
	        }
	    };
	    ViewPort.prototype.notifyAboutZoomChange = function (isMagnified) {
	        this.isMagnified = isMagnified;
	        this.control.onZoomChange();
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
	        this.canvas.height = documentHeight - containerY;
	    };
	    ViewPort.prototype.fitPlaceHolder = function (containerId) {
	        var placeHolder = document.querySelector('.shelvesPlaceHolder[data-place-holder-for="' + containerId + '"]');
	        placeHolder.style.height = this.container.getBoundingClientRect().height + 'px';
	    };
	    ViewPort.prototype.calculateScales = function () {
	        this.initialScale = this.canvasHeight / this.segmentHeight;
	        this.zoomScale = Math.min(this.canvasWidth / (1.25 * this.maxSegmentWidth), 1);
	        this.scale = this.initialScale;
	    };
	    ViewPort.prototype.initControl = function () {
	        this.control = new Control(this, this.container);
	        this.control.init();
	    };
	    ViewPort.prototype.slideRight = function () {
	        var xMove = this.xMove - this.canvasWidth;
	        this.animate({ propertyName: 'xMove', endValue: xMove });
	    };
	    ViewPort.prototype.slideLeft = function () {
	        var xMove = this.xMove + this.canvasWidth;
	        this.animate({ propertyName: 'xMove', endValue: xMove });
	    };
	    ViewPort.prototype.onAnimationFrame = function (timestamp) {
	        this.timestamp = timestamp;
	        this.valueAnimatorController.onAnimationFrame(timestamp);
	        this.anyPreloadingSegmentsExists = this.segmentController.checkIfAnyPreloadingSegmentsExists();
	        if (this.anyPreloadingSegmentsExists) {
	            this.shouldRedrawPreloaders = this.preloader.handleAnimationFrame(timestamp);
	        }
	        if (this.mustBeRedraw()) {
	            if (this.isTranslatedOrScaled()) {
	                Rossmann.Modules.Shelves2.closeProductTooltip();
	            }
	            this.blockVerticalMoveOutsideCanvas();
	            this.draw();
	            this.drawSlider();
	        }
	        else {
	            this.segmentController.preloadSegments();
	        }
	        this.setUrlOncePer250ms();
	        if (!this.isDeleted) {
	            window.requestAnimationFrame(this.frameRequestCallback);
	        }
	    };
	    ;
	    ViewPort.prototype.setUrl = function () {
	        var segment = this.segmentController.getMiddleSegment();
	        if (segment && !Rossmann.Modules.Shelves2.isProductPopUpOpen) {
	            var title = segment.getSeoTitle();
	            var url = segment.getPlanogramUrl();
	            Historyjs.replaceState(null, title, url);
	            lastSegmentId = segment.getId();
	        }
	    };
	    ViewPort.prototype.drawSlider = function () {
	        if (this.isMagnified) {
	            var sliderMargin = 10;
	            var sliderPadding = 2.5;
	            var sliderX = this.canvasWidth - 2 * sliderMargin;
	            var sliderY = sliderMargin;
	            var sliderWidth = 8;
	            var sliderHeight = this.canvasHeight - 2 * sliderMargin;
	            this.ctx.fillStyle = 'white';
	            this.ctx.fillRect(sliderX, sliderY, sliderWidth, sliderHeight);
	            var sliderZipX = sliderX + sliderPadding;
	            var sliderZipY = sliderY + sliderPadding;
	            var sliderZipWidth = sliderWidth - 2 * sliderPadding;
	            var sliderZipEndY = (sliderHeight - 2 * sliderPadding)
	                * (((-this.yMove + this.canvasHeight) / this.scale) / this.segmentHeight);
	            var scrollZipHeight = (sliderHeight - 2 * sliderPadding)
	                * (((this.canvasHeight) / this.scale) / this.segmentHeight);
	            this.ctx.fillStyle = '#0067B2';
	            this.ctx.fillRect(sliderZipX, sliderZipY + sliderZipEndY - scrollZipHeight, sliderZipWidth, scrollZipHeight);
	        }
	    };
	    ViewPort.prototype.handleTouchStart = function (e) {
	        var rect = this.canvas.getBoundingClientRect();
	        var x = e.touches[0].pageX - rect.left;
	        var y = e.touches[0].pageY - rect.top;
	        this.handleCursorPositionChanged(x, y);
	    };
	    ViewPort.prototype.handleMouseMove = function (e) {
	        var x = e.offsetX;
	        var y = e.offsetY;
	        this.handleCursorPositionChanged(x, y);
	    };
	    ViewPort.prototype.handleScroll = function (e) {
	        if (e.deltaMode === e.DOM_DELTA_PIXEL) {
	            this.yMove -= e.deltaY;
	        }
	        else if (e.deltaMode === e.DOM_DELTA_LINE) {
	            this.yMove -= e.deltaY * SCROLL_LINE_HEIGHT;
	        }
	        else if (e.deltaY === e.DOM_DELTA_PAGE) {
	            this.yMove -= e.deltaY * this.scrollPageHeight;
	        }
	        this.handleCursorPositionChanged(e.offsetX, e.offsetY);
	    };
	    ViewPort.prototype.handleCursorPositionChanged = function (x, y) {
	        if (this.isMagnified) {
	            this.segmentController.handleMouseMove(x, y);
	            var isClickable = this.segmentController.isClickable(x, y);
	            if (isClickable) {
	                this.container.classList.add('pointer');
	            }
	            else {
	                this.container.classList.remove('pointer');
	            }
	        }
	        else {
	            this.container.classList.add('pointer');
	        }
	    };
	    ViewPort.prototype.draw = function () {
	        this.drawnXMove = this.xMove;
	        this.drawnYMove = this.yMove;
	        this.drawnScale = this.scale;
	        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	        this.ctx.save();
	        this.ctx.translate(this.xMove, this.yMove);
	        this.ctx.scale(this.scale, this.scale);
	        this.segmentController.draw(this.timestamp);
	        this.ctx.restore();
	    };
	    ViewPort.prototype.mustBeRedraw = function () {
	        var notDrawnSegmentsExists = this.segmentController.checkIfNonDrawnSegmentsExistsAndReset();
	        return this.xMove !== this.drawnXMove
	            || this.yMove !== this.drawnYMove
	            || this.scale !== this.drawnScale
	            || notDrawnSegmentsExists
	            || this.segmentController.checkIfAnyEffectsRendering()
	            || (this.anyPreloadingSegmentsExists && this.shouldRedrawPreloaders);
	    };
	    ViewPort.prototype.isTranslatedOrScaled = function () {
	        return this.xMove !== this.drawnXMove
	            || this.yMove !== this.drawnYMove
	            || this.scale !== this.drawnScale;
	    };
	    ViewPort.prototype.blockVerticalMoveOutsideCanvas = function () {
	        var minYMove = 0;
	        this.yMove = Math.min(minYMove, this.yMove);
	        var maxYMove = this.canvasHeight - this.canvasHeight * (this.scale / this.initialScale);
	        this.yMove = Math.max(this.yMove, maxYMove);
	        if (this.areMovesEqual(this.yMove, minYMove)) {
	            if (!this.isTopScrollBlock) {
	                this.isTopScrollBlock = true;
	                this.control.onTopScrollBlock();
	            }
	        }
	        else {
	            if (this.isTopScrollBlock) {
	                this.isTopScrollBlock = false;
	                this.control.onTopScrollUnblock();
	            }
	        }
	        if (this.areMovesEqual(this.yMove, maxYMove)) {
	            if (!this.isBottomScrollBlock) {
	                this.isBottomScrollBlock = true;
	                this.control.onBottomScrollBlock();
	            }
	        }
	        else {
	            if (this.isBottomScrollBlock) {
	                this.isBottomScrollBlock = false;
	                this.control.onBottomScrollUnblock();
	            }
	        }
	    };
	    ViewPort.prototype.setIsProductTooltipEnabled = function () {
	        var maxTooltipWidth = Math.max(PRODUCT_TOOLTIP_VERTICAL_WIDTH, PRODUCT_TOOLTIP_HORIZONTAL_WIDTH) * 1.1;
	        var maxTooltipHeight = Math.max(PRODUCT_TOOLTIP_VERTICAL_HEIGHT, PRODUCT_TOOLTIP_HORIZONTAL_HEIGHT) * 1.15;
	        this.isProductTooltipEnabled = this.canvasWidth > maxTooltipWidth && this.canvasHeight > maxTooltipHeight;
	    };
	    ViewPort.prototype.areMovesEqual = function (move1, move2) {
	        return Math.abs(move1 - move2) < 1;
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

	var setTimedInterval = __webpack_require__(5);
	var loadImage = __webpack_require__(6);
	var BASE_IMG_URL = '/DesktopModules/RossmannV4Modules/Shelves2/Img/icons/';
	var TOP_IMG_URL = BASE_IMG_URL + 'scroll-top.png';
	var HOVER_TOP_IMG_URL = BASE_IMG_URL + 'scroll-top-hover.png';
	var LEFT_IMG_URL = BASE_IMG_URL + 'scroll-left.png';
	var HOVER_LEFT_IMG_URL = BASE_IMG_URL + 'scroll-left-hover.png';
	var RIGHT_IMG_URL = BASE_IMG_URL + 'scroll-right.png';
	var HOVER_RIGHT_IMG_URL = BASE_IMG_URL + 'scroll-right-hover.png';
	var BOTTOM_IMG_URL = BASE_IMG_URL + 'scroll-bottom.png';
	var HOVER_BOTTOM_IMG_URL = BASE_IMG_URL + 'scroll-bottom-hover.png';
	var PLUS_IMG_URL = BASE_IMG_URL + 'zoom-plus.png';
	var HOVER_PLUS_IMG_URL = BASE_IMG_URL + 'zoom-plus-hover.png';
	var MINUS_IMG_URL = BASE_IMG_URL + 'zoom-minus.png';
	var HOVER_MINUS_IMG_URL = BASE_IMG_URL + 'zoom-minus-hover.png';
	var CONTROL_ICONS = [
	    TOP_IMG_URL, HOVER_TOP_IMG_URL,
	    LEFT_IMG_URL, HOVER_LEFT_IMG_URL,
	    RIGHT_IMG_URL, HOVER_RIGHT_IMG_URL,
	    BOTTOM_IMG_URL, HOVER_BOTTOM_IMG_URL,
	    PLUS_IMG_URL, HOVER_PLUS_IMG_URL,
	    MINUS_IMG_URL, HOVER_MINUS_IMG_URL
	];
	var LEFT_ARROW_KEY_CODE = 37;
	var UP_ARROW_KEY_CODE = 38;
	var RIGHT_ARROW_KEY_CODE = 39;
	var DOWN_ARROW_KEY_CODE = 40;
	var SPACE_KEY_CODE = 32;
	var Control = (function () {
	    function Control(viewPort, container) {
	        this.viewPort = viewPort;
	        this.container = container;
	        this.events = viewPort.getEvents();
	    }
	    Control.prototype.init = function () {
	        this.controlDiv = this.container.querySelector('.control');
	        this.placeControl();
	        this.bindControl();
	        this.hideTopAndBottomBtns();
	        this.refreshZoomIcon();
	        this.showControlAfterIconsLoaded();
	    };
	    Control.prototype.onZoomChange = function () {
	        this.refreshZoomIcon();
	        if (this.viewPort.checkIfMagnified()) {
	            this.showTopAndBottomBtnsIfScrollUnblock();
	        }
	        else {
	            this.hideTopAndBottomBtns();
	        }
	    };
	    Control.prototype.onTopScrollBlock = function () {
	        this.hideTopBtn();
	    };
	    Control.prototype.onTopScrollUnblock = function () {
	        this.showTopBtn();
	    };
	    Control.prototype.onBottomScrollBlock = function () {
	        this.hideBottomBtn();
	    };
	    Control.prototype.onBottomScrollUnblock = function () {
	        this.showBottomBtn();
	    };
	    Control.prototype.placeControl = function () {
	        var _this = this;
	        var header = document.getElementById('header_desktop');
	        var MAX_PAGE_LOAD = 5;
	        var INTERVAL = 100;
	        if (header) {
	            setTimedInterval(function () {
	                var left = header.getBoundingClientRect().left;
	                _this.controlDiv.style.left = left + 'px';
	            }, INTERVAL, MAX_PAGE_LOAD);
	        }
	        else {
	            console.error('#header_desktop element doesnt exist');
	            this.controlDiv.style.left = '0';
	        }
	    };
	    Control.prototype.bindControl = function () {
	        var _this = this;
	        this.left = this.controlDiv.querySelector('.left');
	        this.right = this.controlDiv.querySelector('.right');
	        this.top = this.controlDiv.querySelector('.top');
	        this.bottom = this.controlDiv.querySelector('.bottom');
	        this.middle = this.controlDiv.querySelector('.middle');
	        this.changeIconOnHover(this.left, LEFT_IMG_URL, HOVER_LEFT_IMG_URL);
	        this.changeIconOnHover(this.right, RIGHT_IMG_URL, HOVER_RIGHT_IMG_URL);
	        this.changeIconOnHover(this.top, TOP_IMG_URL, HOVER_TOP_IMG_URL);
	        this.changeIconOnHover(this.bottom, BOTTOM_IMG_URL, HOVER_BOTTOM_IMG_URL);
	        this.changeZoomIconOnHover(this.middle);
	        this.events.addEventListener(this.left, 'click', function (e) {
	            _this.viewPort.control_left();
	        });
	        this.events.addEventListener(this.right, 'click', function (e) {
	            _this.viewPort.control_right();
	        });
	        this.events.addEventListener(this.top, 'click', function (e) {
	            _this.viewPort.control_top();
	        });
	        this.events.addEventListener(this.bottom, 'click', function (e) {
	            _this.viewPort.control_bottom();
	        });
	        this.events.addEventListener(this.middle, 'click', function (e) {
	            _this.handleMiddle();
	        });
	        this.events.addEventListener(document, 'keydown', function (e) {
	            var nodeName = e.target.nodeName.toLowerCase();
	            if (nodeName === 'input' || nodeName === 'textarea') {
	                return;
	            }
	            if (e.keyCode) {
	                if (e.keyCode === LEFT_ARROW_KEY_CODE) {
	                    e.preventDefault();
	                    _this.viewPort.control_left();
	                }
	                else if (e.keyCode === RIGHT_ARROW_KEY_CODE) {
	                    e.preventDefault();
	                    _this.viewPort.control_right();
	                }
	                else if (e.keyCode === UP_ARROW_KEY_CODE) {
	                    e.preventDefault();
	                    _this.viewPort.control_top();
	                }
	                else if (e.keyCode === DOWN_ARROW_KEY_CODE) {
	                    e.preventDefault();
	                    _this.viewPort.control_bottom();
	                }
	                else if (e.keyCode === SPACE_KEY_CODE) {
	                    e.preventDefault();
	                    _this.handleMiddle();
	                }
	            }
	        });
	    };
	    Control.prototype.handleMiddle = function () {
	        if (!this.viewPort.checkIfAnimationsInProgressExists()) {
	            if (this.viewPort.checkIfMagnified()) {
	                this.viewPort.control_unzoom();
	                this.middle.src = HOVER_PLUS_IMG_URL;
	            }
	            else {
	                this.viewPort.control_zoom();
	                this.middle.src = HOVER_MINUS_IMG_URL;
	            }
	        }
	    };
	    Control.prototype.changeIconOnHover = function (img, iconUrl, hoverIconUrl) {
	        this.events.addEventListener(img, 'mouseover', function () {
	            img.src = hoverIconUrl;
	        });
	        this.events.addEventListener(img, 'mouseout', function () {
	            img.src = iconUrl;
	        });
	    };
	    Control.prototype.changeZoomIconOnHover = function (img) {
	        var _this = this;
	        this.events.addEventListener(img, 'mouseover', function () {
	            if (_this.viewPort.checkIfMagnified()) {
	                _this.middle.src = HOVER_MINUS_IMG_URL;
	            }
	            else {
	                _this.middle.src = HOVER_PLUS_IMG_URL;
	            }
	        });
	        this.events.addEventListener(img, 'mouseout', function () {
	            _this.refreshZoomIcon();
	        });
	    };
	    Control.prototype.refreshZoomIcon = function () {
	        if (this.viewPort.checkIfMagnified()) {
	            this.middle.src = MINUS_IMG_URL;
	        }
	        else {
	            this.middle.src = PLUS_IMG_URL;
	        }
	    };
	    Control.prototype.showTopAndBottomBtnsIfScrollUnblock = function () {
	        if (!this.viewPort.checkIfTopScrollBlock()) {
	            this.showTopBtn();
	        }
	        if (!this.viewPort.checkIfBottomScrollBlock()) {
	            this.showBottomBtn();
	        }
	    };
	    Control.prototype.showTopBtn = function () {
	        this.top.classList.remove('disactivated');
	    };
	    Control.prototype.showBottomBtn = function () {
	        this.bottom.classList.remove('disactivated');
	    };
	    Control.prototype.hideTopAndBottomBtns = function () {
	        this.hideTopBtn();
	        this.hideBottomBtn();
	    };
	    Control.prototype.hideTopBtn = function () {
	        this.top.classList.add('disactivated');
	    };
	    Control.prototype.hideBottomBtn = function () {
	        this.bottom.classList.add('disactivated');
	    };
	    Control.prototype.showControlAfterIconsLoaded = function () {
	        var _this = this;
	        this.loadIcons().then(function () {
	            _this.controlDiv.style.display = 'block';
	        });
	    };
	    Control.prototype.loadIcons = function () {
	        var promises = _.map(CONTROL_ICONS, function (icon) { return loadImage(icon); });
	        return Promise.all(promises);
	    };
	    return Control;
	})();
	module.exports = Control;


/***/ },
/* 5 */
/***/ function(module, exports) {

	function setTimedInterval(f, interval, time) {
	    'use strict';
	    f();
	    var startTime = Date.now();
	    var intervalId = setInterval(function () {
	        if ((Date.now() - startTime) / 1000 >= time) {
	            clearInterval(intervalId);
	        }
	        else {
	            f();
	        }
	    }, interval);
	}
	module.exports = setTimedInterval;


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

	var ImageType = __webpack_require__(8);
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
	        this.addImage(ImageType.PegboardHook, 'pegboardHook.png');
	        this.addImage(ImageType.PriceBackground, 'priceBackground.png');
	        this.addImage(ImageType.PromoPriceBackground, 'promoPriceBackground.png');
	        this.addImage(ImageType.NewProduct, 'newProduct.png');
	        this.addImage(ImageType.SpecialProduct, 'specialProduct3.png');
	        this.addImage(ImageType.SuperOfferProduct, 'superOfferProduct.png');
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
/* 8 */
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
	    ImageType[ImageType["PegboardHook"] = 7] = "PegboardHook";
	    ImageType[ImageType["PriceBackground"] = 8] = "PriceBackground";
	    ImageType[ImageType["PromoPriceBackground"] = 9] = "PromoPriceBackground";
	    ImageType[ImageType["NewProduct"] = 10] = "NewProduct";
	    ImageType[ImageType["SpecialProduct"] = 11] = "SpecialProduct";
	    ImageType[ImageType["SuperOfferProduct"] = 12] = "SuperOfferProduct";
	})(ImageType || (ImageType = {}));
	module.exports = ImageType;


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var Segment = __webpack_require__(10);
	var SegmentPrepender = __webpack_require__(19);
	var SegmentAppender = __webpack_require__(21);
	var FlashLoader = __webpack_require__(22);
	var DOUBLE_COMPARISON_DIFF = 1;
	var SegmentController = (function () {
	    function SegmentController(viewPort, segmentsData, segmentWidths, startPosition, startProductId, noFlash) {
	        var _this = this;
	        this.viewPort = viewPort;
	        this.segmentsData = segmentsData;
	        this.segmentWidths = segmentWidths;
	        this.startPosition = startPosition;
	        this.startProductId = startProductId;
	        this.segments = new Array();
	        this.notDrawnSegmentCount = 0;
	        this.effectsRenderingCount = 0;
	        var appenderArgs = {
	            INITIAL_SCALE: viewPort.getInitialScale(),
	            CANVAS_WIDTH: viewPort.getCanvasWidth(),
	            SEGMENT_WIDTHS: segmentWidths,
	            START_SEGMENT_INDEX: startPosition.segmentIndex,
	            START_X: startPosition.x,
	            segments: this.segments,
	            createSegment: function (index, x, width) {
	                var id = _this.segmentsData[index].id;
	                var segment = new Segment(viewPort, _this, index, id, x, width);
	                return segment;
	            }
	        };
	        this.prepender = new SegmentPrepender(appenderArgs);
	        this.appender = new SegmentAppender(appenderArgs);
	        var makeFlash = function (segmentId) {
	            var segment = _.find(_this.segments, function (s) { return s.getId() === segmentId; });
	            segment.flash();
	        };
	        this.flashLoader = noFlash ? null : new FlashLoader(startPosition.segments, makeFlash);
	    }
	    SegmentController.prototype.getStartPosition = function () { return this.startPosition; };
	    SegmentController.prototype.onClick = function (e) {
	        var scale = this.viewPort.getScale();
	        e.x = (e.x - this.viewPort.getXMove()) / scale;
	        e.y = (e.y - this.viewPort.getYMove() - this.viewPort.getY()) / scale;
	        var clickedSegment;
	        for (var _i = 0, _a = this.segments; _i < _a.length; _i++) {
	            var segment = _a[_i];
	            if (segment.isClicked(e.x, e.y)) {
	                clickedSegment = segment;
	                break;
	            }
	        }
	        if (clickedSegment) {
	            if (this.viewPort.checkIfMagnified()) {
	                clickedSegment.showProductIfClicked(e);
	            }
	            clickedSegment.fitOnViewPort(e.y);
	        }
	        else {
	            console.error('cannot find clicked segment');
	        }
	    };
	    SegmentController.prototype.handleProductQuantityChanged = function () {
	        for (var _i = 0, _a = this.segments; _i < _a.length; _i++) {
	            var segment = _a[_i];
	            segment.handleProductQuantityChanged();
	        }
	    };
	    SegmentController.prototype.checkIfNonDrawnSegmentsExistsAndReset = function () {
	        var nonDrawnSegmentsExists = this.notDrawnSegmentCount > 0;
	        this.notDrawnSegmentCount = 0;
	        return nonDrawnSegmentsExists;
	    };
	    SegmentController.prototype.checkIfAnyPreloadingSegmentsExists = function () {
	        return _.find(this.segments, function (s) { return s.checkIfPreloading(); }) != null;
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
	        var visibleAndNotReadySegmentsExists = this.visibleAndNotReadySegmentsExists();
	        for (var _i = 0, _a = this.segments; _i < _a.length; _i++) {
	            var segment = _a[_i];
	            if (!segment.checkIfLoading()) {
	                if (segment.isInCanvasVisibleArea()) {
	                    segment.load();
	                }
	                else if (!visibleAndNotReadySegmentsExists) {
	                    segment.load();
	                }
	            }
	        }
	        for (var _b = 0, _c = this.segments; _b < _c.length; _b++) {
	            var segment = _c[_b];
	            segment.releaseCanvasIfNotInUse();
	        }
	        for (var _d = 0, _e = this.segments; _d < _e.length; _d++) {
	            var segment = _e[_d];
	            segment.createCanvasIfNecessary();
	        }
	        var xMove = this.viewPort.getXMove();
	        var scale = this.viewPort.getScale();
	        var initialScale = this.viewPort.getInitialScale();
	        xMove *= initialScale / scale;
	        var wasSegmentsAppended = this.appender.work(xMove);
	        var wasSegmentsPrepended = this.prepender.work(xMove);
	        var mustBeRedraw = wasSegmentsAppended || wasSegmentsPrepended;
	        if (mustBeRedraw) {
	            this.notDrawnSegmentCount++;
	        }
	        if (this.flashLoader) {
	            if (this.viewPort.getXMove() !== 0) {
	                this.flashLoader = null;
	                this.effectsRenderingCount = 0;
	            }
	            else if (this.flashLoader.canBeFlashed()) {
	                this.flashLoader.flash();
	                this.flashLoader = null;
	            }
	            else {
	                for (var _f = 0, _g = this.segments; _f < _g.length; _f++) {
	                    var segment = _g[_f];
	                    if (!segment.isInCanvasVisibleArea()) {
	                        this.flashLoader.segmentUnvisibled(segment.getId());
	                    }
	                }
	            }
	        }
	    };
	    SegmentController.prototype.visibleAndNotReadySegmentsExists = function () {
	        for (var _i = 0, _a = this.segments; _i < _a.length; _i++) {
	            var segment = _a[_i];
	            if (segment.isInCanvasVisibleArea() && !segment.checkIfCanDrawCanvas()) {
	                return true;
	            }
	        }
	        return false;
	    };
	    SegmentController.prototype.handleSegmentDataLoaded = function (segment) {
	        if (this.startProductId) {
	            if (segment.hasProduct(this.startProductId)) {
	                segment.showProduct(this.startProductId);
	                this.startProductId = null;
	            }
	        }
	    };
	    SegmentController.prototype.segmentLoaded = function (event) {
	        if (this.flashLoader) {
	            this.flashLoader.segmentLoaded(event);
	        }
	        this.notDrawnSegmentCount++;
	    };
	    SegmentController.prototype.fitMiddleSegmentOnViewPort = function () {
	        var segment = this.getSegmentByCoords(this.viewPort.getCanvasWidth() / 2, 0);
	        if (segment) {
	            segment.fitOnViewPort();
	        }
	    };
	    SegmentController.prototype.getMiddleSegment = function () {
	        var segment = this.getSegmentByCoords(this.viewPort.getCanvasWidth() / 2, 0);
	        return segment;
	    };
	    SegmentController.prototype.fitLeftSegmentOnViewPort = function () {
	        var segments = _.sortBy(this.segments, function (s) { return -s.getX(); });
	        var canvasWidth = this.viewPort.getCanvasWidth();
	        var middleX = (-this.viewPort.getXMove() + canvasWidth / 2) / this.viewPort.getZoomScale();
	        for (var _i = 0; _i < segments.length; _i++) {
	            var segment = segments[_i];
	            var segmentMiddleX = segment.getX() + segment.getWidth() / 2;
	            if (middleX - DOUBLE_COMPARISON_DIFF > segmentMiddleX) {
	                segment.fitOnViewPort();
	                return;
	            }
	        }
	    };
	    SegmentController.prototype.fitRightSegmentOnViewPort = function () {
	        var segments = _.sortBy(this.segments, function (s) { return s.getX(); });
	        var canvasWidth = this.viewPort.getCanvasWidth();
	        var middleX = (-this.viewPort.getXMove() + canvasWidth / 2) / this.viewPort.getZoomScale();
	        for (var _i = 0; _i < segments.length; _i++) {
	            var segment = segments[_i];
	            var segmentMiddleX = segment.getX() + segment.getWidth() / 2;
	            if (middleX + DOUBLE_COMPARISON_DIFF < segmentMiddleX) {
	                segment.fitOnViewPort();
	                return;
	            }
	        }
	    };
	    SegmentController.prototype.handleMouseMove = function (x, y) {
	        x = (x - this.viewPort.getXMove()) / this.viewPort.getScale();
	        y = (y - this.viewPort.getYMove()) / this.viewPort.getScale();
	        for (var _i = 0, _a = this.segments; _i < _a.length; _i++) {
	            var segment = _a[_i];
	            if (x >= segment.getX() && x <= segment.getX() + segment.getWidth()) {
	                segment.handleMouseMove(x, y);
	            }
	            else {
	                segment.handleMouseOut();
	            }
	        }
	    };
	    SegmentController.prototype.isClickable = function (x, y) {
	        x = (x - this.viewPort.getXMove()) / this.viewPort.getScale();
	        y = (y - this.viewPort.getYMove()) / this.viewPort.getScale();
	        for (var _i = 0, _a = this.segments; _i < _a.length; _i++) {
	            var segment = _a[_i];
	            if (x >= segment.getX() && x <= segment.getX() + segment.getWidth()) {
	                return segment.isClickable(x, y);
	            }
	        }
	        return false;
	    };
	    SegmentController.prototype.unload = function () {
	        for (var _i = 0, _a = this.segments; _i < _a.length; _i++) {
	            var segment = _a[_i];
	            segment.unload();
	        }
	    };
	    SegmentController.prototype.getSegmentByCoords = function (x, y) {
	        var scale = this.viewPort.getScale();
	        x = (x - this.viewPort.getXMove()) / scale;
	        y = (y - this.viewPort.getYMove() - this.viewPort.getY()) / scale;
	        for (var _i = 0, _a = this.segments; _i < _a.length; _i++) {
	            var segment = _a[_i];
	            if (segment.isClicked(x, y)) {
	                return segment;
	            }
	        }
	        return null;
	    };
	    return SegmentController;
	})();
	module.exports = SegmentController;


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var SegmentRepository = __webpack_require__(11);
	var TextType = __webpack_require__(13);
	var ImageType = __webpack_require__(8);
	var loadImage = __webpack_require__(14);
	var createWhitePixelImg = __webpack_require__(15);
	var Images = __webpack_require__(16);
	var FlashEffect = __webpack_require__(17);
	var CartDict = __webpack_require__(18);
	var segmentRepository = new SegmentRepository();
	var SEGMENT_COLOR = '#D2D1CC';
	var DARK_SEGMENT_COLOR = '#666666';
	var SEGMENT_BORDER_LINE_WIDTH = 2;
	var CURVE_R = 5;
	var QUANTITY_CIRCLE_R = 20;
	var TEXT_TYPE_FONT = {};
	TEXT_TYPE_FONT[TextType.Price] = 'bold 11px Arial';
	TEXT_TYPE_FONT[TextType.PromoPrice] = 'bold 11px Arial';
	TEXT_TYPE_FONT[TextType.OldPrice] = 'bold 9px Arial';
	TEXT_TYPE_FONT[TextType.Header] = '27px Arial';
	var TEXT_TYPE_COLOR = {};
	TEXT_TYPE_COLOR[TextType.Price] = '#333333';
	TEXT_TYPE_COLOR[TextType.PromoPrice] = '#333333';
	TEXT_TYPE_COLOR[TextType.OldPrice] = '#333333';
	TEXT_TYPE_COLOR[TextType.Header] = '#0067B2';
	var TEXT_TYPE_ALIGN = {};
	TEXT_TYPE_ALIGN[TextType.Price] = 'right';
	TEXT_TYPE_ALIGN[TextType.PromoPrice] = 'right';
	TEXT_TYPE_ALIGN[TextType.OldPrice] = 'left';
	TEXT_TYPE_ALIGN[TextType.Header] = 'center';
	var TEXT_TYPE_BASE_LINE = {};
	TEXT_TYPE_BASE_LINE[TextType.Price] = 'middle';
	TEXT_TYPE_BASE_LINE[TextType.Price] = 'middle';
	TEXT_TYPE_BASE_LINE[TextType.OldPrice] = 'middle';
	TEXT_TYPE_BASE_LINE[TextType.Header] = 'middle';
	var Segment = (function () {
	    function Segment(viewPort, segmentController, index, id, x, width) {
	        this.viewPort = viewPort;
	        this.segmentController = segmentController;
	        this.index = index;
	        this.id = id;
	        this.x = x;
	        this.width = width;
	        this.isDrawnAtLeastOne = false;
	        this.isLoading = false;
	        this.isLoaded = false;
	        this.canDrawCanvas = false;
	        this.isProductTooltipOpen = false;
	        this.requestInProgressPromise = null;
	        this.cartDict = CartDict.GetInstance();
	        this.height = this.viewPort.getSegmentHeight();
	        this.ctx = viewPort.getCanvasContext();
	        this.middleX = this.x + this.width / 2;
	    }
	    Segment.prototype.getIndex = function () { return this.index; };
	    Segment.prototype.getId = function () { return this.id; };
	    Segment.prototype.getX = function () { return this.x; };
	    Segment.prototype.getWidth = function () { return this.width; };
	    Segment.prototype.getPlanogramUrl = function () { return this.planogramUrl; };
	    Segment.prototype.getPlanogramId = function () { return this.plnId; };
	    Segment.prototype.getSeoTitle = function () { return this.seoTitle; };
	    Segment.prototype.checkIfDrawnAtLeastOne = function () { return this.isDrawnAtLeastOne; };
	    Segment.prototype.checkIfLoading = function () { return this.isLoading; };
	    Segment.prototype.checkIfPreloading = function () { return this.isInCanvasVisibleArea() && !this.isLoaded; };
	    Segment.prototype.checkIfCanDrawCanvas = function () { return this.canDrawCanvas; };
	    Segment.prototype.load = function () {
	        var _this = this;
	        this.isLoading = true;
	        return this.viewPort.getKnownImages().then(function (images) {
	            _this.knownImgs = images;
	            var getByIdPromise = _this.requestInProgressPromise = segmentRepository.getById(_this.id);
	            return getByIdPromise;
	        }).then(function (data) {
	            _this.zoomWidth = Math.min(_this.width * _this.viewPort.getZoomScale(), _this.viewPort.getMaxCanvasWidth());
	            _this.zoomHeight = Math.min(_this.height * _this.viewPort.getZoomScale(), _this.viewPort.getMaxCanvasHeight());
	            _this.knownImages1 = data.knownImages1;
	            _this.knownImages2 = data.knownImages2;
	            _this.productIcons = data.productIcons;
	            _this.images = data.images;
	            _this.headerTitleFrames = data.headerTitleFrames;
	            _this.prices = data.prices;
	            _this.hookPrices = data.hookPrices;
	            _this.texts = data.texts;
	            _this.productPositions = data.productPositions;
	            _this.debugPlaces = data.debugPlaces;
	            _this.plnId = data.plnId;
	            _this.planogramUrl = data.planogramUrl;
	            _this.seoTitle = data.seoTitle;
	            _this.segmentController.handleSegmentDataLoaded(_this);
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
	            _this.canDrawCanvas = true;
	        });
	    };
	    Segment.prototype.draw = function (timestamp) {
	        if (this.isInCanvasVisibleArea()) {
	            if (this.isLoaded) {
	                this.ctx.drawImage(this.canvas, 0, 0, this.zoomWidth, this.zoomHeight, this.x, 0, this.width, this.height);
	                if (this.flashEffect) {
	                    if (this.flashEffect.isEnded()) {
	                        this.flashEffect = null;
	                        this.segmentController.reportEffectRenderingStop();
	                    }
	                    else {
	                        this.flashEffect.flash(timestamp, this.x, 0, this.width, this.height);
	                    }
	                }
	            }
	            else {
	                this.ctx.fillStyle = SEGMENT_COLOR;
	                this.ctx.fillRect(this.x, 0, this.width, this.height);
	                this.ctx.strokeStyle = DARK_SEGMENT_COLOR;
	                this.ctx.lineWidth = SEGMENT_BORDER_LINE_WIDTH;
	                this.ctx.strokeRect(this.x, 0, this.width, this.height);
	                var scale = this.viewPort.getScale();
	                var middleY = (this.viewPort.getCanvasHeight() / 2 - this.viewPort.getYMove()) / scale;
	                var preloader = this.viewPort.getPreloader().getCanvas();
	                var preloaderWidth = preloader.width / scale;
	                var preloaderHeight = preloader.height / scale;
	                this.ctx.drawImage(preloader, this.middleX - preloaderWidth / 2, middleY - preloaderHeight / 2, preloaderWidth, preloaderHeight);
	            }
	        }
	        this.isDrawnAtLeastOne = true;
	    };
	    Segment.prototype.createCanvasIfNecessary = function () {
	        if (this.canDrawCanvas && !this.canvas && this.isInCanvasVisibleArea()) {
	            this.canvas = this.createCanvas();
	            this.isLoaded = true;
	            this.segmentController.segmentLoaded({ segmentId: this.id });
	        }
	    };
	    Segment.prototype.releaseCanvasIfNotInUse = function () {
	        if (this.isLoaded && !this.isInCanvasVisibleArea()) {
	            this.isLoaded = false;
	            this.viewPort.getCanvasPool().release(this.canvas);
	            this.canvas = null;
	        }
	    };
	    Segment.prototype.isClicked = function (x, y) {
	        return x >= this.x && x <= this.x + this.width;
	    };
	    Segment.prototype.isClickable = function (x, y) {
	        if (this.isLoaded) {
	            for (var _i = 0, _a = this.productPositions; _i < _a.length; _i++) {
	                var product = _a[_i];
	                if (x >= this.x + product.dx
	                    && x <= this.x + product.dx + product.w
	                    && y >= product.dy
	                    && y <= product.dy + product.h) {
	                    return true;
	                }
	            }
	        }
	        return false;
	    };
	    Segment.prototype.handleMouseMove = function (x, y) {
	        if (this.isLoaded) {
	            var product = this.getProductUnderCursor(x, y);
	            var tempHighlightedPrice = this.highlightedPrice;
	            var tempHighlightedProductPositions = this.hightlightedProductPositions;
	            var tempHighlightedProductIcon = this.highlightedProductIcon;
	            if (product) {
	                this.isProductTooltipOpen = true;
	                if (this.viewPort.checkIfProductTooltipEnabled()) {
	                    Rossmann.Modules.Shelves2.queueShowingProductTooltip({
	                        planogramProductId: product.ppId,
	                        //x, y relative to page
	                        productId: product.productId,
	                        productName: product.name,
	                        x: this.viewPort.getXMove() + (this.x + product.dx + product.w / 2) * this.viewPort.getScale(),
	                        y: this.viewPort.getY() + this.viewPort.getYMove() + (product.dy + product.h / 2) * this.viewPort.getScale(),
	                        width: product.w,
	                        height: product.h,
	                        photoUrl: product.photoUrl,
	                        photoRatio: product.photoRatio,
	                        minY: this.viewPort.getY()
	                    });
	                }
	                this.hightlightedProductPositions = [product];
	                var price = _.find(this.prices, function (p) { return p.priceId === product.priceId; });
	                if (!price) {
	                    price = _.find(this.hookPrices, function (p) { return p.priceId === product.priceId; });
	                }
	                this.highlightedPrice = price;
	                var productIcon = _.find(this.productIcons, function (p) { return p.ppId === product.ppId; });
	                this.highlightedProductIcon = productIcon;
	            }
	            else {
	                this.hightlightedProductPositions = null;
	                this.highlightedPrice = null;
	                this.highlightedProductIcon = null;
	                this.isProductTooltipOpen = false;
	                Rossmann.Modules.Shelves2.closeProductTooltip();
	            }
	            if (this.hightlightedProductPositions !== tempHighlightedProductPositions
	                || this.highlightedPrice !== tempHighlightedPrice
	                || this.highlightedProductIcon !== tempHighlightedProductIcon) {
	                this.drawCanvas(this.canvas);
	                this.segmentController.segmentLoaded({ segmentId: this.id });
	            }
	        }
	    };
	    Segment.prototype.handleMouseOut = function () {
	        if (this.isLoaded) {
	            var tempHighlightedPrice = this.highlightedPrice;
	            var tempHighlightedProductPositions = this.hightlightedProductPositions;
	            var tempHighlightedProductIcon = this.highlightedProductIcon;
	            this.highlightedPrice = null;
	            this.hightlightedProductPositions = null;
	            this.highlightedProductIcon = null;
	            if (this.hightlightedProductPositions !== tempHighlightedProductPositions
	                || this.highlightedPrice !== tempHighlightedPrice
	                || this.highlightedProductIcon !== tempHighlightedProductIcon) {
	                this.drawCanvas(this.canvas);
	                this.segmentController.segmentLoaded({ segmentId: this.id });
	            }
	            if (this.isProductTooltipOpen) {
	                this.isProductTooltipOpen = false;
	                Rossmann.Modules.Shelves2.closeProductTooltip();
	            }
	        }
	    };
	    Segment.prototype.handleProductQuantityChanged = function () {
	        if (this.isLoaded) {
	            this.drawCanvas(this.canvas);
	            this.segmentController.segmentLoaded({ segmentId: this.id });
	        }
	    };
	    Segment.prototype.showProductIfClicked = function (e) {
	        var product = this.getProductUnderCursor(e.x, e.y);
	        if (product) {
	            Rossmann.Modules.Shelves2.showProduct(product.ppId, product.productId);
	        }
	    };
	    Segment.prototype.isInCanvasVisibleArea = function () {
	        var xMove = this.viewPort.getXMove();
	        var scale = this.viewPort.getScale();
	        var canvasWidth = this.viewPort.getCanvasWidth();
	        var isBeforeVisibleArea = xMove / scale + this.x + this.width <= 0;
	        var isAfterVisibleArea = xMove / scale - canvasWidth / scale + this.x >= 0;
	        return !isBeforeVisibleArea && !isAfterVisibleArea;
	    };
	    Segment.prototype.fitOnViewPort = function (y) {
	        var zoomScale = this.viewPort.getZoomScale();
	        var canvasWidth = this.viewPort.getCanvasWidth();
	        var xMove = (canvasWidth - this.width * zoomScale) / 2 - this.x * zoomScale;
	        var canvasHeight = this.viewPort.getCanvasHeight();
	        var yMove = canvasHeight / 2 - y * zoomScale;
	        var animateInputs = new Array();
	        animateInputs.push({ propertyName: 'xMove', endValue: xMove });
	        if (y != null) {
	            animateInputs.push({ propertyName: 'yMove', endValue: yMove });
	        }
	        var scale = this.viewPort.getScale();
	        if (scale !== zoomScale) {
	            animateInputs.push({ propertyName: 'scale', endValue: zoomScale });
	            this.viewPort.notifyAboutZoomChange(true);
	        }
	        this.viewPort.animateBatch(animateInputs);
	    };
	    Segment.prototype.flash = function () {
	        this.flashEffect = new FlashEffect(this.ctx);
	        this.segmentController.reportEffectRenderingStart();
	    };
	    Segment.prototype.hasProduct = function (productId) {
	        return _.find(this.productPositions, function (p) { return p.productId === productId; }) != null;
	    };
	    Segment.prototype.showProduct = function (productId) {
	        var product = this.getProduct(productId);
	        this.fitOnViewPort(product.dy);
	        Rossmann.Modules.Shelves2.showProduct(product.ppId, product.productId);
	    };
	    Segment.prototype.getProduct = function (productId) {
	        return _.find(this.productPositions, function (p) { return p.productId === productId; });
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
	        this.drawCanvas(canvas);
	        return canvas;
	    };
	    Segment.prototype.drawCanvas = function (canvas) {
	        var ctx = canvas.getContext('2d');
	        ctx.save();
	        ctx.scale(this.viewPort.getZoomScale(), this.viewPort.getZoomScale());
	        ctx.fillStyle = SEGMENT_COLOR;
	        ctx.fillRect(0, 0, this.width, this.height);
	        this.drawKnownImages(ctx, this.knownImages1);
	        for (var _i = 0, _a = this.images; _i < _a.length; _i++) {
	            var image = _a[_i];
	            var img = this.imgs.getByUrl(image.url);
	            if (image.w && image.h) {
	                ctx.drawImage(img, image.dx, image.dy, image.w, image.h);
	            }
	            else {
	                ctx.drawImage(img, image.dx, image.dy);
	            }
	        }
	        this.drawKnownImages(ctx, this.knownImages2);
	        ctx.font = TEXT_TYPE_FONT[TextType.Header];
	        var maxHeaderTitleWidth = 0;
	        for (var _b = 0, _c = this.headerTitleFrames; _b < _c.length; _b++) {
	            var f = _c[_b];
	            maxHeaderTitleWidth = Math.max(ctx.measureText(' ' + f.value + ' ').width, maxHeaderTitleWidth);
	        }
	        ctx.fillStyle = 'white';
	        for (var _d = 0, _e = this.headerTitleFrames; _d < _e.length; _d++) {
	            var f = _e[_d];
	            ctx.shadowColor = 'black';
	            ctx.shadowBlur = 20;
	            ctx.shadowOffsetX = 0;
	            ctx.shadowOffsetY = 0;
	            var w = maxHeaderTitleWidth;
	            var h = f.h;
	            var dx = (f.headerWidth - w) / 2;
	            var dy = f.dy;
	            ctx.beginPath();
	            ctx.moveTo(dx + CURVE_R, dy);
	            ctx.lineTo(dx + w - CURVE_R, dy);
	            ctx.quadraticCurveTo(dx + w, dy, dx + w, dy + CURVE_R);
	            ctx.lineTo(dx + w, dy + h - CURVE_R);
	            ctx.quadraticCurveTo(dx + w, dy + h, dx + w - CURVE_R, dy + h);
	            ctx.lineTo(dx + CURVE_R, dy + h);
	            ctx.quadraticCurveTo(dx, dy + h, dx, dy + h - CURVE_R);
	            ctx.lineTo(dx, dy + CURVE_R);
	            ctx.quadraticCurveTo(dx, dy, dx + CURVE_R, dy);
	            ctx.closePath();
	            ctx.fill();
	        }
	        ctx.shadowBlur = 0;
	        for (var _f = 0, _g = this.texts; _f < _g.length; _f++) {
	            var text = _g[_f];
	            this.drawText(ctx, text);
	        }
	        for (var _h = 0, _j = this.productPositions; _h < _j.length; _h++) {
	            var p = _j[_h];
	            ctx.drawImage(this.spriteImg, p.sx, p.sy, p.w, p.h, p.dx, p.dy, p.w, p.h);
	        }
	        for (var _k = 0, _l = this.prices; _k < _l.length; _k++) {
	            var price = _l[_k];
	            this.drawPrice(ctx, price);
	        }
	        this.drawKnownImages(ctx, this.productIcons);
	        for (var _m = 0, _o = this.hookPrices; _m < _o.length; _m++) {
	            var price = _o[_m];
	            this.drawPrice(ctx, price);
	        }
	        for (var _p = 0, _q = this.productPositions; _p < _q.length; _p++) {
	            var p = _q[_p];
	            if (p.isRightTopCorner) {
	                this.drawQuantity(ctx, p);
	            }
	        }
	        // debug only!
	        // let debugPlacesI = 0;
	        // let DEBUG_PLACES_COLORS = ['rgba(0, 255, 0, 0.3)', 'rgba(0, 0, 255, 0.3)', 'rgba(255, 0, 0, 0.3)'];
	        // for (let s of this.debugPlaces) {
	        //   ctx.beginPath();
	        //   ctx.fillStyle = DEBUG_PLACES_COLORS[debugPlacesI % DEBUG_PLACES_COLORS.length];
	        //   ctx.fillRect(s.dx, s.dy, s.w, s.h);
	        //   ctx.closePath();
	        //
	        //   debugPlacesI++;
	        // }
	        //debug only!
	        // ctx.font = 'bold 250px Ariel';
	        // ctx.fillStyle = 'black';
	        // ctx.textAlign = 'center';
	        // ctx.fillText(this.index.toString(), this.width / 2, 600);
	        this.drawHighlightedProductAndPrice(ctx);
	        ctx.strokeStyle = DARK_SEGMENT_COLOR;
	        ctx.lineWidth = SEGMENT_BORDER_LINE_WIDTH;
	        ctx.strokeRect(0, 0, this.width, this.height);
	        ctx.restore();
	    };
	    Segment.prototype.drawQuantity = function (ctx, p) {
	        var quantity = this.cartDict.getDict()[p.productId];
	        if (quantity && quantity > 0) {
	            var x = p.dx + p.w;
	            var y = p.dy;
	            ctx.fillStyle = '#00CC00';
	            ctx.beginPath();
	            ctx.arc(x, y, QUANTITY_CIRCLE_R, 0, 2 * Math.PI, false);
	            ctx.closePath();
	            ctx.fill();
	            ctx.font = 'bold 20px Ariel';
	            ctx.fillStyle = 'white';
	            ctx.textAlign = 'center';
	            ctx.textBaseline = 'middle';
	            ctx.fillText('+' + quantity, x, y);
	        }
	    };
	    Segment.prototype.drawHighlightedProductAndPrice = function (ctx) {
	        if (this.hightlightedProductPositions && this.highlightedPrice) {
	            ctx.shadowColor = '#ffd700';
	            ctx.shadowBlur = 20;
	            ctx.shadowOffsetX = 0;
	            ctx.shadowOffsetY = 0;
	            for (var _i = 0, _a = this.hightlightedProductPositions; _i < _a.length; _i++) {
	                var p_1 = _a[_i];
	                ctx.drawImage(this.spriteImg, p_1.sx, p_1.sy, p_1.w, p_1.h, p_1.dx, p_1.dy, p_1.w, p_1.h);
	            }
	            if (this.highlightedProductIcon) {
	                this.drawKnownImage(ctx, this.highlightedProductIcon);
	            }
	            this.drawPrice(ctx, this.highlightedPrice);
	            for (var _b = 0, _c = this.hightlightedProductPositions; _b < _c.length; _b++) {
	                var p = _c[_b];
	                var rightTopProduct = _.find(this.productPositions, function (pp) {
	                    return pp.ppId === p.ppId && pp.isRightTopCorner;
	                });
	                this.drawQuantity(ctx, rightTopProduct);
	            }
	            ctx.shadowBlur = 0;
	            ctx.shadowOffsetX = 0;
	            ctx.shadowOffsetY = 0;
	        }
	    };
	    Segment.prototype.drawPrice = function (ctx, price) {
	        if (price.imageType === ImageType.PromoPriceBackground) {
	            this.drawKnownImage(ctx, {
	                type: price.imageType,
	                dx: price.promoImageDx,
	                dy: price.imageDy
	            });
	            this.drawStrikethroughText(ctx, {
	                value: price.oldTextValue,
	                type: price.oldTextType,
	                dx: price.oldTextDx,
	                dy: price.oldTextDy
	            });
	            this.drawText(ctx, {
	                value: price.textValue,
	                type: price.promoTextType,
	                dx: price.promoTextDx,
	                dy: price.promoTextDy
	            });
	        }
	        else {
	            this.drawKnownImage(ctx, {
	                type: price.imageType,
	                dx: price.imageDx,
	                dy: price.imageDy
	            });
	            this.drawText(ctx, {
	                value: price.textValue,
	                type: price.textType,
	                dx: price.textDx,
	                dy: price.textDy
	            });
	        }
	    };
	    Segment.prototype.drawKnownImages = function (ctx, images) {
	        for (var _i = 0; _i < images.length; _i++) {
	            var image = images[_i];
	            this.drawKnownImage(ctx, image);
	        }
	    };
	    Segment.prototype.drawKnownImage = function (ctx, image) {
	        var img = this.knownImgs.getByType(image.type);
	        if (image.repeat) {
	            ctx.beginPath();
	            var pattern = ctx.createPattern(img, 'repeat');
	            ctx.fillStyle = pattern;
	            ctx.fillRect(image.dx, image.dy, image.w, image.h);
	        }
	        else if (image.w && image.h) {
	            ctx.drawImage(img, image.dx, image.dy, image.w, image.h);
	        }
	        else {
	            ctx.drawImage(img, image.dx, image.dy);
	        }
	    };
	    Segment.prototype.drawText = function (ctx, text) {
	        ctx.font = TEXT_TYPE_FONT[text.type];
	        ctx.fillStyle = TEXT_TYPE_COLOR[text.type];
	        ctx.textAlign = TEXT_TYPE_ALIGN[text.type];
	        ctx.textBaseline = TEXT_TYPE_BASE_LINE[text.type];
	        ctx.fillText(text.value, text.dx, text.dy);
	    };
	    //tylko dla czcionki 9px
	    Segment.prototype.drawStrikethroughText = function (ctx, text) {
	        ctx.fillStyle = TEXT_TYPE_COLOR[text.type];
	        ctx.font = TEXT_TYPE_FONT[text.type];
	        ctx.textAlign = TEXT_TYPE_ALIGN[text.type];
	        ctx.textBaseline = TEXT_TYPE_BASE_LINE[text.type];
	        ctx.fillText(text.value, text.dx, text.dy);
	        var width = ctx.measureText(text.value).width;
	        ctx.beginPath();
	        ctx.strokeStyle = '1px ' + TEXT_TYPE_COLOR[text.type];
	        ctx.moveTo(text.dx, text.dy + 4.5);
	        ctx.lineTo(text.dx + width, text.dy - 4.5);
	        ctx.closePath();
	        ctx.stroke();
	    };
	    Segment.prototype.loadImage = function (url) {
	        if (url) {
	            return loadImage(url);
	        }
	        else {
	            return createWhitePixelImg();
	        }
	    };
	    Segment.prototype.getProductUnderCursor = function (x, y) {
	        if (this.isLoaded) {
	            for (var i = this.productPositions.length - 1; i >= 0; i--) {
	                var product = this.productPositions[i];
	                if (x >= this.x + product.dx
	                    && x <= this.x + product.dx + product.w
	                    && y >= product.dy
	                    && y <= product.dy + product.h) {
	                    return product;
	                }
	            }
	        }
	        return null;
	    };
	    return Segment;
	})();
	module.exports = Segment;


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Repository = __webpack_require__(12);
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
/* 12 */
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
/* 13 */
/***/ function(module, exports) {

	var TextType;
	(function (TextType) {
	    TextType[TextType["Price"] = 0] = "Price";
	    TextType[TextType["PromoPrice"] = 1] = "PromoPrice";
	    TextType[TextType["OldPrice"] = 2] = "OldPrice";
	    TextType[TextType["Header"] = 3] = "Header";
	})(TextType || (TextType = {}));
	module.exports = TextType;


/***/ },
/* 14 */
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
/* 15 */
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
/* 16 */
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
/* 17 */
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
/* 18 */
/***/ function(module, exports) {

	var Cart = Rossmann.Shared.Carts.Cart;
	var Et = Rossmann.Shared.Events.Event;
	var CartDict = (function () {
	    function CartDict() {
	        var _this = this;
	        this.dict = {};
	        Cart.Instance().GettingAllItems().then(function (items) {
	            for (var _i = 0; _i < items.length; _i++) {
	                var item = items[_i];
	                _this.addToDict(item.ProductId, item.Quantity);
	            }
	            _this.handleProductQuantityChanged();
	        });
	    }
	    CartDict.GetInstance = function () {
	        if (!CartDict.instance) {
	            CartDict.instance = new CartDict();
	        }
	        return CartDict.instance;
	    };
	    CartDict.prototype.addToDict = function (productId, quantity) {
	        this.dict[productId] = quantity;
	    };
	    CartDict.prototype.handleProductQuantityChanged = function () {
	        if (this.handleProductQuantityChangedCallback) {
	            this.handleProductQuantityChangedCallback();
	        }
	    };
	    CartDict.prototype.getDict = function () {
	        return this.dict;
	    };
	    return CartDict;
	})();
	Et.Listen('AddToCartEvent', function (data) {
	    handleProductQuantityChanged(data);
	});
	Et.Listen('RemoveFromCartEvent', function (data) {
	    handleProductQuantityChanged(data);
	});
	function handleProductQuantityChanged(data) {
	    var productId = data.details.id;
	    Cart.Instance().GettingQuantity(productId).then(function (quantity) {
	        var cartDict = CartDict.GetInstance();
	        cartDict.addToDict(productId, quantity);
	        cartDict.handleProductQuantityChanged();
	    });
	}
	module.exports = CartDict;


/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	var LoopIndex = __webpack_require__(20);
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
	        var wasSegmentsAppended = false;
	        while (this.shouldPrepend(xMove)) {
	            this.prepend();
	            wasSegmentsAppended = true;
	        }
	        this.unloadUnvisibleSegments(xMove);
	        return wasSegmentsAppended;
	    };
	    SegmentPrepender.prototype.shouldPrepend = function (xMove) {
	        var freeSpace = xMove + this.currentX * this.args.INITIAL_SCALE;
	        return Math.round(freeSpace + this.args.CANVAS_WIDTH) > 0;
	    };
	    SegmentPrepender.prototype.prepend = function () {
	        this.currentIndex = this.loopIndex.prev();
	        var segmentWidth = this.args.SEGMENT_WIDTHS[this.currentIndex];
	        this.currentX -= segmentWidth;
	        var segment = this.args.createSegment(this.currentIndex, this.currentX, segmentWidth);
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
/* 20 */
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
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	var LoopIndex = __webpack_require__(20);
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
	        var wasSegmentsAppended = false;
	        while (this.shouldAppend(xMove)) {
	            this.append();
	            wasSegmentsAppended = true;
	        }
	        this.unloadUnvisibleSegments(xMove);
	        return wasSegmentsAppended;
	    };
	    SegmentAppender.prototype.shouldAppend = function (xMove) {
	        var freeSpace = -xMove + this.args.CANVAS_WIDTH - this.nextX * this.args.INITIAL_SCALE;
	        return Math.round(freeSpace + this.args.CANVAS_WIDTH) > 0;
	    };
	    SegmentAppender.prototype.append = function () {
	        var segmentWidth = this.args.SEGMENT_WIDTHS[this.nextIndex];
	        var segment = this.args.createSegment(this.nextIndex, this.nextX, segmentWidth);
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
/* 22 */
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
	    FlashLoader.prototype.segmentUnvisibled = function (segmentId) {
	        _.remove(this.segments, function (segment) {
	            return segment.id === segmentId;
	        });
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
	    FlashLoader.prototype.checkIfEmpty = function () {
	        return this.segments.length === 0;
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
/* 23 */
/***/ function(module, exports) {

	'use strict';
	var PAN_LAST_STEP_MAX_DURATION = 100;
	function touch(viewPort) {
	    'use strict';
	    var hammer = new Hammer(viewPort.getCanvas(), {
	        touchAction: 'none'
	    });
	    hammer.get('pan').set({ direction: Hammer.DIRECTION_ALL });
	    var lastDeltaX = 0;
	    var lastDeltaY = 0;
	    var panSteps = new Array();
	    hammer.on('panstart', function () {
	        moveEnd();
	        viewPort.stopAnimation('xMove');
	        viewPort.stopAnimation('yMove');
	    });
	    hammer.on('pan', function (e) {
	        var xMove = viewPort.getXMove() + e.deltaX - lastDeltaX;
	        viewPort.setXMove(xMove);
	        lastDeltaX = e.deltaX;
	        var yMove = viewPort.getYMove() + e.deltaY - lastDeltaY;
	        viewPort.setYMove(yMove);
	        lastDeltaY = e.deltaY;
	        panSteps.push({
	            time: Date.now(),
	            xMove: xMove,
	            yMove: yMove
	        });
	    });
	    function calculateLastMove() {
	        var endStep;
	        if (panSteps.length > 0) {
	            endStep = panSteps[panSteps.length - 1];
	        }
	        else {
	            return null;
	        }
	        for (var i = panSteps.length - 1; i >= 0; i--) {
	            var step = panSteps[i];
	            if (endStep.time - step.time > PAN_LAST_STEP_MAX_DURATION) {
	                var lastMove = {
	                    time: endStep.time - step.time,
	                    x1: step.xMove,
	                    y1: step.yMove,
	                    x2: endStep.xMove,
	                    y2: endStep.yMove,
	                    xDiff: 0,
	                    yDiff: 0,
	                    s: 0
	                };
	                lastMove.xDiff = 1000 * (-(endStep.xMove - step.xMove)) / (2 * lastMove.time);
	                lastMove.yDiff = 1000 * (-(endStep.yMove - step.yMove)) / (2 * lastMove.time);
	                lastMove.s = Math.sqrt(Math.pow(lastMove.xDiff, 2) + Math.pow(lastMove.yDiff, 2));
	                return lastMove;
	            }
	        }
	    }
	    hammer.on('panend', function (e) {
	        var lastMove = calculateLastMove();
	        if (lastMove && lastMove.s > 0) {
	            var sinAlfa = lastMove.yDiff / lastMove.s;
	            var cosAlfa = lastMove.xDiff / lastMove.s;
	            var newXDiff = lastMove.s * cosAlfa;
	            var newYDiff = lastMove.s * sinAlfa;
	            viewPort.animateBatch([
	                { propertyName: 'xMove', endValue: viewPort.getXMove() - newXDiff },
	                { propertyName: 'yMove', endValue: viewPort.getYMove() - newYDiff }
	            ]);
	        }
	        moveEnd();
	    });
	    function moveEnd() {
	        panSteps = [];
	        lastDeltaX = 0;
	        lastDeltaY = 0;
	    }
	    hammer.on('tap', function (e) {
	        viewPort.onClick(e.center);
	    });
	    return hammer;
	}
	module.exports = touch;


/***/ },
/* 24 */
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
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	var ValueAnimator = __webpack_require__(26);
	var ValueAnimatorController = (function () {
	    function ValueAnimatorController() {
	        this.animators = new Array();
	    }
	    ValueAnimatorController.prototype.add = function (args) {
	        var _this = this;
	        setTimeout(function () {
	            if (_this.animationsInProgressExists()) {
	                return;
	            }
	            _this.animators.push(new ValueAnimator(args));
	        }, 0);
	    };
	    ValueAnimatorController.prototype.addBatch = function (argsList) {
	        var _this = this;
	        setTimeout(function () {
	            if (_this.animationsInProgressExists()) {
	                return;
	            }
	            for (var _i = 0; _i < argsList.length; _i++) {
	                var args = argsList[_i];
	                _this.animators.push(new ValueAnimator(args));
	            }
	        }, 0);
	    };
	    ValueAnimatorController.prototype.remove = function (id) {
	        for (var _i = 0, _a = this.animators; _i < _a.length; _i++) {
	            var animator = _a[_i];
	            if (animator.getId() === id) {
	                _.pull(this.animators, animator);
	            }
	        }
	    };
	    ValueAnimatorController.prototype.animationsInProgressExists = function () {
	        return this.animators.length > 0;
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
	        }
	    };
	    return ValueAnimatorController;
	})();
	module.exports = ValueAnimatorController;


/***/ },
/* 26 */
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
/* 27 */
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
/* 28 */
/***/ function(module, exports) {

	var PADDING = 4;
	var PRELOADER_WIDTH = 160;
	var PRELOADER_HEIGHT = 130;
	var PRELOADER_WIDGET_CENTER_X = PRELOADER_WIDTH / 2;
	var PRELOADER_WIDGET_CENTER_Y = 45;
	var PRELOADER_TEXT_Y = 105;
	var PRELOADER_TEXT = 'Proszę czekać...';
	var PRELOADER_WIDGET_R = 19;
	var COS_45 = Math.cos(Math.PI / 4);
	var STEP_DURATION = 100;
	var CIRCLE_COUNT = 8;
	var CIRCLE_RADIUS = 3;
	var XXL_CIRCLE_RADIUS = 6;
	var XL_CIRCLE_RADIUS = 5;
	var L_CIRCLE_RADIUS = 4;
	var BORDER_CURVE_R = 5;
	var Preloader = (function () {
	    function Preloader(width) {
	        this.rotateIndex = 0;
	        this.scale = width / PRELOADER_WIDTH;
	        this.canvas = document.createElement('canvas');
	        this.ctx = this.canvas.getContext('2d');
	        this.circleRadius = CIRCLE_RADIUS * this.scale;
	        this.lCircleRadius = L_CIRCLE_RADIUS * this.scale;
	        this.xlCircleRadius = XL_CIRCLE_RADIUS * this.scale;
	        this.xxlCircleRadius = XXL_CIRCLE_RADIUS * this.scale;
	        this.preloaderWidgetR = PRELOADER_WIDGET_R * this.scale;
	        this.preloaderWidgetCenterX = PRELOADER_WIDGET_CENTER_X * this.scale;
	        this.preloaderWidgetCenterY = PRELOADER_WIDGET_CENTER_Y * this.scale;
	        this.preloaderTextY = PRELOADER_TEXT_Y * this.scale;
	        this.preloaderWidth = PRELOADER_WIDTH * this.scale;
	        this.preloaderHeight = PRELOADER_HEIGHT * this.scale;
	        this.padding = PADDING * this.scale;
	        this.borderCurveR = BORDER_CURVE_R * this.scale;
	        this.canvas.width = this.preloaderWidth;
	        this.canvas.height = this.preloaderHeight;
	        this.fontFillStyle = this.calculateFontFillStyle();
	        this.drawBackground();
	        this.drawText();
	    }
	    Preloader.prototype.getCanvas = function () { return this.canvas; };
	    Preloader.prototype.handleAnimationFrame = function (time) {
	        if (!this.lastStepTime || time - this.lastStepTime > STEP_DURATION) {
	            this.lastStepTime = time;
	        }
	        else {
	            return false;
	        }
	        this.ctx.fillStyle = 'white';
	        this.ctx.fillRect(this.preloaderWidgetCenterX - this.preloaderWidgetR - 2 * this.xxlCircleRadius, this.preloaderWidgetCenterY - this.preloaderWidgetR - 2 * this.xxlCircleRadius, 2 * this.preloaderWidgetR + 4 * this.xxlCircleRadius, 2 * this.preloaderWidgetR + 4 * this.xxlCircleRadius);
	        this.ctx.translate(this.preloaderWidgetCenterX, this.preloaderWidgetCenterY);
	        this.ctx.rotate(this.rotateIndex * (Math.PI / 4));
	        var d = this.drawCircleRelativeToPreloaderCenter.bind(this);
	        d(0, -this.preloaderWidgetR, this.lCircleRadius);
	        d(this.preloaderWidgetR * COS_45, -this.preloaderWidgetR * COS_45, this.xlCircleRadius);
	        d(this.preloaderWidgetR, 0, this.xxlCircleRadius);
	        d(this.preloaderWidgetR * COS_45, this.preloaderWidgetR * COS_45, this.circleRadius);
	        d(0, this.preloaderWidgetR, this.circleRadius);
	        d(-this.preloaderWidgetR * COS_45, this.preloaderWidgetR * COS_45, this.circleRadius);
	        d(-this.preloaderWidgetR, 0, this.circleRadius);
	        d(-this.preloaderWidgetR * COS_45, -this.preloaderWidgetR * COS_45, this.circleRadius);
	        this.ctx.rotate(-this.rotateIndex * (Math.PI / 4));
	        if (this.rotateIndex === CIRCLE_COUNT - 1) {
	            this.rotateIndex = 0;
	        }
	        else {
	            this.rotateIndex++;
	        }
	        this.ctx.translate(-this.preloaderWidgetCenterX, -this.preloaderWidgetCenterY);
	        return true;
	    };
	    Preloader.prototype.drawBackground = function () {
	        var dx = this.padding;
	        var dy = this.padding;
	        var w = this.preloaderWidth - 2 * this.padding;
	        var h = this.preloaderHeight - 2 * this.padding;
	        this.ctx.shadowColor = 'black';
	        this.ctx.shadowBlur = this.padding * 0.5;
	        this.ctx.shadowOffsetX = 0;
	        this.ctx.shadowOffsetY = 0;
	        this.ctx.fillStyle = 'white';
	        this.ctx.beginPath();
	        this.ctx.moveTo(dx + this.borderCurveR, dy);
	        this.ctx.lineTo(dx + w - this.borderCurveR, dy);
	        this.ctx.quadraticCurveTo(dx + w, dy, dx + w, dy + this.borderCurveR);
	        this.ctx.lineTo(dx + w, dy + h - this.borderCurveR);
	        this.ctx.quadraticCurveTo(dx + w, dy + h, dx + w - this.borderCurveR, dy + h);
	        this.ctx.lineTo(dx + this.borderCurveR, dy + h);
	        this.ctx.quadraticCurveTo(dx, dy + h, dx, dy + h - this.borderCurveR);
	        this.ctx.lineTo(dx, dy + this.borderCurveR);
	        this.ctx.quadraticCurveTo(dx, dy, dx + this.borderCurveR, dy);
	        this.ctx.closePath();
	        this.ctx.fill();
	        this.ctx.shadowBlur = 0;
	    };
	    Preloader.prototype.drawText = function () {
	        this.ctx.font = this.fontFillStyle;
	        this.ctx.fillStyle = 'black';
	        this.ctx.textAlign = 'center';
	        this.ctx.fillText(PRELOADER_TEXT, this.preloaderWidth / 2, this.preloaderTextY);
	    };
	    Preloader.prototype.drawCircleRelativeToPreloaderCenter = function (x, y, r) {
	        this.ctx.beginPath();
	        this.ctx.arc(x, y, r, 0, 2 * Math.PI);
	        this.ctx.fillStyle = 'red';
	        this.ctx.fill();
	        this.ctx.closePath();
	    };
	    Preloader.prototype.calculateFontFillStyle = function () {
	        var fontSize = 16;
	        do {
	            this.ctx.font = 'bold ' + fontSize + 'px Ariel';
	            if (this.ctx.measureText(PRELOADER_TEXT).width < this.preloaderWidth) {
	                break;
	            }
	            fontSize--;
	        } while (fontSize > 0);
	        return this.ctx.font;
	    };
	    return Preloader;
	})();
	module.exports = Preloader;


/***/ },
/* 29 */
/***/ function(module, exports) {

	var QueryString = (function () {
	    function QueryString(containerOrSegmentId) {
	        this.containerOrSegmentId = containerOrSegmentId;
	        if (typeof (containerOrSegmentId) === 'number') {
	            var segmentId = containerOrSegmentId;
	            this.IsPlanogramIdSetUp = false;
	            this.IsSegmentIdSetUp = true;
	            this.SegmentId = segmentId;
	            this.IsProductIdSetUp = false;
	        }
	        else {
	            this.container = containerOrSegmentId;
	            this.IsPlanogramIdSetUp = this.getBoolAttr('data-is-planogram-id-set-up');
	            this.PlanogramId = this.getIntAttr('data-planogram-id');
	            this.IsSegmentIdSetUp = this.getBoolAttr('data-is-segment-id-set-up');
	            this.SegmentId = this.getIntAttr('data-segment-id');
	            this.IsProductIdSetUp = this.getBoolAttr('data-is-product-id-set-up');
	            this.ProductId = this.getIntAttr('data-product-id');
	        }
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
/* 30 */
/***/ function(module, exports) {

	var DEFAULT_START_POSITION_RESULT = { segmentIndex: 0, x: 0, segments: [] };
	var StartPosition = (function () {
	    function StartPosition(args) {
	        this.args = args;
	    }
	    StartPosition.prototype.calculate = function () {
	        if (this.args.queryString.IsPlanogramIdSetUp) {
	            var planogramId = this.args.queryString.PlanogramId;
	            var segmentIndex = this.getSegmentIndexByPlanogramId(planogramId);
	            if (segmentIndex > 0) {
	                var segments = this.getSegmentsByPlanogramId(planogramId, segmentIndex);
	                var planogramWidth = this.calculatePlanogramWidth(segments);
	                var x = (this.args.canvasWidth - planogramWidth) / 2;
	                if (x < 0) {
	                    x = 0;
	                }
	                return { segmentIndex: segmentIndex, x: x, segments: segments };
	            }
	            else {
	                return DEFAULT_START_POSITION_RESULT;
	            }
	        }
	        else if (this.args.queryString.IsSegmentIdSetUp) {
	            var segmentId = this.args.queryString.SegmentId;
	            var segmentIndex = this.getSegmentIndexBySegmentId(segmentId);
	            if (segmentIndex > 0) {
	                var segment = this.args.segmentsData[segmentIndex];
	                var x = (this.args.canvasWidth - segment.width * this.args.initialScale) / 2;
	                if (x < 0) {
	                    x = 0;
	                }
	                return { segmentIndex: segmentIndex, x: x, segments: [segment] };
	            }
	            else {
	                return DEFAULT_START_POSITION_RESULT;
	            }
	        }
	        else {
	            return DEFAULT_START_POSITION_RESULT;
	        }
	    };
	    StartPosition.prototype.getSegmentIndexByPlanogramId = function (planogramId) {
	        return _.findIndex(this.args.segmentsData, function (s) { return s.plnId === planogramId; });
	    };
	    StartPosition.prototype.getSegmentIndexBySegmentId = function (segmentId) {
	        return _.findIndex(this.args.segmentsData, function (s) { return s.id === segmentId; });
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