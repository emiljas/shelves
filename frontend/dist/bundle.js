!function(e){function t(a){if(n[a])return n[a].exports;var i=n[a]={exports:{},id:a,loaded:!1};return e[a].call(i.exports,i,i.exports,t),i.loaded=!0,i.exports}var n={};return t.m=e,t.c=n,t.p="",t(0)}([function(e,t,n){"use strict";function a(){var e=document.getElementById("shelvesCanvasContainer"),t=window.innerHeight||document.documentElement.clientHeight||document.body.clientHeight;i["default"].canvas.width=e.offsetWidth,i["default"].canvas.height=t}var i=n(1),o=n(2),r=n(4);i["default"].init(),r["default"].start(),o["default"]();var u=500;window.addEventListener("resize",_.debounce(function(e){a()},u)),a(),i["default"].canvas.addEventListener("pointerdown",function(e){e.preventDefault(),l=!0},!1),i["default"].canvas.addEventListener("pointerup",function(){l=!1,c=null},!1),i["default"].canvas.addEventListener("pointerout",function(){l=!1,c=null},!1),i["default"].canvas.addEventListener("pointercancel",function(){l=!1,c=null},!1),i["default"].canvas.addEventListener("pointermove",function(e){if(l){var t={pageX:e.pageX,pageY:e.pageY};null!=c&&(i["default"].moveDistance+=t.pageX-c),c=t.pageX}},!1);var d=document.getElementById("backBtn");d.addEventListener("click",function(){i["default"].distanceToMove=i["default"].distanceToMove-250,i["default"].animationTimestamp=i["default"].timestamp},!1);var s=document.getElementById("nextBtn");s.addEventListener("click",function(){i["default"].distanceToMove=i["default"].distanceToMove+250,i["default"].animationTimestamp=i["default"].timestamp},!1);var c,l=!1},function(e,t){"use strict";var n=function(){function e(){}return e.init=function(){e.canvas=document.getElementById("shelvesCanvas"),e.ctx=e.canvas.getContext("2d"),e.timestamp=0,e.moveDistance=0,e.distanceToMove=0},e}();Object.defineProperty(t,"__esModule",{value:!0}),t["default"]=n},function(e,t,n){"use strict";function a(){function e(e,t){var n=document.createElement("p");n.textContent=t||e,Modernizr[e]?n.classList.add("green"):n.classList.add("red"),a.appendChild(n)}var t=document.createElement("div");t.classList.add("debugContainer"),t.classList.add("left");var n={min:0,cur:0,max:0};setInterval(function(){var e=i["default"].instance;n.cur=e.get(),n.min=Math.min(n.min||Number.MAX_VALUE,n.cur),n.max=Math.max(n.max,n.cur),n.max&&(t.textContent="FPS: min."+n.min+" cur."+n.cur+" max."+n.max)},500);var a=document.createElement("div");a.classList.add("debugContainer"),a.classList.add("right"),e("canvas"),e("requestanimationframe","raf"),e("xhr2"),e("webworkers"),e("transferables"),e("touchevents"),e("eventlistener"),document.body.appendChild(t),document.body.appendChild(a)}var i=n(3);Object.defineProperty(t,"__esModule",{value:!0}),t["default"]=a},function(e,t){"use strict";var n=function(){function e(){this.elapsed=0,this.last=null}return Object.defineProperty(e,"instance",{get:function(){return null==this._instance&&(this._instance=new e),this._instance},enumerable:!0,configurable:!0}),e.prototype.tick=function(e){this.elapsed=(e-(this.last||e))/1e3,this.last=e},e.prototype.get=function(){return Math.round(1/this.elapsed)},e}();Object.defineProperty(t,"__esModule",{value:!0}),t["default"]=n},function(e,t,n){"use strict";function a(e){return Math.abs(e)<d}var i=n(3),o=n(1),r=n(5),u=function(){function e(){}return e.start=function(){window.requestAnimationFrame(e.loop)},e.loop=function(t){if(o["default"].timestamp=t,o["default"].ctx.clearRect(0,0,o["default"].canvas.width,o["default"].canvas.height),!a(o["default"].distanceToMove)){var n=(o["default"].timestamp-o["default"].animationTimestamp)/1e3,u=Math.sin(n)*o["default"].distanceToMove;o["default"].moveDistance+=u,o["default"].distanceToMove-=u}o["default"].ctx.save(),o["default"].ctx.translate(o["default"].moveDistance,0),o["default"].ctx.scale(.33,.33),r["default"](),o["default"].ctx.restore(),o["default"].lastTimestamp=t,window.requestAnimationFrame(e.loop),i["default"].instance.tick(t)},e}();Object.defineProperty(t,"__esModule",{value:!0}),t["default"]=u;var d=.5},function(e,t,n){"use strict";function a(){l=0;for(var e=0;e<d.length;e++){var t=d[e];t.draw()}}function i(e){return new Promise(function(t,n){var a=new Image;a.src=e,a.addEventListener("load",function(){t(a)}),a.addEventListener("error",function(e){n(e)})})}for(var o=n(1),r=n(6),u=function(){function e(){}return e.loadByPosition=function(t){var n=new e;s.getByPosition(t).then(function(e){return n.data=e,d.push(n),i(e.spriteImgUrl)}).then(function(e){n.spriteImg=e})},e.prototype.draw=function(){var e=this.spriteImg;if(e)for(var t=this.data.productPositions,n=0;n<t.length;n++){var a=t[n];o["default"].ctx.drawImage(e,a.sx,a.sy,a.w,a.h,a.dx+l,a.dy,a.w,a.h)}l+=1050},e}(),d=new Array,s=new r["default"],c=1;8>c;c++)u.loadByPosition(c);var l=0;Object.defineProperty(t,"__esModule",{value:!0}),t["default"]=a},function(e,t){"use strict";var n=function(){function e(){}return e.prototype.getByPosition=function(e){return new Promise(function(t,n){var a=new XMLHttpRequest;a.addEventListener("load",function(e){t(JSON.parse(a.responseText))}),a.open("GET","http://192.168.1.104:3000/getSegment?position="+e),a.send()})},e}();Object.defineProperty(t,"__esModule",{value:!0}),t["default"]=n}]);
//# sourceMappingURL=bundle.js.map