/*!
 * LightCube - jQuery Plugin
 * version: 0.1.2 (05 Nov 2013)
 * requires jQuery v1.6 or later
 *
 *
 * Copyright 2013 Bastien Heynderickx (hachbé) - http://www.hachbe.be
 *
 */

(function($)
{
	
	$.fn.lightcube=function(options)
    {
    	"use strict";
    	
    	// Default Options.
    	var defauts=
        {
	    	"opacity"				: 0.7,
	    	"backgroundColor"		: "#000000",
			"openTime"				: 500, // 1000 = 1 seconde
			"animation"				: 'likelightbox', // 'zoom', 'likelightbox', 'none'
		    "boxWidth"				: 800, // Default Width
			"boxHeight"				: 600, // Default Height
			"videoWidth"			: 720, // Default Width (rapport 16:9)
			"videoHeight"			: 315, // Default Width (rapport 16:9)
			"mobileBreakingPoint" 	: 767, //Largeur à partir de laquelle tout affichage inférieur passe en mode Responsive
			"backgroundResponsive"	: '#FFFFFF', // Format -> Hexadecimal
			"labelClose"			: 'fermer',
			"autoplay"				: true, //Autoplay vidéo? True or False
			"keys"  				: {
		                                "next" : {
		                                        13 : 'left', // enter
		                                        34 : 'up',   // page down
		                                        39 : 'left', // right arrow
		                                        40 : 'up'    // down arrow
		                                },
		                                "plc_closerev" : {
		                                        8  : 'right',  // backspace
		                                        33 : 'down',   // page up
		                                        37 : 'right',  // left arrow
		                                        38 : 'down'    // up arrow
		                                },
		                                "close"  : [27], // escape key
		                                "play"   : [32], // space - start/stop slideshow
		                                "toggle" : [70]  // letter "f" - toggle fullscreen
                        			}
    	}; 
    	
    	// On fusionne les options envoyés par l'utilisateur avec ceux par défaut.
    	var opt=$.extend(defauts, options); 
    	
    	var link; // Shortcut for the link
    	var type = "image";  // Content type
    	var img;
    	var timer;
    	var title;
    	var element;
    	var boxWidth;
    	var newWidth;
    	var widthElem;
    	var heightElem;
    	var headerHeight;
    	
 
    	
    	// Regular expressions needed for the content (Based of ZoomBox plugin jQuery of Grafikart)
		var filtreImg			=        /(\.jpg)|(\.jpeg)|(\.bmp)|(\.gif)|(\.png)/i;
		var filtreMP3			=        /(\.mp3)/i;
		var filtreFLV			=        /(\.flv)/i;
		var filtreSWF			=        /(\.swf)/i;
		var filtreQuicktime		=        /(\.mov)|(\.mp4)/i;
		var filtreWMV			=        /(\.wmv)|(\.avi)/i;
		var filtreDailymotion	=        /(http:\/\/www.dailymotion)|(http:\/\/dailymotion)/i;
		var filtreVimeo			=        /(http:\/\/www.vimeo)|(http:\/\/vimeo)/i;
		var filtreYoutube		=        /(youtube\.)/i;
		var filtreKoreus		=        /(http:\/\/www\.koreus)|(http:\/\/koreus)/i;
    	
    	$("a[rel='lightcube']").click(function(){
    		element = $(this);
    		link 	= element.attr("href");
    		title 	= element.attr("title");
    		if(filtreImg.test(link)){
    			type 	= "image";
    		} else if (filtreYoutube.test(link)){
    			type 	= "youtube";
    		}
			open();
			$(window).keydown(function(event){
				shortcut(event.which);
	    	});
			$(window).resize(resizeElem); //On lance la fonction resize si on resize la fenêtre.
			$(window).scroll(position);
			return false;
		});
		
		
			
		
		
		function shortcut(key){
			if(key == 37){
		        prev();
		    }
		    if(key == 39){
		        next();
		    }
		    if(key == opt.keys.close){
		        close();
		    }
		}
		
		
		function open(){
			
			
			$("body").append('<div class="lightcube"><div class="lc_header"><a href="#" class="lc_close_mobile">'+opt.labelClose+'</a></div><div class="lc_background"></div><div class="lc_loader"></div><div class="lc_box"><div class="lc_relative"><a href="#" class="lc_close">X</a><div class="lc_content"></div></div></div></div>');
			$(".lc_box").hide();
			$(".lc_loader").hide().fadeIn();
			$(".lc_background").hide().fadeTo(500,opt.opacity).css({'background-color': opt.backgroundColor});
			
		
			if(type=='image'){
				img 		= new Image();
				img.src 	= link;
				timer 		= window.setInterval(loadImg,100);
			} else if(type=='youtube'){
				buildContent();
			}
			
			$(".lc_close_mobile").click(close);
			$(".lc_close").click(close);
			$(".lc_background").click(close);
		
		} // eof function "open"
		
		
		function close(){
			
			$(".lightcube").fadeOut(500,function(){
				$(".lightcube").remove();
				if($("html").hasClass("lc_overlay")){
					$("html").removeClass("lc_overlay");
				}
			});
			$(window).unbind('keydown');
			$(window).unbind('resize');
			$(window).unbind('scroll');
			return false;
			
		} // eof function "close"
		
		
		function loadImg(){
			
			if(img.complete){
				window.clearInterval(timer);
				buildContent();
			}
			
		} // eof function "loadImg"
		
		
		
		function buildContent(){
			
			$(".lc_box").show();
			$(".lc_box").css("width",opt.boxWidth+"px").css("height",opt.boxHeight+"px");
			
			
			if(type=='image'){
				widthElem 	= img.width;
			    heightElem 	= img.height;
			    
				if(title){
					$(".lc_content").append('<h2>'+title+'</h2><img src="'+link+'" />');
				} else {
					$(".lc_content").append('<h2>&nbsp;</h2><img src="'+link+'" class="lc_image_without_title" />');
				}
				heightElem = heightElem+$(".lc_content h2").height();
				
			} else if(type=='youtube'){
				widthElem 	= opt.videoWidth;
				heightElem	= opt.videoHeight;
				
				var id=link.split('watch?v=');
		        id=id[1].split('&');
		        id=id[0]+'?';
		        if(opt.autoplay==true){
		            id = id + 'autoplay=1&';
		        }
				
				if(title){
					$(".lc_content").append('<h2>'+title+'</h2><iframe src="http://www.youtube.com/embed/'+id+'wmode=Opaque" width="'+widthElem+'px" height="'+heightElem+'px" frameborder="0" allowfullscreen></iframe>');
				} else {
					$(".lc_content").append('<h2>&nbsp;</h2><iframe src="http://www.youtube.com/embed/'+id+'wmode=Opaque" width="'+widthElem+'px" height="'+heightElem+'px" frameborder="0" allowfullscreen></iframe>');
				}
				$(".lc_content iframe").data('aspectRatio', heightElem / widthElem)
					// and remove the hard coded width/height
				    .removeAttr('height')
				    .removeAttr('width');
				heightElem  = $(".lc_content iframe").height();
				
				var titleHeight = $(".lc_content h2").height();
				$(".lc_content iframe").css({'top': titleHeight+'px'});
			
			}
			
			
			animation();
			
			
			
			
		} // eof function "builContent"
		

		function animation(){
			
			/* NO FINISH */
			if(opt.animation=='zoom'){
				$(".lc_box").animate({
					width:	lightcube.width,
					height:	lightcube.height
				},
					lightcube.openTime,'swing',
						function(){
							$(".lc_content").fadeIn();
							$//(".lc_close").fadeIn();
							$(".lc_loader").fadeOut();
						}
				);
				
			}
			else if(opt.animation=='likelightbox'){
				$(".lc_box").animate({
					width: widthElem
				},
					opt.openTime/2,'swing'
				).animate({
					height: heightElem
				},opt.openTime/2,'swing',
					function(){
							$(".lc_content").fadeIn();
							//$(".lc_close").fadeIn();
							$(".lc_loader").fadeOut();
							resizeElem();
					}
					
				);
				
				
			}
			/* NO USE YET */
			/*
			else if(opt.animation=='none'){
				//$(".lc_box").fadeIn(opt.openTime);
				//$(".lc_content").fadeIn(opt.openTime);
			}*/
			
			
		} // eof function "animation"
		
		
		function resizeElem(){
			
			
			
			
			
			// On check si la box et plus petit que l'écran.
			boxWidth = $(".lc_box").outerWidth();
			
			var windowWidthSize = windowWidth();
			var windowHeightSize = windowHeight();
			
			/*
			 * MOBILE 
			 */
			if(windowWidthSize<=opt.mobileBreakingPoint){ // Si la taille de l'écran est plus petit ou équalle au Breaking Point prévus dans les options'
			
				if($(".lightcube").hasClass('responsive')==false){
					$(".lightcube").addClass('responsive');
					$(".lightcube .lc_background").css({
						opacity: 1,
						'background-color': opt.backgroundResponsive
					});
				}
				
				// On se met en mode Responsive  
				headerHeight = $(".lc_header").height();
			 	
			 	$(".lc_box").css({
			 		left:'0px',
			 		top: headerHeight
			 	});
			 	$(".lc_box").outerWidth(windowWidthSize).height(windowWidthSize * $(".lc_box").data('aspectRatio'));
			 	$(".lc_box img").css("width","100%");
				
				$("html").addClass("lc_overlay");
				$(".lc_box").css({
					"width"			: "100%",
					"height"		: "100%",
					"top"			: "0px",
					"padding-top" 	: "50px"
				});
			/*
			 * DESKTOP/TABLETTE
			 */	
			} else if(windowWidthSize>opt.mobileBreakingPoint) { // Si la taille de l'écran est plus grand au Breaking Point prévus dans les options'
				if($(".lightcube").hasClass('responsive')){
					$(".lightcube").removeClass('responsive');
					$(".lightcube .lc_background").css({
						opacity: opt.opacity ,
						'background-color': opt.backgroundColor
					});
				}
				if(windowWidthSize<= boxWidth){ // Si la taille de l'écran est plus petit que la box
					
					// On se met en mode Responsive  
				 	$(".lc_box").outerWidth(windowWidthSize).height(windowWidthSize * $(".lc_box").data('aspectRatio'));
				 	$(".lc_box").css({left:'0px'});
				 	$(".lc_box img").css("width","100%");
					
				} else if ((windowWidthSize>=boxWidth) && (windowWidthSize<=widthElem)){ // Si la taille de l'écran est plus grande que la box et inéfrieur à la taille de l'image
					$(".lc_box").width(windowWidthSize).height(windowWidthSize * $(".lc_box").data('aspectRatio'));
				 	$(".lc_box").css("left","0px");
					// On resize jusqu'à la taille d'origine
					
				} else if (windowWidthSize>=widthElem){
					$(".lc_box").width(widthElem).height(widthElem * $(".lc_box").data('aspectRatio'));
					// On réactive le positionnement.
					$(".lc_box").css("left",(scrollX()+(windowWidthSize-widthElem))/2+"px"); 
					$(".lc_box").css("top",(scrollY()+(windowHeightSize-heightElem)/2)+"px");
				} 
			}
			
			position();
			
		} // eof function "resizeElem"
		
		
		function position(){
			if(($(".lightcube").hasClass('responsive'))==false){
				$(".lc_box").css("left",(scrollX()+(windowWidth()-widthElem))/2+"px");
				$(".lc_box").css("top",(scrollY()+(windowHeight()-heightElem)/2)+"px");
			}
		} // eof function "position"
		
		// NO USE 
		function moveToScroll_OLD(){
				
				
				var scrollBox = $(".lc_box");
				console.log(scrollBox.offset().top);
				var parent = scrollBox.parent();
				var dTop = scrollBox.offset().top; /* positionnement par défaut de l'élément */
				//var scrollBox = $(this);
				//parent.css('position','relative');
				//scrollBox.css('position','absolute');
				//console.log(scrollBox.offset().top);
				$(window).scroll(function(){
					if(scrollY()>dTop){
						scrollBox.stop().animate({top:scrollY()-scrollBox.offset().top+50},500);
					} /*else {
						scrollBox.stop().animate({top:dTop-parent.offset().top},500);
					}*/
				});
				/*if(scrollY()>dTop){
					scrollBox.stop().animate({top:scrollY()-parent.offset().top+50},500);
				}*/ 
				
				
		} // eof function "moveToScroll"
		
		
		function windowWidth(){
			
			if(window.innerWidth){
				return window.innerWidth;
			} else {
				return $(window).width();
			}
			
		} // eof function "windowWidth"
		
		
		function windowHeight(){
			
			if(window.innerHeight){
				return window.innerHeight;
			} else {
				return $(window).height();
			}
			
		} // eof function "windowHeight"
		
		
		function scrollY() { // Return the position of the top
			
		        var scrOfY = 0;
		        if( typeof( window.pageYOffset ) == 'number' ) {
		                //Netscape compliant
		                scrOfY = window.pageYOffset;
		        } else if( document.body && ( document.body.scrollTop ) ) {
		                //DOM compliant
		                scrOfY = document.body.scrollTop;
		        } else if( document.documentElement && ( document.documentElement.scrollTop ) ) {
		                //IE6 standards compliant mode
		                scrOfY = document.documentElement.scrollTop;
		        }
		        return scrOfY;
		        
		} // eof function "scrollY"
		
		
		function scrollX(){ // Return the position of the left scroll
			
		        var scrOfX = 0;
		        if( typeof( window.pageXOffset ) == 'number' ) {
		                //Netscape compliant
		                scrOfX = window.pageXOffset;
		        } else if( document.body && ( document.body.scrollLeft ) ) {
		                //DOM compliant
		                scrOfX = document.body.scrollLeft;
		        } else if( document.documentElement && ( document.documentElement.scrollLeft ) ) {
		                //IE6 standards compliant mode
		                scrOfX = document.documentElement.scrollLeft;
		        }
		         return scrOfX;
		         
		} // eof function "scrollX"
		
	};
})(jQuery); // This is the end!