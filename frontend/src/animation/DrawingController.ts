class DrawingController {
    private animationCount = 0;

    public beginAnimation(): void {
        this.animationCount++;
    }

    public endAnimation(): void {
        this.animationCount--;
    }

    public mustRedraw(): boolean {
        return this.animationCount > 0;
    }
}

export = DrawingController;
