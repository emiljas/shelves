interface ValueAnimatorArgs {
    start: number;
    end: number;
    timestamp: number;
    onChange: (value: number) => void;
}

export = ValueAnimatorArgs;
