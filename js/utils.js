$(function(){
   

    /*
     **   Game Cursor
     **/
    window.GameCursor = {
	width: 48,
	height: 60,
	left: 0,
	top: 0,
	initCursor: function(gamearea)
	{
	    // On first time add the cursor into the game area
	    $("." + gamearea).append("<div class='cursor' style='width:"+GameCursor.width+"px; height:"+GameCursor.height+"px'></div>"); 
	},
	showCursor: function(x, y)
	{
	    GameCursor.left = x;
	    GameCursor.top = y;
	    
	    $(".cursor").css("left", GameCursor.left+"px");
	    $(".cursor").css("top", GameCursor.top+"px");	    
	},
	animateTo: function(x, y, width, height)
	{
	    GameCursor.left = x;
	    GameCursor.top = y;
	    $(".cursor").animate({
		left: (x+"px"),
		top: (y+"px"),
		width: width + "px",
		height: height + "px"
	    }, 250, function() {
	    });
	}
    };
          
    /*
     **   Related to the cards, their animations, colors etc
     **/
    window.GameCard = {
	isAnimating: false,
	initCard: function(gamearea, id)
	{
	    $("#"+id).remove();
	    $("." + gamearea).append("<div class='card' id='" + id + "' style='width:"+GameCursor.width+"px; height:"+GameCursor.height+"px'></div>"); 
	},
	showCard: function(id, x, y)
	{
	    $("#"+id).css("left", x+"px");
	    $("#"+id).css("top", y+"px");	
	},
        initAnimateTo: function(id, x, y)
        {
	    $("#"+id).animate({
		  left: (x+"px"),
		  top: (y+"px"),
	    }, 250 + 2 * x + 2 * y, function() {
	    });
        },
        flipCard: function(id, color)
	{
		var image_height = $("#"+id).height();
		var margin = image_height / 2 + 'px';
		image_height += 'px';
		var compress_css_properties = {
		      height: 0,
		      marginTop: margin
		};
		var decompress_css_properties = {
		      height: image_height,
		      marginTop: 0,
		}
		GameCard.isAnimating = true;
		$("#"+id).stop().animate(compress_css_properties, 250, function() {
			$("#"+id).addClass("flippedcard");
			$("#"+id).removeClass("card");
			$("#"+id).css("background-color", color);
			$("#"+id).stop().animate(decompress_css_properties, 250, function() {
				GameCard.isAnimating = false;
			});
		});
	},
	flipBackCard: function(id)
	{
		var image_height = $("#"+id).height();
		var margin = image_height / 2 + 'px';
		image_height += 'px';
		var compress_css_properties = {
			height: 0,
			marginTop: margin
		};
		var decompress_css_properties = {
			height: image_height,
			marginTop: 0,
		}
		GameCard.isAnimating = true;
		$("#"+id).stop().animate(compress_css_properties, 250, function() {
			$("#"+id).addClass("card");
			$("#"+id).removeClass("flippedcard");
			$("#"+id).stop().animate(decompress_css_properties, 250, function() {
				GameCard.isAnimating = false;
			});
		});
	}
    };
    
    
    /*
     **   Utilities
     **/
    window.Utils = {
	showMessage: function(msg)
	{
	    alert(msg);    
	},
        showLoading: function() 
        {
	    var loadingElement = document.createElement('div');
	    loadingElement.id = 'loading';
	    loadingElement.className = 'loading';
	    loadingElement.innerHTML = '<img src="images/loader.gif" style="border: 3px solid #000000" />';

	    // apply styles
	    loadingElement.style.position = 'absolute';
	    loadingElement.style.width = '100%';
	    loadingElement.style.textAlign = 'center';
	    loadingElement.style.zIndex = '10000';
	    loadingElement.style.display = 'block';
	    loadingElement.style.top = '350px';

	    // attach it to DOM
	    $('body').append(loadingElement);
	},
        hideLoading: function()
        {
	    $("#loading").remove();
        },
	shuffle: function(arr) 
	{
	    for(var j, x, i = arr.length; i;j = parseInt(Math.random() * i), x = arr[--i], arr[i] = arr[j], arr[j] = x);
	    return arr;
	},
	showScore: function(cls, scr)
	{
	    $("." + cls).html("<p><h2> Score </h2></p><span>"+scr+"</span");	
	}
    };
    
});