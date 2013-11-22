/*!
 * LightCube - jQuery Plugin
 * version: 0.1.2 (15 Nov 2013)
 * requires jQuery v1.6 or later
 *
 * 2013-11-08 -> JS: 68,5% | CSS: 31,5%
 * 2013-11-19 -> JS: 69,3% (423 lines) | CSS: 3,7% (169 lines)
 * 2013-11-20 -> 
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
	    	"opacity"				: 0.8,
	    	"backgroundColor"		: "#000000",
			"openTime"				: 500, // 1000 = 1 seconde
			"animation"				: 'likelightbox', // 'zoom', 'likelightbox', 'none'
		    "boxWidth"				: 800, // Default Width
			"boxHeight"				: 600, // Default Height
			"videoWidth"			: 720, // Default Width (rapport 16:9)
			"videoHeight"			: 315, // Default Width (rapport 16:9)
			"mobileBreakingPoint" 	: 767, //Largeur à partir de laquelle tout affichage inférieur passe en mode Responsive
			"backgroundResponsive"	: '#FFFFFF', // Format -> Hexadecimal
			"labelClose"			: 'close', // Label show in the Mobile Device
			"autoplay"				: true, //Autoplay vidéo? True or False
			"classItem"				: 'lightcube',
			"clickImage"			: true, // True if you will active the click hover the image for close de boxe.
			"keys"  				: {
		                                "next" : {
		                                        13 : 'left', // enter
		                                        34 : 'up',   // page down
		                                        39 : 'left', // right arrow
		                                        40 : 'up'    // down arrow
		                                },
		                                "prev" : {
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
    	
    	var link			= null; 	// Shortcut for the link
    	var type 			= "image";  // Content type
    	var img 			= null;
    	var timer 			= null;
    	var title 			= null;
    	var element 		= null;
    	var idVideo 		= null;
    	var boxWidth 		= null;
    	var boxHeight 		= null;
    	var newWidth 		= null;
    	var widthElem 		= null;
    	var heightElem 		= null;
    	var headerHeight 	= null;
    	
    	var positionStatut	= true;
    	
    	// Regular expressions needed for the content (Based of ZoomBox plugin jQuery of Grafikart)
		var filtreImg			=        /(\.jpg)|(\.jpeg)|(\.bmp)|(\.gif)|(\.png)/i;
		//var filtreMP3			=        /(\.mp3)/i;
		//var filtreFLV			=        /(\.flv)/i;
		//var filtreSWF			=        /(\.swf)/i;
		//var filtreQuicktime		=        /(\.mov)|(\.mp4)/i;
		//var filtreWMV			=        /(\.wmv)|(\.avi)/i;
		//var filtreDailymotion	=        /(http:\/\/www.dailymotion)|(http:\/\/dailymotion)/i;
		//var filtreVimeo			=        /(http:\/\/www.vimeo)|(http:\/\/vimeo)/i;
		var filtreYoutube		=        /(youtube\.)/i;
		//var filtreKoreus		=        /(http:\/\/www\.koreus)|(http:\/\/koreus)/i;
    	
    	
    	$("a."+opt.classItem).click(function(event){
    		
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
			$(window).resize(resizeElem);
			$(window).scroll(function(){
				position(positionStatut);
			});
			event.preventDefault();
		});
		
		

		function shortcut(key){
			/*if(key == opt.keys.prev){
		        prev();
		    }
		    if(key == opt.keys.next){
		        next();
		    }*/
		    if(key == opt.keys.close){
		        close();
		    }
		} 
		
		
		function open(){
			$("body").append('<div class="lc_lightcube"><div class="lc_header"><a href="#" class="lc_close_mobile">'+opt.labelClose+'</a></div><div class="lc_background"></div><div class="lc_loader"></div><div class="lc_box"><div class="lc_relative"><a href="#" class="lc_close">X</a><div class="lc_content"></div></div></div></div>');
			$(".lc_loader").css("left",(scrollX()+(windowWidth()-$(".lc_loader").width() )/2)+"px"); 
			$(".lc_loader").css("top",(scrollY()+(windowHeight()-$(".lc_loader").height() )/2)+"px");
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
		} 
		
		
		function close(){
			$(".lc_lightcube").fadeOut(500,function(){
				$(".lc_lightcube").remove();
				if($("html").hasClass("lc_overlay")){
					$("html").removeClass("lc_overlay");
				}
			});
			$(window).unbind();
			return false;
			
		} 
		
		
		function loadImg(){
			
			if(img.complete){
				window.clearInterval(timer);
				buildContent();
			}
			
		} 
		
		
		
		function buildContent(){
			
			$(".lc_box").show();
			$(".lc_box").css("width",opt.boxWidth+"px")/*.css("height",opt.boxHeight+"px")*/;
			
			
			if(type=='image'){
				widthElem 	= img.width;
			    heightElem 	= img.height;
			    
				if(title){
					if(opt.clickImage){
						$(".lc_content").append('<h2>'+title+'</h2><a href="#" class="lc_close_img"><img src="'+link+'" /></a>');
					} else {
						$(".lc_content").append('<h2>'+title+'</h2><img src="'+link+'" />');
					}
				} else {
					if(opt.clickImage){
						$(".lc_content").append('<h2>&nbsp;</h2><a href="#" class="lc_close_img"><img src="'+link+'" class="lc_image_without_title" /></a>');
					} else {
						$(".lc_content").append('<h2>&nbsp;</h2><img src="'+link+'" class="lc_image_without_title" />');
					}
					
				}
				heightElem = heightElem+$(".lc_content h2").height();
				
			} else if(type=='youtube'){
				widthElem 	= opt.videoWidth;
				heightElem	= opt.videoHeight;
				
				$('.lc_relative').addClass('youtube');
				
				idVideo=link.split('watch?v=');
		        idVideo=idVideo[1].split('&');
		        idVideo=idVideo[0]+'?';
		        if(opt.autoplay==true){
		            idVideo = idVideo + 'autoplay=1&';
		        }
				
				if(title){
					$(".lc_content").append('<h2>'+title+'</h2><iframe src="http://www.youtube.com/embed/'+idVideo+'wmode=Opaque" width="'+widthElem+'px" height="'+heightElem+'px" frameborder="0" allowfullscreen></iframe>');
				} else {
					$(".lc_content").append('<h2>&nbsp;</h2><iframe src="http://www.youtube.com/embed/'+idVideo+'wmode=Opaque" width="'+widthElem+'px" height="'+heightElem+'px" frameborder="0" allowfullscreen></iframe>');
				}
				$(".lc_content iframe").data('aspectRatio', heightElem / widthElem)
					// and remove the hard coded width/height
				    .removeAttr('height')
				    .removeAttr('width');
				heightElem  = $(".lc_content iframe").height();
				
				var titleHeight = $(".lc_content h2").height();
				$(".lc_content iframe").css({'top': titleHeight+'px'});
				
			
			}
			
			$(".lc_close_mobile").click(close);
			$(".lc_close").click(close);
			if(opt.clickImage) $(".lc_close_img").click(close);
			$(".lc_background").click(close);
			
			animation();
	
		} 

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
					height: /*heightElem*/ 'auto'
				},opt.openTime/2,'swing',
					function(){
							$(".lc_content").fadeIn();
							//$(".lc_close").fadeIn();
							$(".lc_loader").fadeOut();
							resizeElem();
					}
					
				);
			}
		} 
		
		
		function resizeElem(){
			
			
			boxWidth = $(".lc_box").outerWidth();
			boxHeight = $(".lc_box").outerHeight();
			
			var windowWidthSize = windowWidth();
			var windowHeightSize = windowHeight();
			
			/*
			 * MOBILE 
			 */
			if(windowWidthSize<=opt.mobileBreakingPoint){ // Si la taille de l'écran est plus petit ou équalle au Breaking Point prévus dans les options'
			
				if($(".lc_lightcube").hasClass('responsive')==false){
					$(".lc_lightcube").addClass('responsive');
					$(".lc_lightcube .lc_background").css({
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
				
			/*
			 * DESKTOP/TABLETTE
			 */	
			} else if(windowWidthSize>opt.mobileBreakingPoint) { // Si la taille de l'écran est plus grand au Breaking Point prévus dans les options
				
				if($(".lc_lightcube").hasClass('responsive')){
					$(".lc_lightcube").removeClass('responsive');
					$(".lc_lightcube .lc_background").css({
						opacity: opt.opacity ,
						'background-color': opt.backgroundColor
					});
					positionStatut = true;
				}
				
				if(windowWidthSize<=boxWidth){ // Si la taille de l'écran est plus petit que la box - WIDTH
					
					//$(".lc_box").outerWidth(windowWidthSize).height(windowWidthSize * $(".lc_box").data('aspectRatio', boxWidth / boxHeight));
				 	//$(".lc_box").css({left:'0px'});
				 	//console.log(windowWidthSize);
				 	$(".lc_box").outerWidth(windowWidthSize);
				 	$(".lc_box img").css("width","100%");
				 	positionStatut = false;
				 	
					
				} else if ((windowWidthSize>=boxWidth) && (windowWidthSize<=widthElem)){ // Si la taille de l'écran est plus grande que la box et inéfrieur à la taille de l'image
					//$(".lc_box").width(windowWidthSize).height(windowWidthSize * $(".lc_box").data('aspectRatio'));
				 	//$(".lc_box").css("left","0px");
				 	$(".lc_box").outerWidth(windowWidthSize);
				 	$(".lc_box img").css("width","100%");
				 	positionStatut = false;
					// On resize jusqu'à la taille d'origine
					
				
				} else if (windowWidthSize>=widthElem){ // SI la taille de l'écran est plus grande que la taille de l'image.
						$(".lc_box").width(widthElem).height(widthElem * $(".lc_box").data('aspectRatio'));
						positionStatut = true; // On réactive le positionnement.
				} 
				
				
				
				if(windowHeightSize<=boxHeight){ // Si la taille de l'écran est plus petit que la box - HEIGHT
					//console.log('height touch!');
					$(".lc_box").outerHeight(windowHeightSize);
					$(".lc_box img").css("height","100%");
					positionStatut = false;
				} 
			}
			
			position(positionStatut);
			
			
		} 
		
		function position(positionStatut){
			
			if( $(".lc_lightcube").hasClass('responsive')==false && positionStatut==true ){
				$(".lc_box").css("left",(scrollX()+(windowWidth()-widthElem)/2)+"px");
				$(".lc_box").css("top",(scrollY()+(windowHeight()-heightElem)/2)+"px");
			} else if(positionStatut==false){
				$(".lc_box").css("left","0px");
				$(".lc_box").css("top",(scrollY()+(windowHeight()-heightElem)/2)+"px");
			}
			
		}
		
		function windowWidth(){
			
			if(window.innerWidth){
				return window.innerWidth;
			} else {
				return $(window).width();
			}
			
		} 
		
		
		function windowHeight(){
			
			if(window.innerHeight){
				return window.innerHeight;
			} else {
				return $(window).height();
			}
			
		} 
		
		
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
		        
		} 
		
		
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
		         
		}
		
	};
})(jQuery); // This is the end!