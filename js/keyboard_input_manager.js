function KeyboardInputManager() {
  this.events = {};
   
  if (window.navigator.msPointerEnabled) {
    //Internet Explorer 10 style
    this.eventTouchstart    = "MSPointerDown";
    this.eventTouchmove     = "MSPointerMove";
    this.eventTouchend      = "MSPointerUp";
  } else {
    this.eventTouchstart    = "touchstart";
    this.eventTouchmove     = "touchmove";
    this.eventTouchend      = "touchend";
  }

  this.listen();
}

KeyboardInputManager.prototype.setupPieces = function () {

  var gameContainer = document.getElementsByClassName("grid-container")[0];
  var gridCell = document.getElementsByClassName("grid-cell")[0]; 
 
  var gameContainerStyle = gameContainer.currentStyle || window.getComputedStyle(gameContainer);
  var gridCellStyle = gridCell.currentStyle ||  window.getComputedStyle(gridCell);
 
  this._pieces = [];
  this._mouse = {x:0,y:0};
  this._puzzleHeight = gameContainerStyle.height;
  this._puzzleWidth = gameContainerStyle.width;
  this._pieceHeight = gridCellStyle.height;
  this._pieceWidth = gridCellStyle.width;
  this._pieceMargin = gridCellStyle.marginRight;
  this._currentPiece = null;
  this._currentDropPiece = null;
};

KeyboardInputManager.prototype.checkPieceClicked = function (){
  var i;
  var piece;
  this.buildPieces();
  for(i = 0;i < this._pieces.length;i++){
     piece = this._pieces[i];
     if(this._mouse.x < piece.xPos || this._mouse.x > (piece.xPos + this._pieceWidth) || this._mouse.y < piece.yPos || this._mouse.y > (piece.yPos + this._pieceHeight)){
       //PIECE NOT HIT
      }
      else{
            return piece;
          }
  }
  return null;
};

KeyboardInputManager.prototype.buildPieces = function (){
   var i;
    this._pieces = [];
    var piece;
    var xPos = 0;
    var yPos = 0;
    for(i = 0;i < 16 ;i++){
        piece = {};
        piece.sx = xPos;
        piece.sy = yPos;
        this._pieces.push(piece);
        xPos += this._pieceWidth;
        if(xPos >= this._puzzleWidth){
            xPos = 0;
            yPos += this._pieceHeight;
        }
    }
  };         

KeyboardInputManager.prototype.on = function (event, callback) {
  if (!this.events[event]) {
    this.events[event] = [];
  }
  this.events[event].push(callback);
};

KeyboardInputManager.prototype.emit = function (event, data) {
  var callbacks = this.events[event];
  if (callbacks) {
      callbacks.forEach(function (callback) {
      callback(data);
    });
  }
};

KeyboardInputManager.prototype.listen = function () {
  var self = this;

 /* var map = {
    38: 0, // Up
    39: 1, // Right
    40: 2, // Down
    37: 3, // Left
    75: 0, // Vim up
    76: 1, // Vim right
    74: 2, // Vim down
    72: 3, // Vim left
    87: 0, // W
    68: 1, // D
    83: 2, // S
    65: 3  // A
  }*/
  var map = {
    40: 2, // Down
    74: 2, // Vim down
    83: 2 // S
  };

  // Respond to direction keys
  document.addEventListener("keydown", function (event) {
    var modifiers = event.altKey || event.ctrlKey || event.metaKey ||
                    event.shiftKey;
    var mapped    = map[event.which];

    if (!modifiers) {
      if (mapped !== undefined) {
        event.preventDefault();
        self.emit("move", mapped);
      }
    }

    // R key restarts the game
    if (!modifiers && event.which === 82) {
      self.restart.call(self, event);
    }
  });

  // Respond to button presses
  this.bindButtonPress(".retry-button", this.restart);
  this.bindButtonPress(".restart-button", this.restart);
  this.bindButtonPress(".keep-playing-button", this.keepPlaying);
  this.bindButtonPress(".tutorial-button", this.tutorial);  
  this.bindButtonPress(".close-button", this.close);  


  // Respond to swipe events
  var touchStartClientX, touchStartClientY;

  var gameContainer = document.getElementsByClassName("grid-container")[0];
  
  gameContainer.addEventListener(this.eventTouchstart, function (event) {
     if ((!window.navigator.msPointerEnabled && event.touches.length > 1) ||
        event.targetTouches.length > 1) {
      return; // Ignore if touching with more than 1 finger
    }
    if (window.navigator.msPointerEnabled) {
      touchStartClientX = event.pageX;
      touchStartClientY = event.pageY;
    } else {
      touchStartClientX = event.touches[0].clientX;
      touchStartClientY = event.touches[0].clientY;
    }
    event.preventDefault();

  });

  gameContainer.addEventListener(this.eventTouchmove, function (event) {
    event.preventDefault();
  });

  gameContainer.addEventListener(this.eventTouchend, function (event) {
    
    if ((!window.navigator.msPointerEnabled && event.touches.length > 0) ||
        event.targetTouches.length > 0) {
      return; // Ignore if still touching with one or more fingers
    }

    var touchEndClientX, touchEndClientY;

    if (window.navigator.msPointerEnabled) {
      self._mouse.x = touchEndClientX = event.pageX;
      self._mouse.y = touchEndClientY = event.pageY;
    } else {
      self._mouse.x = touchEndClientX = event.changedTouches[0].clientX;
      self._mouse.y = touchEndClientY = event.changedTouches[0].clientY;
    }
  
    self._currentPiece = self.checkPieceClicked();
   
 

    var dx = touchEndClientX - touchStartClientX;
    var absDx = Math.abs(dx);

    var dy = touchEndClientY - touchStartClientY;
    var absDy = Math.abs(dy);

    if (Math.max(absDx, absDy) > 10) {
      // (right : left) : (down : up)
      //self.emit("move", absDx > absDy ? (dx > 0 ? 1 : 3) : (dy > 0 ? 2 : 0));
    } 
   });
};

KeyboardInputManager.prototype.restart = function (event) {
  event.preventDefault();
  this.emit("restart");
};

KeyboardInputManager.prototype.keepPlaying = function (event) {
  event.preventDefault();
  this.emit("keepPlaying");
};

KeyboardInputManager.prototype.tutorial = function (event) {
  event.preventDefault();
  this.emit("tutorial");
};

KeyboardInputManager.prototype.close = function (event) {
  event.preventDefault();
  this.emit("close");
};

KeyboardInputManager.prototype.bindButtonPress = function (selector, fn) {
  var button = document.querySelector(selector);
  button.addEventListener("click", fn.bind(this));
  button.addEventListener(this.eventTouchend, fn.bind(this));
};
