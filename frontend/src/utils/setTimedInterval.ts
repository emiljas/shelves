function setTimedInterval(f: () => void, interval: number, time: number) {
  'use strict';

  f();

  let startTime = Date.now();
  let intervalId = setInterval(() => {
    if ((Date.now() - startTime) / 1000 >= time) {
      clearInterval(intervalId);
    } else {
      f();
    }
  }, interval);
}

export = setTimedInterval;
