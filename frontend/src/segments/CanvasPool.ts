interface CanvasPoolItem {
    canvas: HTMLCanvasElement;
    inUse: boolean;
}

class CanvasPool {
    private items = new Array<CanvasPoolItem>();

    constructor(private maxCanvasWidth: number, private maxCanvasHeight: number) {
    }

    public get(): HTMLCanvasElement {
        let availableItem = this.getAvailableItem();
        if (availableItem !== null) {
            availableItem.inUse = true;
            return availableItem.canvas;
        }

        let canvas = document.createElement('canvas');
        canvas.width = this.maxCanvasWidth;
        canvas.height = this.maxCanvasHeight;
        this.items.push({
            canvas,
            inUse: true
        });
        return canvas;
    }

    public release(canvas: HTMLCanvasElement): void {
      let item = _.find(this.items, (i) => { return i.canvas === canvas; });
      item.canvas.getContext('2d').clearRect(0, 0, this.maxCanvasWidth, this.maxCanvasHeight);
      item.inUse = false;
    }

    private getAvailableItem(): CanvasPoolItem {
        for (let item of this.items) {
            if (!item.inUse) {
                return item;
            }
        }
        return null;
    }
}

export = CanvasPool;
