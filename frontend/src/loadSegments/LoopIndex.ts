class LoopIndex {
    private itemsCount: number;
    private index: number;

    constructor(itemsCount: number, index: number) {
        this.itemsCount = itemsCount;
        this.index = index;
    }

    public prev(): number {
        this.index = this.getLastIndexIfBelowZero(this.index - 1);
        return this.index;
    }

    public next(): number {
        this.index = this.getZeroIndexIfUnderLast(this.index + 1);
        return this.index;
    }

    private getZeroIndexIfUnderLast(index: number): number {
        if (index === this.itemsCount) {
            return 0;
        } else {
            return index;
        }
    }

    private getLastIndexIfBelowZero(index: number): number {
        if (index === -1) {
            return this.itemsCount - 1;
        } else {
            return index;
        }
    }
}

export = LoopIndex;
