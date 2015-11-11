
    var shelvesCanvas = <HTMLCanvasElement>document.getElementById('shelvesCanvas');
    var canvasWidth = shelvesCanvas.width;
    var canvasHeight = shelvesCanvas.height;
    var ctx = shelvesCanvas.getContext('2d');

    var segmentsData = [
      { width: 200, color: 'rgb(100, 100, 100)' },
      { width: 200, color: 'rgb(30, 150, 0)' },
      { width: 200, color: 'rgb(140, 10, 200)' },
      { width: 200, color: 'rgb(10, 100, 100)' },
      { width: 200, color: 'rgb(30, 10, 0)' },
      { width: 200, color: 'rgb(140, 255, 200)' },
    ];

    var timestamp = 0, lastTimestamp;
    var animationTimestamp;

    function animationLoop(t) {
      timestamp = t;

      ctx.save();
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      if(!isNearZeroPx(distanceToMove)) {
        var secondsFromAnimationStart = (timestamp - animationTimestamp) / 1000;
        var d = Math.sin(secondsFromAnimationStart) * distanceToMove;

        moveDistance += d;
        distanceToMove -= d;
      }

      ctx.translate(moveDistance, 0);
      view.draw();
      ctx.restore();

      lastTimestamp = t;
      window.requestAnimationFrame(animationLoop);
      if(window['fpsMeasurer']) {
        window['fpsMeasurer'].tick(timestamp);
      }
    }
    window.requestAnimationFrame(animationLoop);











function FPS () {
  this.elapsed = 0
  this.last = null
}

FPS.prototype.tick = function (now) {
  this.elapsed = (now - (this.last || now)) / 1000;
  this.last = now;
};

FPS.prototype.get = function() {
    return Math.round(1 / this.elapsed);
};

window['fpsMeasurer'] = new FPS()

















    var DIFF = 0.5;
    function isNearZeroPx(value) {
      return Math.abs(value) < DIFF;
    }

  shelvesCanvas.addEventListener("touchstart", handleStart, false);
  shelvesCanvas.addEventListener("touchend", handleEnd, false);
  shelvesCanvas.addEventListener("touchcancel", handleCancel, false);
  shelvesCanvas.addEventListener("touchmove", handleMove, false);

  var isCanvasTouched = false;
  var moveDistance = 0;
  var lastMoveX;

  var distanceToMove = 0;

  var backBtn = document.getElementById('backBtn');
  backBtn.addEventListener('click', function() {
    distanceToMove = distanceToMove - 250;
    animationTimestamp = timestamp;
  }, false);

  var nextBtn = document.getElementById('nextBtn');
  nextBtn.addEventListener('click', function() {
    distanceToMove = distanceToMove + 250;
    animationTimestamp = timestamp;
  }, false);

  function handleStart(e) {
    e.preventDefault();
    isCanvasTouched = true;
  }

  function handleEnd() {
    isCanvasTouched = false;
    lastMoveX = null;
  }

  function handleCancel() {
    isCanvasTouched = false;
    lastMoveX = null;
  }

  function handleMove(evt) {
    isCanvasTouched = true;
    var touch = evt.touches[0];

    if(lastMoveX != null) {
      moveDistance += touch.pageX - lastMoveX;
    }
    lastMoveX = touch.pageX;
  }



    var x = 0;
    function Segment(data) {
      ctx.fillStyle = data.color;
      ctx.fillRect(x, 0, data.width, 100);

      x += data.width;
    }

    function View() {
      this.draw = function() {
        x = 0;
        for(var i = 0, l = segmentsData.length; i < l; i++) {
          var segmentData = segmentsData[i];
          new Segment(segmentData)
        }
      };
    }

    var view = new View();
