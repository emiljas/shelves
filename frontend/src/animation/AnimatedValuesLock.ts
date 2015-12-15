class AnimatedValuesLock {
    private dict: any = {};

    public lock(id: string) {
        this.dict[id] = true;
    }

    public unlock(id: string) {
        delete this.dict[id];
    }

    public isUnlock(id: string) {
        return !this.dict[id];
    }
}

export = AnimatedValuesLock;
