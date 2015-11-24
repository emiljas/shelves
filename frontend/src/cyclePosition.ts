function cyclePosition(position: number, maxPosition: number): number {
    'use strict';

    if (position < 1) {
        return maxPosition + position % maxPosition;
    }
    if (position > maxPosition) {
        return position % maxPosition;
    }
    return position;
};

export = cyclePosition;
