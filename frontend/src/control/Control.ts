import setTimedInterval = require('../utils/setTimedInterval');
import ViewPort = require('../ViewPort');
import Events = require('../events/Events');

const BASE_IMG_URL = '/DesktopModules/RossmannV4Modules/Shelves2/Img/icons/';

const TOP_IMG_URL = BASE_IMG_URL + 'scroll-top.png';
const HOVER_TOP_IMG_URL = BASE_IMG_URL + 'scroll-top-hover.png';

const LEFT_IMG_URL = BASE_IMG_URL + 'scroll-left.png';
const HOVER_LEFT_IMG_URL = BASE_IMG_URL + 'scroll-left-hover.png';

const RIGHT_IMG_URL = BASE_IMG_URL + 'scroll-right.png';
const HOVER_RIGHT_IMG_URL = BASE_IMG_URL + 'scroll-right-hover.png';

const BOTTOM_IMG_URL = BASE_IMG_URL + 'scroll-bottom.png';
const HOVER_BOTTOM_IMG_URL = BASE_IMG_URL + 'scroll-bottom-hover.png';

const PLUS_IMG_URL = BASE_IMG_URL + 'zoom-plus.png';
const HOVER_PLUS_IMG_URL = BASE_IMG_URL + 'zoom-plus-hover.png';

const MINUS_IMG_URL = BASE_IMG_URL + 'zoom-minus.png';
const HOVER_MINUS_IMG_URL = BASE_IMG_URL + 'zoom-minus-hover.png';

class Control {
    private events: Events;
    private controlDiv: HTMLDivElement;

    private left: HTMLImageElement;
    private right: HTMLImageElement;
    private top: HTMLImageElement;
    private bottom: HTMLImageElement;
    private middle: HTMLImageElement;

    constructor(private viewPort: ViewPort, private container: HTMLDivElement) {
        this.events = viewPort.getEvents();
    }

    public init() {
        this.controlDiv = <HTMLDivElement>this.container.querySelector('.control');
        this.placeControl();
        this.bindControl();
    }

    public onZoomChange(): void {
        this.refreshZoomIcon();
        if (this.viewPort.checkIfMagnified()) {
          this.showTopAndBottomBtns();
        } else {
          this.hideTopAndBottomBtns();
        }
    }

    private placeControl(): void {
        let header = document.getElementById('header_desktop');
        let MAX_PAGE_LOAD = 5;
        let INTERVAL = 100;

        if (header) {
            setTimedInterval(() => {
                let left = header.getBoundingClientRect().left;
                this.controlDiv.style.left = left + 'px';
            }, INTERVAL, MAX_PAGE_LOAD);
        } else {
            console.error('#header_desktop element doesnt exist');
            this.controlDiv.style.left = '0';
        }
    }

    private bindControl(): void {
        this.left = <HTMLImageElement>this.controlDiv.querySelector('.left');
        this.right = <HTMLImageElement>this.controlDiv.querySelector('.right');
        this.top = <HTMLImageElement>this.controlDiv.querySelector('.top');
        this.bottom = <HTMLImageElement>this.controlDiv.querySelector('.bottom');
        this.middle = <HTMLImageElement>this.controlDiv.querySelector('.middle');

        this.changeIconOnHover(this.left, LEFT_IMG_URL, HOVER_LEFT_IMG_URL);
        this.changeIconOnHover(this.right, RIGHT_IMG_URL, HOVER_RIGHT_IMG_URL);
        this.changeIconOnHover(this.top, TOP_IMG_URL, HOVER_TOP_IMG_URL);
        this.changeIconOnHover(this.bottom, BOTTOM_IMG_URL, HOVER_BOTTOM_IMG_URL);
        this.changeZoomIconOnHover(this.middle);

        this.events.addEventListener(this.left, 'click', (e) => {
            this.viewPort.control_left();
        });

        this.events.addEventListener(this.right, 'click', (e) => {
            this.viewPort.control_right();
        });

        this.events.addEventListener(this.top, 'click', (e) => {
            this.viewPort.control_top();
        });

        this.events.addEventListener(this.bottom, 'click', (e) => {
            this.viewPort.control_bottom();
        });

        this.events.addEventListener(this.middle, 'click', (e) => {
            if (this.viewPort.checkIfMagnified()) {
                this.viewPort.control_unzoom();
                this.middle.src = HOVER_PLUS_IMG_URL;
            } else {
                this.viewPort.control_zoom();
                this.middle.src = HOVER_MINUS_IMG_URL;
            }
        });
    }

    private changeIconOnHover(img: HTMLImageElement, iconUrl: string, hoverIconUrl: string) {
        this.events.addEventListener(img, 'mouseover', () => {
            img.src = hoverIconUrl;
        });

        this.events.addEventListener(img, 'mouseout', () => {
            img.src = iconUrl;
        });
    }

    private changeZoomIconOnHover(img: HTMLImageElement) {
        this.events.addEventListener(img, 'mouseover', () => {
            if (this.viewPort.checkIfMagnified()) {
                this.middle.src = HOVER_MINUS_IMG_URL;
            } else {
                this.middle.src = HOVER_PLUS_IMG_URL;
            }
        });

        this.events.addEventListener(img, 'mouseout', () => {
            this.refreshZoomIcon();
        });
    }

    private refreshZoomIcon(): void {
        if (this.viewPort.checkIfMagnified()) {
            this.middle.src = MINUS_IMG_URL;
        } else {
            this.middle.src = PLUS_IMG_URL;
        }
    }

    private showTopAndBottomBtns(): void {
      this.top.classList.remove('disactivated');
      this.bottom.classList.remove('disactivated');
    }

    private hideTopAndBottomBtns(): void {
      this.top.classList.add('disactivated');
      this.bottom.classList.add('disactivated');
    }
}

export = Control;
