interface ValueAnimatorArgs {
    id: string;
    start: number;
    end: number;
    timestamp: number;
    onChange: (value: number) => void;
}

export = ValueAnimatorArgs;
