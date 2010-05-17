// TODO add change sites, add communication
function Checkers(board) {
	var self = this; // reference helper
	this.BOARD_SIZE = 8;      
  this.TURNS = ["white", "black"];

	this.$board = $("#" + board); // game board
	this.currentChecker = null;
  this.currentTurn = self.TURNS[0];
  
  // public
  self.processMessage = function(obj) {
    if (obj != undefined 
      && obj.message != undefined) {
      var square = getSquare(obj.message[1].newpos);
      var checker = getChecker(obj.message[1].oldpos);
      checker.makeMove(square);
      setNextTurn();
    }
  }

  // socketUtils constructor
  //function SocketUtils() {
    io.setPath('/client/');
    var socket = new io.Socket('localhost', {rememberTransport: false, port: 8080});
    
    function connect(callback) {
      socket.connect();
      socket.addEvent('message', function(data){
        var obj = JSON.parse(data);
        if (callback) {
          callback(obj);        
        }
      });
    }

    function send(message) {
      socket.send(message);
    }
    console.log(self.processMessage);
    connect(self.processMessage);
  //}

  //self.socketUtil = new SocketUtils();

	// Square constructor
	function Square(x, y) {
		var self = this;

		this.COLORS = {"true":"square_black", "false":"square_white"};
		this.id = "square_" + x + "_" + y;
		this.color = self.COLORS[x %  2 === y % 2];
		this.x = x;
		this.y = y;       
		this.position = {"x": self.x, "y": self.y};
		this.checker = null; // checker
    
    // set jquery object
		this.$square = $('<div id="' + self.id + '" class="square ' + self.color + '"> </div>')
			.data("square", self);

		// checks if square is empty
		this.isEmpty = function() {
			return self.checker == null;
		}

		// removes checker from the square
		this.removeChecker = function() {
			self.checker = null;
		}
    
    // associates checker with the square
		this.hasOne = function(checker) {
			self.checker = checker;        
		}

    this.highlight = function() {
       self.$square.addClass('square_highlighted');
    }
    
    this.unHighlight = function() {
       self.$square.removeClass('square_highlighted');
    }
    
    this.isHighlighted = function() {
       return self.$square.hasClass('square_highlighted');
    }
  }

	// Checker constructor
	function Checker(x, y) {
		var self = this;

		this.COLORS = {"true":"black", "false":"white"};
		this.x = x;
		this.y = y; 
		this.id = "checker_" + self.x + "_" + self.y;
		this.color = self.COLORS[self.x < 2];
		this.position = {"x": self.x, "y": self.y};
    this.square = null; // square object the checker belongs to

		// create jquery object
		this.$checker = $('<div id="' + self.id + '" class="checker ' + self.color + '"></div>')
			.data("checker", self)

    // public

		this.belongsTo = function(square) {
			self.square = square;
			// wires up jquery object
			self.$checker.appendTo(square.$square);
      // change id
      self.$checker.attr('id', "checker_" + square.x + "_" + square.y);      
		}

		this.isBlack = function() {
			return self.color == "black";        
		}

		this.isWhite = function() {
			return self.color == "white";        
		}

    this.isActiveTurn = function(turn) {
      return self.color == turn;
    }

		// TODO: add queen/remove
		this.getPossibleMoves = function() {
			var moves = [];

			var positions = getMovesPositions();
			if (self.isBlack()) {
				moves.push(positions.br);
				moves.push(positions.tr);
			}
			else {
				moves.push(positions.tl);
				moves.push(positions.bl);
			}
			return moves;
		}

		// makes move
		this.makeMove = function(square) {
			self.x = square.x;
			self.y = square.y;
			// remove checker from current square
			self.square.removeChecker();
			// set link between square and checker
			self.belongsTo(square);
			square.hasOne(self);
    
		}

		// private

		function getMovesPositions() {
			return {
				'br':{'x': self.x + 1, 'y': self.y + 1}, 
			  'bl':{'x': self.x - 1, 'y': self.y + 1}, 
				'tr':{'x': self.x + 1, 'y': self.y - 1}, 
				'tl':{'x': self.x - 1, 'y': self.y - 1}};
		}
	}

	// private

	// draws game grid
	function drawGrid() {
		for (var i = 0; i < self.BOARD_SIZE; i++) {
			for(var j = 0; j < self.BOARD_SIZE; j++) {
				var square = new Square(i, j);
				square.$square.appendTo(self.$board);
				drawChecker(square);
			}
		}
	}

	// draws checker on the grid
	function drawChecker(square) {
		if (square.y % 2 === square.x % 2 
      && (square.x < 2 || square.x > 5)) {
			var checker = new Checker(square.x, square.y);
			checker.belongsTo(square);
			square.hasOne(checker);
		}
	}

	// shows possible moves
	function showPossibleMoves($checker) {
		var c = $checker.data("checker");
		var moves = c.getPossibleMoves();
		$.each(moves, function(i, v){
		  var square = getSquare(v);
			if (square != null && square.isEmpty()) {
			  square.highlight();
			}
		});
	}
  
  function setNextTurn() {
    self.currentTurn = (self.currentTurn == self.TURNS[0]) ? self.TURNS[1] : self.TURNS[0];
  }

	drawGrid();
  

	// register events

	// TODO use publish / subcribe
	$('.checker').mouseover(function(){
	  if (self.currentChecker == null 
      && $(this).data("checker").isActiveTurn(self.currentTurn)) {
		  showPossibleMoves($(this));
		}
	});

	$('.checker').mouseout(function(){
	  if (self.currentChecker == null) {
		  $('.square').removeClass('square_highlighted');
		}
	});

	$('.checker').click(function(e){
		var checker = $(this).data("checker");
		if (self.currentChecker == null 
      || self.currentChecker != checker) {          
		  $('.square').removeClass('square_highlighted');
		  showPossibleMoves($(this));
			checker.square.highlight();
			self.currentChecker = checker;
		}
		else {
			self.currentChecker = null;
			checker.square.unHighlight();     
		}
    return false; // stop bubbling
	});

	$('.square').click(function(){
    var square = $(this).data('square');
	  if (self.currentChecker != null 
      && square.isHighlighted()) {

      // send data
//      self.socketUtil.
      send({"newpos":{"x": square.x, "y": square.y}, "oldpos":{"x":self.currentChecker.x, "y": self.currentChecker.y}});


		  self.currentChecker.makeMove(square);
      

      setNextTurn();
			self.currentChecker = null;
			$('.square').removeClass('square_highlighted');

		}
	});

	// helpers
	function getSquare(position) {
		return $("#square_" + position.x + "_" + position.y).data('square'); 
	}
  
  function getChecker(position) {
		return $("#checker_" + position.x + "_" + position.y).data('checker'); 
	}
}    

Checkers.init = function(board) {
	window.checkers = new Checkers(board);
}

