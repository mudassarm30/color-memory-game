$(function(){
	
	/*
	**   Shows if Colour settings are correctly read
	**/
	window.readcoloursettings = false; 
	
	
	/*
	 **   Cursor offset
	 **/
	window.cursoroffset = [25,15];
	
	
	/*
	 **   Cursor grid position
	 **/
	window.cursorposition = [0,0];
	
	
	/*
	 **   Restart button location and dimensions
	 **/
	window.restartButton = [452, 362, 100, 32];
	
	
	/*
	 **   Game board representation
	 **/
	window.board = [["", "", "", ""],
			["", "", "", ""],
			["", "", "", ""],
			["", "", "", ""]];
	
	/*
	 **   Game board representation
	 **/
	window.score = 0;
	
	
	/*
	 **   Colors from the configuration 
	 **/
	window.colors = ["","","","","","","",""];
	
	
	/*
	 **   Selected Cards
	 **/
	window.firstSelection  = [-1, -1, ""];
	window.secondSelection = [-1, -1, ""];
	
	
	/*
	 **   Initialize Game with configuration, render board or safely close in case of an error.
	 **/
	window.initializeGame = function()
	{
		// Show progress bar
		Utils.showLoading();
		
		
		// Loading color settings
		$.ajax({
			url: "proxy.php", 
			type: "GET",
			success: function(result)
			{
				var contents = $.trim(result);
				
				// Hide progress bar
				Utils.hideLoading();
				
				// In case the configuration file is no longer available, handle the error smoothly
				if(contents == "")
				{
					Utils.showMessage("Game configurations are not available");
				}
				else
				{
					// Verify the configurations are correct
					if(!window.verifyConfiguration(contents))
						return;
					
					// Show the game area
					$(".gamearea").show();
					
					restartGame();
					
					// Initialize the game cursor with the reference element that has class gamearea.
					GameCursor.initCursor("gamearea");
				}
				
				moveTo(cursorposition[0], cursorposition[1]);
			},
			error: function(err)
			{
				// In case some unknown error occurs then do not start the game.
				Utils.showMessage("Some unknown error occurred while loading game configuration");
				
				// Hide progress bar
				Utils.hideLoading();
			}
		});
	}
	
	/*
	 **   Verify if the configurations are valid, initialize game board representation.
	 **/
	window.verifyConfiguration = function(config)
	{
		var lines = config.split('\n');
		var i = 0;
		
		$.each(lines, function(key, line) {

			line = $.trim(line);
			
			if(i<8)
			if( (line.indexOf(";") != 0) && (line != "")) {
			    var tokens = line.split(";");
			    line = $.trim(tokens[0]);
			    
			    window.colors[i] = line;
			    i++;
			}
		});
		
		if(i < 8)
		{
			Utils.showMessage("Game configurations are not complete, few colors are missing");
			return false;
		}
		
		window.readcoloursettings = true;
		return true;
	}
	
	/*
	 **   Shuffle cards
	 **/
	window.shuffleCards = function()
	{
		var shuffled = [colors[0],colors[0],colors[1],colors[1],colors[2],colors[2],colors[3],colors[3],colors[4],colors[4],colors[5],colors[5],colors[6],colors[6],colors[7],colors[7]];
		
		Utils.shuffle(shuffled);
		
		for(row=0; row<4; row++)
		{
			for(col=0; col<4; col++)
			{
				window.board[row][col] = shuffled[4*row + col];
			}
		}
	}
	
	/*
	 **   Draw the cards on the board
	 **/
	window.renderBoard = function()
	{
		for(row=0; row<4; row++)
		{
			for(col=0; col<4; col++)
			{
				if(window.board[row][col] != "")
				{
					var id = "card_"+row+"_"+col;
					GameCard.initCard("gamearea", id);
					GameCard.initAnimateTo(id, cursoroffset[0] + col * 100 + 5, cursoroffset[1] + row * 100 + 5);
				}
			}
		}
	}
	
	
	/*
	 * *   Restart Game
	 **/
	window.restartGame = function()
	{
		if(readcoloursettings)
		{
			// Shuffle cards
			shuffleCards();
			
			// Render the game board
			renderBoard();
			
			score = 0;
			Utils.showScore("score", score);
			firstSelection  = [-1, -1, ""];
			secondSelection = [-1, -1, ""];
		}
	}
	
	
	/*
	 **   Move cursor on the game grid position [row, col]
	 **   This was the tricky function :) (But I am very tough for problems :) )
	 **/
	window.setNextPosition = function(offset, board)
	{
		var next_row = 4;
		var next_col = 4;
		var sqdist = 0.0;
		var min_sqdist = 100.0;
		
		if(cursorposition[0] == 4 && cursorposition[1] == 4 && offset[1] != -1)
			return cursorposition;
		
		// if right most column and RIGHT key is pressed then go to restart button
		if(offset[1] == 1 && cursorposition[1] == 3)
		{
			return [4, 4];
		}
		// Other three cases where cursor will not move
		else if( (offset[1] == -1 && cursorposition[1] == 0) ||
		         (offset[0] == -1 && cursorposition[0] == 0) ||
		         (offset[0] ==  1 && cursorposition[0] == 3) )
		{
			// No change in the position
			return cursorposition;
		}
		else
		{
			r = cursorposition[0];
			c = cursorposition[1];
			
			// If up key was pressed then see if there is a non-empty cell above
			// if yes then move to that otherwise stay on the same position.
			if(offset[0] == -1)
			{
				for(_r = cursorposition[0]-1; _r >= 0; _r--)
				{
					_c = c;
					sqdist = (r - _r) * (r - _r) + 	(c - _c) * (c - _c);
					if(sqdist < min_sqdist && board[_r][_c] != "")
					{
						next_row = _r;
						next_col = _c;
						min_sqdist = sqdist;
					}
					if(next_row != 4 && next_col != 4)
						return [next_row, next_col];					
				}
				return cursorposition;
			}
			// If down key was pressed then see if there is a non-empty cell below
			// if yes then move to that otherwise stay on the same position.
			else if(offset[0] ==  1) 
			{
				for(_r = cursorposition[0]+1; _r < 4; _r++)
				{
					_c = c;
					sqdist = (r - _r) * (r - _r) + 	(c - _c) * (c - _c);
					if(sqdist < min_sqdist && board[_r][_c] != "")
					{
						next_row = _r;
						next_col = _c;
						min_sqdist = sqdist;
					}
					if(next_row != 4 && next_col != 4)
						return [next_row, next_col];					
				}
				return cursorposition;
			}
			// If left key was pressed the before going to the left position see
			// whether there is a non-empty cell in a column that is nearer than the left available
			else if(offset[1] == -1)
			{
				for(_c = cursorposition[1]-1; _c >= 0; _c--)
				{
					for(_r=0; _r<4; _r++)
					{
						sqdist = (r - _r) * (r - _r) + 	(c - _c) * (c - _c);
						if(sqdist < min_sqdist && board[_r][_c] != "")
						{
							next_row = _r;
							next_col = _c;
							min_sqdist = sqdist;
						}
					}
					if(next_row != 4 && next_col != 4)
						return [next_row, next_col];	
				}
			}
			// If right key was pressed the before going to the right position see
			// whether there is a non-empty cell in a column that is nearer than the right available
			else if(offset[1] ==  1)
			{
				for(_c = cursorposition[1]+1; _c < 4; _c++)
				{
					for(_r=3; _r>=0; _r--)
					{
						sqdist = (r - _r) * (r - _r) + 	(c - _c) * (c - _c);
						if(sqdist < min_sqdist && board[_r][_c] != "")
						{
							next_row = _r;
							next_col = _c;
							min_sqdist = sqdist;
						}
					}
					if(next_row != 4 && next_col != 4)
						return [next_row, next_col];	
				}
			}					
		}
		
		// if not found a new location then see if right key is pressed then move to the restart button
		if(offset[1] == 1 && next_row == 4 && next_col == 4)
			cursorposition = [4, 4];
		else
			cursorposition = [next_row, next_col];
		
		return cursorposition;
	}
	
	
	/*
	 **   Move cursor on the game grid position [row, col]
	 **   Move to the restart button if [4,4] is provided
	 **/
	window.moveTo = function(row, col)
	{
		if(row == 4 && col == 4)
			GameCursor.animateTo(restartButton[0], restartButton[1], restartButton[2], restartButton[3]);
		else
			GameCursor.animateTo(cursoroffset[0] + col * 100, cursoroffset[1] + row * 100, GameCursor.width, GameCursor.height);
	}
	
	window.checkEndGame = function()
	{
		for(row=0; row<4; row++)
		{
			for(col=0; col<4; col++)
			{
				if(window.board[row][col] != "")
				{
					return false;
				}
			}
		}
		return true;
	}
	
	
	/*
	 **  Process the move, If the restart button is selected then restart the game.
	 **  Otherwise process the card matching logic.
	 **/
	window.processMove = function()
	{
		var row = window.cursorposition[0];
		var col = window.cursorposition[1];
		
		if(row == 4 && col == 4)
		{
			restartGame();
		}
		else
		{
			var id = "card_"+row+"_"+col;
			if(window.board[row][col] != "")
			{
				GameCard.flipCard(id, window.board[row][col]);
				
				// Nothing is selected, select the first card (flip it)
				if( (window.firstSelection[0] == -1) && (window.firstSelection[1] == -1) )
				{
					window.firstSelection = [row,col,window.board[row][col]];
					window.board[row][col] = "";
				}
				else
				{
					window.secondSelection = [row,col,window.board[row][col]];
					window.board[row][col] = "";
					
					// Match Found
					if(window.firstSelection[2] == window.secondSelection[2])
					{
						score++;
						window.firstSelection  = [-1, -1, ""];
						window.secondSelection = [-1, -1, ""];
						Utils.showScore("score", score);
						
						setTimeout(function(){
							if(window.checkEndGame())
							{
								if(confirm("You have won the game, do you want to play again ?"))
								{
									window.restartGame();
								}
							}
						},500);
					}
					else
					{
						score--;
						
						var first  = "card_"+window.firstSelection[0]+"_"+window.firstSelection[1];
						var second = "card_"+window.secondSelection[0]+"_"+window.secondSelection[1];
						
						// Flip the cards back
						setTimeout(function(){
							
							GameCard.isAnimating = true;	
							GameCard.flipBackCard(first);
							GameCard.flipBackCard(second);
							window.board[window.firstSelection[0]][window.firstSelection[1]] = window.firstSelection[2];
							window.board[window.secondSelection[0]][window.secondSelection[1]] = window.secondSelection[2];
							window.firstSelection  = [-1, -1, ""];
							window.secondSelection = [-1, -1, ""];
							Utils.showScore("score", score);
						},1000);
					}
				}
			}
		}
	}
	
	
	/*
	 **   Handle key press on the game environment
	 **/
	$( "body" ).keydown(function(e) {
		
		var offset = [0, 0];
		
		if(GameCard.isAnimating)
			return;
		
		
		switch(e.which || e.keyCode)
		{
			case 39: // RIGHT
			{
				offset[1] = 1;
			}
			break;
			case 37: // LEFT
			{
				offset[1] = -1;
			}
			break;
			case 38: // UP
			{
				offset[0] = -1;
			}
			break;
			case 40: // DOWN
			{
				offset[0] = 1;
			}
			break;
			case 13: // RETURN
			{
				processMove();
				return;
			}
			default:
				return;
		}

		cursorposition = setNextPosition(offset, window.board); 	//although board is global, but here I want to keep the code readable.
		moveTo(cursorposition[0], cursorposition[1]);
	});
	
	
	/*
	 **   Initialize Game here
	 **/
	initializeGame();
});