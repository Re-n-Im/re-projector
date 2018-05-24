var ReProjector = function( opt )
{
	/**
	 * Constants
	 */
	var INTERVAL_TIMEOUT_HIDE_CONTROLS = 3;
	var DEFAULT_ACCENT_COLOR = '#888';
	var DEFAULT_DARK_COLOR = '#282828';
	var STYLE_THEMES = [ 'dark', 'light', 'color', 'accent' ];
	var DEFAULT_THEME = 'dark';
	var DEFAULT_SELECTOR_ARRAY = [ '[href$=jpeg]', '[href$=jpg]', '[href$=png]', '[href$=gif]', '[data-href$=jpeg]', '[data-href$=jpg]', '[data-href$=png]', '[data-href$=gif]' ];
	
	// Keycodes
	var ESCAPE_KEY = 27;
	var ARROW_LEFT_KEY = 37;
	var ARROW_UP_KEY = 38;
	var ARROW_RIGHT_KEY = 39;
	var ARROW_DOWN_KEY = 40;
	var SPACE_KEY = 32;
	var F_KEY = 102;
	var H_KEY = 104;
	var I_KEY = 105;
	var F_CYR_KEY = 1092;
	var I_CYR_KEY = 1080;
	var H_CYR_KEY = 1093;
	var DIGIT_1_KEY = 49;
	var DIGIT_2_KEY = 50;
	var DIGIT_3_KEY = 51;
	
	/**
	 * This object's pointer
	 */
	var This = this;
	
	/**
	 * Counter with common purposes
	 */
	var iCn = 0;
	
	/**
	 * Options “Namespace”
	 */
	var Options = {
		'sSelector': null,
		'sTheme': null,
		'bKeyboardChangeTheme': null,
		'bKeyboardToggleExif': null,
		'bKeyboardNavigation': null,
		'bKeyboardToggleControls': null,
		'bMouseWheelNavigation': null,
		'bSwipeNavigation': null,
		'iTimerFadeOutControls': null,
		'sToggle': null,
		'bHideCursor': null,
		'bShowNextOnClick': null,
		'bZoomImageBox': null
	};
	
	/**
	 * CSS selector for the links
	 */
	Options.sSelector = '';
	
	/**
	 * Flag that indicates if exif info could be triggered by keyboard
	 */
	Options.sTheme = '';
	
	/**
	 * Flag that indicates if user is able to change background theme via keyboard
	 */
	Options.bKeyboardChangeTheme = true;
	
	/**
	 * Flag that indicates if user is able to toggle on and off photo EXIF
	 */
	Options.bKeyboardToggleExif = true;
	
	/**
	 * Flag that indicates if keyboard could be used for navigation
	 */
	Options.bKeyboardNavigation = true;
	
	/**
	 * Flag that indicates if projection controls (all) could be toggled by keyboard
	 */
	Options.bKeyboardToggleControls = true;
	
	/**
	 * Flag that indicates if mouse wheel could be used for navigation
	 */
	Options.bMouseWheelNavigation = true;
	
	/**
	 * Flag that indicates if swipe gesture could be used for navigation
	 */
	Options.bSwipeNavigation = true;
	
	/**
	 * Flag that indicates if swipe gesture could be used for navigation
	 */
	Options.iTimerFadeOutControls = INTERVAL_TIMEOUT_HIDE_CONTROLS;
	
	/**
	 * Indicator for triggering visibility of projector controls
	 */
	Options.sToggle = 'click';
	
	/**
	 * Flag to toggle visibility of cursor over canvas
	 */
	Options.bHideCursor = true;
	
	/**
	 * Flag for showing next image at click over projector
	 */
	Options.bShowNextOnClick = false;
	
	/**
	 * Zoom link box when opened; still experimental
	 */
	Options.bZoomImageBox = false;
	
	/**
	 * Lang “Namespace”
	 */
	var Lang = {
		'exposurePrograms': null,
		'months': null,
		'units': null,
		'translate': null
	};
	var UserLang = {
		'exposurePrograms': {},
		'months': {},
		'units': {},
		'translate': null
	};
	
	/**
	 * Exposure programs
	 * (0x8822) EXIF tag translations
	 * More info:
	 * http://www.awaresystems.be/imaging/tiff/tifftags/privateifd/exif/exposureprogram.html
	 */
	Lang.exposurePrograms = {
		0: 'Not defined',
		1: 'Manual',
		2: 'Normal program',
		3: 'Aperture priority',
		4: 'Shutter priority',
		5: 'Creative program',
		6: 'Action program',
		7: 'Portrait mode',
		8: 'Landscape mode'
	};
	
	/**
	 * Month names
	 */
	Lang.months = {
		1:'Jan',2:'Feb',3:'Mar',
		4:'Apr',5:'May',6:'Jun',
		7:'Jul',8:'Aug',9:'Sep',
		10:'Oct',11:'Nov',12:'Dec'
	};
	
	/**
	 * Unit names
	 */
	Lang.units = {
		'seconds': 's',
		'milimeters': 'mm'
	};
	
	/**
	 * Local translator
	 *
	 * @param	section	string
	 * @param	key	mixed
	 * @return	string
	 */
	Lang.translate =
	UserLang.translate = function( section, key )
	{
		if( typeof UserLang[ section ][ key ] !== 'undefined' ) {
			return UserLang[ section ][ key ];
		} else {
			return Lang[ section ][ key ];
		}
	}
	
	/**
	 * Inner “Namespace”
	 */
	var Inner = {};
	
	/**
	 * Document DOM Body
	 */
	Inner.oBody = $( 'body' );
	
	/**
	 * Canvas for “projection” of photographs
	 */
	Inner.oCanvas = null;
	
	/**
	 * Theme color meta tag
	 */
	Inner.oMetaThemeColor = null;
	
	/**
	 * Current photograph link
	 */
	Inner.oCurr = null;
	
	/**
	 * Next photograph link
	 */
	Inner.oNext = null;
	
	/**
	 * Previous photograph link
	 */
	Inner.oPrev = null;
	
	/**
	 * Interval for hidding controls
	 */
	Inner.iIntervalHideArrowsProjector = null;
	
	/**
	 * Is this instance active flag
	 */
	Inner.bActive = false;
	
	/**
	 * Flag to check if the oCanvas has been touched and then mousemoved
	 */
	Inner.bTouchAndMove = true;
	
	/**
	 * Flag to check if the oCanvas has been touched and then mousemoved
	 */
	Inner.iTouchAndMoveDistance = 0;
	
	/**
	 * Chnage projected photograp callback
	 */
	Inner.changePhotographCallback = null;
	
	/**
	 * Default projector open callback
	 */
	Inner.openCallback = null;
	
	/**
	 * Default projector close callback
	 */
	Inner.closeCallback = null;
	
	/**
	 * Default show controls callback
	 */
	Inner.showControlsCallback = null;
	
	/**
	 * Default hide controls callback
	 */
	Inner.hideControlsCallback = null;
	
	/**
	 * Additional canvas click callback
	 */
	Inner.canvasClickCallback = null;
	
	/**
	 * Handles the oCanvas click
	 * 
	 * @return	void
	 */
	Inner.canvasClickHandler = function( )
	{
		var bPass = true;
		
		if( Inner.bActive ) {
			if( Inner.canvasClickCallback ) {
				bPass = Inner.canvasClickCallback.call( );
			}
		
			if( bPass ) {
				// Inner.triggerProjectionControlsVisibility.call( );
				Inner.closeReProjector.call( );
			}
		}
	};
	
	/**
	 * Handles the click over oCanvas’ image
	 * 
	 * @param	e	event
	 * @return	void
	 */
	Inner.canvasImageClickHandler = function( e )
	{
		e.stopPropagation( );
		e.preventDefault( );
		
		if( Inner.bActive ) {
			if( Inner.bTouchAndMove )
				return false;
			
			if( Options.sToggle == 'click' ) {
				Inner.toggleVisibilityOfProjectionControls.call( );
			} else {
				if( !Inner.areProjectionControlsVisible.call( ) )
					Inner.showProjectionControls.call( );
				
				if( Options.bShowNextOnClick )
					Inner.previewNext.call( );
			}
		}
	};
	
	/**
	 * Handles the mousedown over oCanvas’ image
	 * 
	 * @param	e	event
	 * @return	void
	 */
	Inner.canvasImageMousedownHandler = function( e )
	{
		if( !Inner.isTouchDevice.call( ) )
			e.preventDefault( );
		
		if( Inner.bActive ) {
			Inner.bTouchAndMove = false;
			Inner.iTouchAndMoveDistance = e.pageX || e.originalEvent.targetTouches[0].pageX;
		}
	};
	
	/**
	 * Handles the mousemove over oCanvas’ image
	 * 
	 * @param	e	event
	 * @return	void
	 */
	Inner.canvasImageMousemoveHandler = function( e )
	{
		if( Inner.bActive ) {
			if( Inner.bTouchAndMove === false ) {
				Inner.bTouchAndMove = true;
			}
		}
	};
	
	/**
	 * Handles the mouseup over oCanvas’ image
	 * 
	 * @param	e	event
	 * @return	void
	 */
	Inner.canvasImageMouseupHandler = function( e )
	{
		if( Inner.bActive ) {
			setTimeout( function( ) { // To fire after click
				if( Inner.bTouchAndMove && Options.bSwipeNavigation ) {
					var fDiff = Inner.iTouchAndMoveDistance - ( e.pageX || e.originalEvent.changedTouches[0].pageX );
					
					if( Math.abs( fDiff ) > 40 ) {
						Inner.swipeHandler.call( null, e, fDiff > 0 ? 'left' : 'right' );
					}
				}
				
				Inner.iTouchAndMoveDistance = 0;
				Inner.bTouchAndMove = null;
			}, 0 );
		}
	};
	
	/**
	 * Hide projector controls till time of idle mode
	 *
	 * @return	void
	 */
	Inner.hideProjectionControls = function( )
	{
		if( !Inner.oCanvas.hasClass( 'hide-projection-controls' ) )
			Inner.oCanvas
			.addClass( 'hide-projection-controls' + ( ( Options.sToggle == 'click' || !Options.bHideCursor ) ? ' leave-cursor-visible' : '' ) );
		
		if( typeof Inner.hideControlsCallback == 'function' )
			Inner.hideControlsCallback.call( );
	};
	
	/**
	 * Show projector controls on first mousemove after idle time
	 *
	 * @return	void
	 */
	Inner.showProjectionControls = function( )
	{
		if( Inner.oCanvas.hasClass( 'hide-projection-controls' ) )
			Inner.oCanvas
			.removeClass( 'hide-projection-controls' + ( ( Options.sToggle == 'click' || !Options.bHideCursor ) ? ' leave-cursor-visible' : '' ) );
		
		// Inner.resetIntervalHideProjectorControls.call( );
		
		if( typeof Inner.showControlsCallback == 'function' )
			Inner.showControlsCallback.call( );
	};
	
	/**
	 * Checks whether the controls are visible or not
	 *
	 * @return	boolean
	 */
	Inner.areProjectionControlsVisible = function( )
	{
		if( Inner.oCanvas.hasClass( 'hide-projection-controls' ) )
			return false;
		else
			return true;
	};
	
	/**
	 * Trigger projector controls visibility — show/hide
	 *
	 * @return	void
	 */
	Inner.triggerProjectionControlsVisibility = function( go )
	{
		if( ( This.isCanvasVisible( ) || go ) && !Inner.isTouchDevice.call( ) && Options.sToggle == 'mousemove' )
		{
			Inner.showProjectionControls.call( );
			Inner.resetIntervalHideProjectorControls.call( );
		}
	};
	
	/**
	 * Reset timeout of hidding projector's controls
	 *
	 * @return	void
	 */
	Inner.resetIntervalHideProjectorControls = function( )
	{
		if( Inner.iIntervalHideArrowsProjector ) {
			clearTimeout( Inner.iIntervalHideArrowsProjector );
		}
		
		Inner.iIntervalHideArrowsProjector = setTimeout( function( ) {
			if( Options.sToggle == 'mousemove' ) {
				Inner.hideProjectionControls.call( );
			}
		}, ( Options.iTimerFadeOutControls ) * 1000 );
	};
	
	/**
	 * Get new EXIF content
	 *
	 * return	mixed
	 */
	Inner.getNewExifContent = function( )
	{
		var oPd = $( this );
		var aExifParams = [];
		var oContent = $( '<div/>' )
			.addClass( 'exif-info-box' );
		
		if( oPd.data( 'camera-model' ) )
		{
			aExifParams = [{
				'title': 'Model',
				'image': './images/exif-info/camera.svg',
				'value': oPd.data( 'camera-model' ).toLowerCase( ).replace( /\b([a-zA-Z])/g , function(m){return m.toUpperCase();} )
			} , {
				'title': 'Length',
				'image': './images/exif-info/length.svg',
				'value': null
			} , {
				'title': 'F number',
				'image': './images/exif-info/aperture.svg',
				'value': null
			} , {
				'title': 'ISO',
				'image': './images/exif-info/iso.svg',
				'value': oPd.data( 'camera-iso' )
			} , {
				'title': 'Exposure',
				'image': './images/exif-info/exposure.svg',
				'value': null
			} , {
				'title': 'Program',
				'image': './images/exif-info/mode.svg',
				'value': Lang.translate.call( null, 'exposurePrograms', oPd.data( 'camera-program' ) )
			} , {
				'title': 'Date',
				'image': './images/exif-info/date.svg',
				'value': null
			}];
			
			if( oPd.data( 'camera-flength' ) )
			{
				aExifParams[ 1 ].value = eval( oPd.data( 'camera-flength' ) ) + ' ' + Lang.translate.call( null, 'units', 'milimeters' );
			}
			
			if( oPd.data( 'camera-aperture' ) )
			{
				aExifParams[ 2 ].value ='ƒ/' + eval( oPd.data( 'camera-aperture' ) );
			}
			
			if( oPd.data( 'camera-exposure' ) && oPd.data( 'camera-exposure' ).match( /\// ) )
			{
				var aExp = oPd.data( 'camera-exposure' ).split( '/' );
				var sExp = oPd.data( 'camera-exposure' );
				
				if( aExp[ 0 ] < aExp[ 1 ] && aExp[ 0 ] == 10 )
				{
					sExp = '1/' + ( aExp[ 1 ] / 10 );
				}
				else if( aExp[ 0 ] > aExp[ 1 ] && aExp[ 1 ] == 10 )
				{
					sExp = aExp[ 0 ] / 10;
				}
				else if( aExp[ 0 ] > aExp[ 1 ] && aExp[ 1 ] == 1 )
				{
					sExp = aExp[ 0 ];
				}
				else if( aExp[ 0 ] == aExp[ 1 ] )
				{
					sExp = 1;
				}
				
				aExifParams[ 4 ].value = sExp + ' ' + Lang.translate.call( null, 'units', 'seconds' );
			}
			
			if( oPd.data( 'camera-date' ) )
			{
				var aOr = oPd.data( 'camera-date' ).split(/[- :]/);
				var dOr = new Date(aOr[0], aOr[1]-1, aOr[2], aOr[3], aOr[4], aOr[5]);
				var sOr = dOr.getDate( ) + ' ' + Lang.translate.call( null, 'months', dOr.getMonth( ) ) + ' ' + dOr.getFullYear( );
				
				aExifParams[ 6 ].value = sOr;
			}
			
			for( var i = 0; aExifParams.length > i; ++i )
			{
				if( !aExifParams[ i ].value )
					continue;
				
				oContent
				.append(
					$( '<div/>' )
					.addClass( 'exif-record' )
					.append(
						$( '<em/>' )
						.css(
						{
							'backgroundImage': 'url( "' + aExifParams[ i ][ 'image' ] + '" )'
						} )
					)
					.append(
						$( '<strong/>' )
						.text( aExifParams[ i ][ 'value' ] )
					)
				);
			}
		}
		
		return oContent.is( ':empty' ) ? null : oContent;
	};
	
	/**
	 * Get new description content
	 *
	 * return	mixed
	 */
	Inner.getNewDescriptionContent = function( )
	{
		var oPd = $( this );
		var oContent = $( '<div/>' )
			.addClass( 'description-info-box' );
		
		if( !( typeof oPd.data( 'title' ) == 'undefined' || oPd.data( 'title' ) == '' )
			|| !( typeof oPd.data( 'description' ) == 'undefined' || oPd.data( 'description' ) == '' )
		) {
			var oTCont = $( '<div/>' )
				.addClass( 'photograph-title' )
				.appendTo( oContent );
			
			if( oPd.data( 'title' ) != '' )
			{
				oTCont
				.append(
					$( '<strong/>' )
					.addClass( 'info-photograph-text' )
					.text( oPd.data( 'title' ) )
				);
			}
			
			if( oPd.data( 'description' ) != '' )
			{
				oTCont
				.append(
					$( '<small/>' )
					.addClass( 'info-photograph-text' )
					.text( oPd.data( 'description' ) )
				);
			}
			
			return oContent;
		}
		else
			return null;
	};
	
	/**
	 * Handles swipe
	 *
	 * @param	event	event
	 * @param	direction	Swipe direction
	 * @param	distance	Swipe distance
	 * @param	duration	Swipe duration
	 * @return	void
	 */
	Inner.swipeHandler = function(
		event,
		direction,
		distance,
		duration
	) {
		event.preventDefault( );
		event.stopImmediatePropagation( );
		
		if( Inner.bActive && !Inner.isZoomed.call( ) ) {
			switch( direction ) {
				case 'left': Inner.previewNext.call( ); break;
				case 'right': Inner.previewPrev.call( ); break;
			}
		}
		
		return false;
	}
	
	/**
	 * Handles the mousemove
	 *
	 * @param	e	event
	 * @return	void
	 */
	Inner.documentMousemoveHandler = function( e )
	{
		if( Inner.bActive )
			Inner.triggerProjectionControlsVisibility.call( );
	};
	
	/**
	 * Handles the keypress
	 *
	 * @param	e	event
	 * @return	void
	 */
	Inner.documentKeypressHandler = function( e )
	{
		var iCode = e.which || e.keyCode;
		
		if( This.isCanvasVisible( )
			&& Inner.bActive
			&& (
				iCode == I_KEY
				|| iCode == F_KEY
				|| iCode == H_KEY
				|| iCode == I_CYR_KEY
				|| iCode == F_CYR_KEY
				|| iCode == H_CYR_KEY
				|| iCode == DIGIT_1_KEY
				|| iCode == DIGIT_2_KEY
				|| iCode == DIGIT_3_KEY
			)
		) {
			if( iCode == I_KEY || iCode == I_CYR_KEY )
			{
				if( Options.bKeyboardToggleExif )
					Inner.toggleExifInfoCont.call( );
			}
			else if( iCode == F_KEY || iCode == F_CYR_KEY )
			{
				if( Options.bKeyboardNavigation )
					Inner.fullscreenTogglerHandler.call( );
			}
			else if( iCode == H_KEY || iCode == H_CYR_KEY )
			{
				if( Options.bKeyboardToggleControls ) {
					if( Options.sToggle == 'mousemove' ) {
						if( Inner.areProjectionControlsVisible.call( ) ) {
							Inner.hideProjectionControls.call( );
						} else{
							Inner.triggerProjectionControlsVisibility.call( );
						}
					} else {
						if( Inner.areProjectionControlsVisible.call( ) ) {
							Inner.hideProjectionControls.call( );
						} else {
							Inner.showProjectionControls.call( );
						}
					}
				}
			}
			else if( iCode == DIGIT_1_KEY )
			{
				if( Options.bKeyboardChangeTheme && Inner.bActive ) {
					Inner.changeStyleColor.call( null, 'dark' );
					Inner.createCookie.call( null, 'projector-background' , 'dark' );
					Options.sTheme = 'dark';
				}
			}
			else if( iCode == DIGIT_2_KEY )
			{
				if( Options.bKeyboardChangeTheme && Inner.bActive ) {
					Inner.changeStyleColor.call( null, 'light' );
					Inner.createCookie.call( null, 'projector-background' , 'light' );
					Options.sTheme = 'light';
				}
			}
			else if( iCode == DIGIT_3_KEY )
			{
				if( Options.bKeyboardChangeTheme && Inner.bActive ) {
					Inner.changeStyleColor.call( null, 'accent' );
					Inner.createCookie.call( null, 'projector-background' , 'accent' );
					Options.sTheme = 'accent';
				}
			}
		}
	};
	
	/**
	 * Handles the keydown
	 *
	 * @param	e	event
	 * @return	void
	 */
	Inner.documentKeydownHandler = function( e )
	{
		var iCode = e.which || e.keyCode;
		
		if( This.isCanvasVisible( )
			&& Inner.bActive
			&& (
				iCode >= ARROW_LEFT_KEY && iCode <= ARROW_DOWN_KEY
				|| iCode == ESCAPE_KEY
				|| iCode == SPACE_KEY
			)
		) {
			e.stopPropagation( );
			e.preventDefault( );
			
			if(
				iCode == ARROW_LEFT_KEY
				|| iCode == ARROW_UP_KEY
				|| ( iCode == SPACE_KEY && e.shiftKey )
			) {
				if( Options.bKeyboardNavigation )
					Inner.previewPrev.call( );
			}
			else if(
				iCode == ARROW_RIGHT_KEY
				|| iCode == ARROW_DOWN_KEY
				|| iCode == SPACE_KEY
			) {
				if( Options.bKeyboardNavigation )
					Inner.previewNext.call( );
			}
			else if( iCode == ESCAPE_KEY )
			{
				if( Options.bKeyboardNavigation ) {
					if( Inner.isSettingsContOpened.call( ) )
						Inner.closeSettingsCont.call( );
					else
						Inner.closeReProjector.call( );
				}
			}
		}
	};
	
	/**
	 * Handles the image link click
	 *
	 * @param	e	event
	 * @return	void
	 */
	Inner.imageLinkClickHandler = function( e )
	{
		e.preventDefault( );
		
		if( !This.isCanvasVisible( ) )
			Inner.preview.call( null, $( this ) );
		
		// EXPERIMENTAL!!!
		if( Options.bZoomImageBox )
			Inner.openZoomImageBox.call( this );
		
		return false;
	};
	
	/**
	 * Manage cookies
	 * Source taken from:
	 * https://www.sitepoint.com/how-to-deal-with-cookies-in-javascript/
	 */
	
	/**
	 * Creates a cookie
	 *
	 * @param	name	Cookie name
	 * @param	value	Cookie value
	 * @param	days	Cookie expiration days
	 * @return	void
	 */
	Inner.createCookie = function(name,value,days) {
		if (days) {
			var date = new Date();
			date.setTime(date.getTime()+(days*24*60*60*1000));
			var expires = "; expires="+date.toGMTString();
		}
		else var expires = "";
		document.cookie = name+"="+value+expires+"; path=/";
	}
	/**
	 * Read a cookie
	 *
	 * @param	name	Cookie name to read
	 * @return	string/null
	 */
	Inner.readCookie = function(name) {
		var nameEQ = name + "=";
		var ca = document.cookie.split(';');
		for(var i=0;i < ca.length;i++) {
			var c = ca[i];
			while (c.charAt(0)==' ') c = c.substring(1,c.length);
			if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
		}
		return null;
	}
	/**
	 * Deletes a cookie
	 *
	 * @param	name	Cookie name to erase
	 * @return	void
	 */
	Inner.eraseCookie = function(name) {
		Inner.createCookie.call(null, name, "", -1);
	}
	
	/**
	 * Mouse wheel handler
	 * Source taken from:
	 * http://jsfiddle.net/CvCc6/1/
	 *
	 * @return	boolean
	 */
	Inner.mouseWheelHandler = function( )
	{
		return function (e) {
			if( Inner.bActive && Options.bMouseWheelNavigation ) {
				// cross-browser wheel delta
				var e = window.event || e;
				var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
				var bDir = !( delta < 0 ); // true – up, false – down
				
				if( !bDir )
					Inner.previewNext.call( );
				else
					Inner.previewPrev.call( );
				
				return bDir;
			}
		};
	};
	
	/**
	 * Zoom level checker
	 *
	 * @return	boolean
	 */
	Inner.isZoomed = function( )
	{
		// Mobile only
		// return window.innerWidth != window.outerWidth;
		return document.documentElement.clientWidth != window.innerWidth;
	};
	
	/**
	 * Detecter for touch event
	 * Source:
	 * https://stackoverflow.com/questions/4817029/whats-the-best-way-to-detect-a-touch-screen-device-using-javascript
	 *
	 * @return boolean
	 */
	Inner.isTouchDevice = function( )
	{
		try {
			document.createEvent( "TouchEvent" );
			return true;
		} catch( e ) {
			return false;
		}
	};
	
	/**
	 * Fullscreen utilities
	 * Source:
	 * https://davidwalsh.name/fullscreen
	 */
	Inner.launchIntoFullscreen = function( element ) {
	  if(element.requestFullscreen) {
		element.requestFullscreen();
	  } else if(element.mozRequestFullScreen) {
		element.mozRequestFullScreen();
	  } else if(element.webkitRequestFullscreen) {
		element.webkitRequestFullscreen();
	  } else if(element.msRequestFullscreen) {
		element.msRequestFullscreen();
	  }
	}
	Inner.exitFullscreen = function( ) {
	  if(document.exitFullscreen) {
		document.exitFullscreen();
	  } else if(document.mozCancelFullScreen) {
		document.mozCancelFullScreen();
	  } else if(document.webkitExitFullscreen) {
		document.webkitExitFullscreen();
	  }
	}
	Inner.oFullscreenElement = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement;
	Inner.oFullscreenEnabled = document.fullscreenEnabled || document.mozFullScreenEnabled || document.webkitFullscreenEnabled;
	
	/**
	 * Fullscreen check
	 * Source:
	 * https://stackoverflow.com/questions/28595686/how-can-i-check-if-an-element-is-in-fullscreen-with-the-fullscreen-api-for-html5
	 */
	Inner.inFullscreen = function( ) {
		if (typeof(document.isFullscreen === undefined))
		{
			return document.webkitIsFullscreen || //Webkit browsers
				document.mozFullScreen || // Firefox
				function() { // IE
					if (document.msFullscreenElement !== undefined)
						return true;
					return false;
				}();
		}
		else
		{
			return document.isFullscreen;
		}
	}
	
	Inner.settingsProjectionContClickHandler = function( e )
	{
		e.stopPropagation( );
	};
	
	Inner.settingsProjectionButtonClickHandler = function( e )
	{
		var oOo = $( this );
		var oPo = oOo.parent( );
		
		if( Inner.bActive ) {
			oPo.toggleClass( 'opened' );
		}
	};
	
	Inner.closeProjectionButton = function( e )
	{
		e.stopPropagation( );
		
		if( Inner.bActive ) {
			Inner.closeReProjector.call( );
		}
	};
	
	Inner.nextPhotographProjectionControlClickHandler = function( e )
	{
		e.stopPropagation( );
		
		if( Inner.bActive ) {
			Inner.previewNext.call( );
			Inner.triggerProjectionControlsVisibility.call( );
		}
		
		return false;
	};
	
	Inner.prevPhotographProjectionControlClickHandler = function( e )
	{
		e.stopPropagation( )
		
		if( Inner.bActive ) {
			Inner.previewPrev.call( );
			Inner.triggerProjectionControlsVisibility.call( );
		}
		
		return false;
	};
	
	Inner.settingsProjectionBackgroundButtonClickHandler = function( e )
	{
		if( Inner.bActive ) {
			var oOo = $( this );
			var oSi = oOo.parent( ).find( '.settings-projection-background-button' );
			var sTh = oOo.data( 'style' );
			
			oSi.removeClass( 'active' );
			oOo.addClass( 'active' );
			Inner.changeStyleColor.call( null, sTh );
			Inner.createCookie.call( null, 'projector-background' , sTh );
			Options.sTheme = sTh;
		}
	};
	
	Inner.settingsProjectionFullscreenButtonClickHandler = function( e )
	{
		if( Inner.bActive ) {
			Inner.fullscreenTogglerHandler.call( );
		}
	};
	
	Inner.photographExifInfoButtonClickHandler = function( e )
	{
		if( Inner.bActive ) {
			var oOo = $( this );
			var oPo = oOo.parent( );
			
			oPo.toggleClass( 'opened' );
		}
	};
	
	Inner.photographExifInfoClickHandler = function( e )
	{
		e.stopPropagation( );
		return false;
	};
	
	Inner.photographDescriptionInfoClickHandler = function( e )
	{
		e.stopPropagation( );
		return false;
	};
	
	/**
	 * Project the photograph
	 * 
	 * @param	DOMElement	photo	The Link of the photograph to preview
	 * @return	void
	 */
	Inner.preview = function( photo )
	{
		var sPhoto = $( photo ).attr( 'href' ) || $( photo ).data( 'href' );
		
		var loadedImageHandler = function( )
		{
			if( typeof Inner.changePhotographCallback == 'function' )
				Inner.changePhotographCallback.call( Inner.oCurr );
			
			Inner.oCanvas
			.addClass( 'loaded' );
		};
		
		var previewHandler = function( e )
		{
			var oCurrLink = This.getCurrentLink( );
			var oImg = $( '<img/>' )
			.one( 'load' , loadedImageHandler )
			.attr( 'src' , sPhoto )
			.appendTo( Inner.oCanvas );
			
			if( Inner.oCanvas.find( 'img:not(:last-child)' ).length )
				Inner.oCanvas.find( 'img:not(:last-child)' ).remove( );
			
			Inner.setStyleColor.call( );
			
			// Old school...
			// if( oImg[ 0 ].complete )
			// 	loadedImageHandler( );
		};
		
		Inner.setPhotographLinks.call( null, photo );
		
		if( This.isCanvasVisible( ) )
			previewHandler.call( );
		else
			Inner.openReProjector.call( null, previewHandler );
		
		Inner.changeStyleColor.call( );
		Inner.rewritePhotographInfo.call( );
	};
	
	/**
	 * Allow external script to set classes of Canvas
	 * 
	 * @param	Array	classes		Array of classes list
	 * @return	Projector
	 */
	Inner.setClasses = function( classes )
	{
		Inner.oCanvas
		.removeClass( classes[ 0 ] )
		.addClass( classes[ 1 ] );
		
		return this;
	};
	
	/**
	 * Opens the canvas on full browser screen
	 * 
	 * @param	function	callback	After animation finishes callback
	 * @return	Projector
	 */
	Inner.openReProjector = function( callback )
	{
		Inner.oCanvas.addClass( 'preload' );
		Inner.oBody.addClass( 're-projection' );
		Inner.bActive = true;
		
		Inner.oCanvas
		.stop( )
		.addClass( 'opened' )
		.animate(
		{
			'opacity': 1
		} , 300 , function( e )
		{
			if( typeof callback == 'function' )
				callback.call( );
		});
		
		Inner.triggerProjectionControlsVisibility.call( null, 'go' );
		
		if( typeof Inner.openCallback == 'function' )
			Inner.openCallback.call( );
		
		if( typeof history.pushState === "function" ) {
			if( history.state != 'ReProjectorOpened' ) {
				history.pushState( "ReProjectorOpened", null, null );
			}
		}
		
		return This;
	};
	
	/**
	 * Closes the canvas
	 * 
	 * @param	function	callback	After animation finishes callback
	 * @return	Projector
	 */
	Inner.closeReProjector = function( callback )
	{
		Inner.oBody.removeClass( 're-projection' );
		Inner.bActive = false;
		
		Inner.oCanvas
		.stop( )
		.animate(
		{
			'opacity': 0
		} , 300 , function( e )
		{
			Inner.blankProjectorScreen.call( );
			
			Inner.resetStyleColor.call( );
			
			Inner.oCanvas
			.removeClass( 'opened preload hide-projection-controls leave-cursor-visible' );
			
			if( typeof callback == 'function' )
				callback.call( );
		});
		
		This
		.exitFullscreen( );
		
		Inner.closeSettingsCont.call( );
		clearTimeout( Inner.iIntervalHideArrowsProjector );
		
		if( typeof Inner.closeCallback == 'function' )
			Inner.closeCallback.call( );
		
		if( typeof history.pushState === 'function' ){
			if( history.state == 'ReProjectorOpened' ) {
				history.back( );
			}
		}
		
		return This;
	};
	
	/**
	 * Set the toolbar color for mobile chrome browser
	 *
	 * @return	Projector
	 */
	Inner.setStyleColor = function( )
	{
		if( This.isCanvasVisible( ) )
		{
			var sMetaColor = '';
			
			if( Inner.oCanvas.hasClass( 'accent' ) )
			{
				var sAccentColor = This.getCurrentAccentColor( );
				
				Inner.oCanvas
				.removeClass( 'light dark' )
				.css(
				{
					'backgroundColor': sAccentColor
				});
				
				sMetaColor = sAccentColor;
			}
			else if( Inner.oCanvas.hasClass( 'dark' ) )
			{
				Inner.oCanvas
				.removeClass( 'light accent' );
				
				sMetaColor = DEFAULT_DARK_COLOR;
			}
			else if( Inner.oCanvas.hasClass( 'light' ) )
			{
				Inner.oCanvas
				.removeClass( 'accent dark' );
				
				sMetaColor = Inner.oMetaThemeColor.data( 'content' );
			}
			
			Inner.oMetaThemeColor.attr( 'content' , sMetaColor );
		}
		
		return This;
	}
	
	/**
	 * Rollback the value of the meta tag for toolbar color — mobile chrome browser
	 *
	 * @return	Projector
	 */
	Inner.resetStyleColor = function( )
	{
		Inner.oMetaThemeColor.attr( 'content' , Inner.oMetaThemeColor.data( 'content' ) );
		
		return This;
	};
	
	/**
	 * Project the next photograph
	 * 
	 * @return	Projector
	 */
	Inner.previewNext = function( )
	{
		Inner.blankProjectorScreen.call( );
		Inner.clearPhotographInfo.call( );
		Inner.preview.call( null, Inner.oNext );
		
		return This;
	};
	
	/**
	 * Project the prev photograph
	 * 
	 * @return	Projector
	 */
	Inner.previewPrev = function( )
	{
		Inner.blankProjectorScreen.call( );
		Inner.clearPhotographInfo.call( );
		Inner.preview.call( null, Inner.oPrev );
		
		return This;
	};
	
	/**
	 * Cleanup “screen”, i.e. removes the image
	 *
	 * @return	Projector
	 */
	Inner.blankProjectorScreen = function( )
	{
		Inner.oCanvas
		.removeClass( 'loaded' )
		// .find( 'img' )
		// .remove( );
		
		return This;
	};
	
	/**
	 * Change content of the photograph info box
	 * 
	 * @param	content		A(n) HTML content that appears in the photograph info box
	 * @return	Projector
	 */
	Inner.rewritePhotographInfo = function( content )
	{
		var oO = This.getCurrentLink( );
		var oEo = Inner.getNewExifContent.call( oO );
		var oDo = Inner.getNewDescriptionContent.call( oO );
		var oTe = Inner.oCanvas.find( '.photograph-exif-info');
		var oTd = Inner.oCanvas.find( '.photograph-description-info');
		
		oTe.find('.exif-info-box' ).remove( );
		
		if( oEo )
		{
			oTe
			.removeClass( 'empty' )
			.append( oEo );
		}
		else
		{
			oTe
			.addClass( 'empty' );
		}
		
		oTd.find('.description-info-box' ).remove( );
		
		if( oDo )
		{
			oTd
			.removeClass( 'empty' )
			.append( oDo );
		}
		else
		{
			oTd
			.addClass( 'empty' );
		}
		
		return This;
	};
	
	/**
	 * Purge content of the photograph info box
	 * 
	 * @return	Projector
	 */
	Inner.clearPhotographInfo = function( )
	{
		Inner.oCanvas
		.find( '.photograph-exif-info .exif-info-box' )
		.remove( );
		
		return This;
	};
	
	/**
	 * Set current, next and prev links to photographs
	 * 
	 * @param	DOMElement	o	Link to the photograph
	 * @return	Projector
	 */
	Inner.setPhotographLinks = function( o )
	{
		var oLinksList = $( Options.sSelector );
		
		Inner.oCurr = o;
		Inner.oNext = oLinksList.index( o ) != oLinksList.length - 1 ? oLinksList.eq( oLinksList.index( o ) + 1 ) : oLinksList.eq( 0 );
		Inner.oPrev = oLinksList.index( o ) != 0 ? oLinksList.eq( oLinksList.index( o ) - 1 ) : oLinksList.eq( oLinksList.length - 1 );
		
		return This;
	};
	
	/**
	 * Change the projector background color
	 *
	 * @return	void
	 */
	Inner.changeStyleColor = function( val )
	{
		if( Inner.bActive ) {
			val = val ? val : Inner.getCanvasBackgroundTheme.call( );
			
			Inner.setClasses.call( null, [
				'light dark accent',
				val
			]);
			
			Inner.setStyleColor.call( );
		}
	};
	
	/**
	 * Toggles the state of fullscreen
	 *
	 * @return	Projector
	 */
	Inner.fullscreenTogglerHandler = function( )
	{
		if( This.checkIfFullscreen( ) )
			This.exitFullscreen( );
		else
			This.expandToFullscreen( );
		
		return This;
	};
	
	/**
	 * Check if the settings menu is opened
	 *
	 * @return	boolean
	 */
	Inner.isSettingsContOpened = function( )
	{
		return Inner.oCanvas.find( '.settings-projection-cont' ).is( '.opened' );
	};
	
	/**
	 * Opens the settings menu
	 *
	 * @return	Projector
	 */
	Inner.openSettingsCont = function( )
	{
		Inner.oCanvas.find( '.settings-projection-cont' ).addClass( 'opened' );
		
		return This;
	};
	
	/**
	 * Closes the settings menu
	 *
	 * @return	Projector
	 */
	Inner.closeSettingsCont = function( )
	{
		Inner.oCanvas.find( '.settings-projection-cont' ).removeClass( 'opened' );
		
		return This;
	};
	
	/**
	 * Set default show controls callback
	 * 
	 * @param 	Function 	callback
	 * @return	Projector
	 */
	Inner.setShowControlsCallback = function( callback )
	{
		Inner.showControlsCallback = callback;
		
		return This;
	};
	
	/**
	 * Set default hide controls callback
	 * 
	 * @param 	Function 	callback
	 * @return	Projector
	 */
	Inner.setHideControlsCallback = function( callback )
	{
		Inner.hideControlsCallback = callback;
		
		return This;
	};
	
	/**
	 * Check if the exif info menu is opened
	 *
	 * @return	boolean
	 */
	Inner.isExifInfoContOpened = function( )
	{
		return Inner.oCanvas.find( '.photograph-exif-info' ).is( '.opened' );
	};
	
	/**
	 * Opens the exif info menu
	 *
	 * @return	Projector
	 */
	Inner.openExifInfoCont = function( )
	{
		Inner.oCanvas.find( '.photograph-exif-info' ).addClass( 'opened' );
		
		return This;
	};
	
	/**
	 * Closes the exif info menu
	 *
	 * @return	Projector
	 */
	Inner.closeExifInfoCont = function( )
	{
		Inner.oCanvas.find( '.photograph-exif-info' ).removeClass( 'opened' );
		
		return This;
	};
	
	/**
	 * Toggle the exif info menu
	 *
	 * @return	Projector
	 */
	Inner.toggleExifInfoCont = function( )
	{
		if( Inner.isExifInfoContOpened.call( ) )
			Inner.closeExifInfoCont.call( );
		else
			Inner.openExifInfoCont.call( );
		
		return This;
	};
	
	/**
	 * Toggles the visibility of projection controls
	 *
	 * @return	Projector
	 */
	Inner.toggleVisibilityOfProjectionControls = function( )
	{
		if( Options.sToggle == 'click' ) {
			if( Inner.areProjectionControlsVisible.call( ) ) {
				Inner.hideProjectionControls.call( );
			} else {
				Inner.showProjectionControls.call( );
			}
		} else if( Options.sToggle == 'mousemove' ) {
			Inner.triggerProjectionControlsVisibility.call( );
		}
	};
	
	/**
	 * Get canvas' theme background
	 * 
	 * @return	{string}
	 */
	Inner.getCanvasBackgroundTheme = function( )
	{
		if( Options.sTheme != '' )
			return Options.sTheme;
		else
			return Inner.getCanvasThemeIfNotInOptions.call( );
	};
	
	/**
	 * Get theme if not set in options
	 * 
	 * @return	{string}
	 */
	Inner.getCanvasThemeIfNotInOptions = function( )
	{
		if( t = Inner.readCookie.call( null, 'projector-background' ) )
			return t;
		else
			return DEFAULT_THEME;
	};
	
	/**
	 * Experimental zoom when open link
	 */
	Inner.openZoomImageBox = function( )
	{
		oB = $( this );
		var oRP = oB.clone( )
		.html( '' )
		.css({
			'position': 'fixed',
			'margin': 0,
			'opacity': 0,
			'top': oB.offset( ).top - $( document ).scrollTop( ),
			'left': oB.offset( ).left - $( document ).scrollLeft( )
		})
		.appendTo( oB.parent( ) );
		
		var sThm = This.getCurrentTheme.call( );
		var sTBg = '';
		
		switch( sThm ) {
			case 'light': sTBg = 'rgba( 0, 0, 0, 0.3 )'; break;
			case 'dark': sTBg = '#000'; break;
			case 'accent': sTBg = This.getCurrentAccentColor.call( This ); break;
		}
		
		setTimeout( function( )
		{
			oRP.css({
				'top': 0,
				'left': 0,
				'right': 0,
				'bottom': 0,
				'width': '100%',
				'height': '100%',
				'opacity': 1,
				'backgroundColor': sTBg,
				'WebkitTransform': 'none',
				'MozTransform': 'none',
				'MsTransform': 'none',
				'OTransform': 'none',
				'transform': 'none'
			});
			
			setTimeout( function( )
			{
				oRP.remove( );
			}, 400);
		}, 1);
	};
	
	/**
	 * Buildsthe projector's canvas
	 *
	 * @return	void
	 */
	Inner.buildCanvas = function( )
	{
		if( !$( 'body .projector-canvas' ).length ) {
			Inner.oCanvas = $( '<div/>' )
			.addClass( 'projector-canvas' )
			.append(
				$( '<div/>' )
				.addClass( 'loader-cont' )
				.append(
					$( '<span/>' )
					.addClass( 'gear-big' )
				)
				.append(
					$( '<span/>' )
					.addClass( 'gear-small' )
				)
			)
			.append(
				$( '<div/>' )
				.addClass( 'prev-photograph projection-control' )
				.click( Inner.prevPhotographProjectionControlClickHandler )
			)
			.append(
				$( '<div/>' )
				.addClass( 'next-photograph projection-control' )
				.click( Inner.nextPhotographProjectionControlClickHandler )
			)
			.append(
				$( '<div/>' )
				.addClass( 'close-projection-button' )
				.click( Inner.closeProjectionButton )
			)
			.append(
				$( '<div/>' )
				.addClass( 'settings-projection-cont' )
				.append(
					$( '<div/>' )
					.addClass( 'settings-projection-button' )
					.click( Inner.settingsProjectionButtonClickHandler )
				)
				.append(
					$( '<div/>' )
					.attr( 'data-style' , 'dark' )
					.addClass( 'settings-projection-background-button spb-dark' )
				)
				.append(
					$( '<div/>' )
					.attr( 'data-style' , 'light' )
					.addClass( 'settings-projection-background-button spb-light' )
				)
				.append(
					$( '<div/>' )
					.attr( 'data-style' , 'accent' )
					.addClass( 'settings-projection-background-button spb-accent' )
				)
				.append(
					$( '<div/>' )
					.addClass( 'settings-projection-fullscreen-button' )
				)
				.click( Inner.settingsProjectionContClickHandler )
				.on( 'click', '.settings-projection-background-button', Inner.settingsProjectionBackgroundButtonClickHandler )
				.on( 'click', '.settings-projection-fullscreen-button', Inner.settingsProjectionFullscreenButtonClickHandler )
			)
			.append(
				$( '<div/>' )
				.addClass( 'photograph-exif-info' )
				.append(
					$( '<div/>' )
					.addClass( 'photograph-exif-info-button' )
					.click( Inner.photographExifInfoButtonClickHandler )
				)
				.click( Inner.photographExifInfoClickHandler )
			)
			.append(
				$( '<div/>' )
				.addClass( 'photograph-description-info' )
				.click( Inner.photographDescriptionInfoClickHandler )
			)
			.appendTo( 'body' )
			.click( Inner.canvasClickHandler )
			.on( 'click' , 'img' , Inner.canvasImageClickHandler )
			.on( 'mousedown' , 'img' , Inner.canvasImageMousedownHandler )
			.on( 'mousemove' , 'img' , Inner.canvasImageMousemoveHandler )
			.on( 'mouseup' , 'img' , Inner.canvasImageMouseupHandler )
			.on( 'touchstart' , 'img' , Inner.canvasImageMousedownHandler )
			.on( 'touchmove' , 'img' , Inner.canvasImageMousemoveHandler )
			.on( 'touchend' , 'img' , Inner.canvasImageMouseupHandler );
			
			if( $( 'meta[name="theme-color"]' ).length )
			{
				Inner.oMetaThemeColor = $( 'meta[name="theme-color"]' );
				Inner.oMetaThemeColor.attr( 'data-content' , Inner.oMetaThemeColor.attr( 'content' ) );
			}
			else
			{
				Inner.oMetaThemeColor = $( '<meta/>' ,
				{
					'name': 'theme-color',
					'content': '',
					'data-content': ''
				} )
				.appendTo( 'html head' );
			}
		} else {
			Inner.oCanvas = $( 'body .projector-canvas' ).first( );
			Inner.oMetaThemeColor = $( 'meta[name="theme-color"]' );
			
			Inner.oCanvas.find( '.prev-photograph.projection-control' )
			.click( Inner.prevPhotographProjectionControlClickHandler );
			
			Inner.oCanvas.find( '.next-photograph.projection-control' )
			.click( Inner.nextPhotographProjectionControlClickHandler );
			
			Inner.oCanvas.find( '.close-projection-button' )
			.click( Inner.closeProjectionButton );
			
			Inner.oCanvas.find( '.settings-projection-cont' )
			.click( Inner.settingsProjectionContClickHandler )
			.on( 'click', '.settings-projection-background-button', Inner.settingsProjectionBackgroundButtonClickHandler )
			.on( 'click', '.settings-projection-fullscreen-button', Inner.settingsProjectionFullscreenButtonClickHandler );
			
			Inner.oCanvas.find( '.settings-projection-button' )
			.click( Inner.settingsProjectionButtonClickHandler );
			
			Inner.oCanvas.find( '.photograph-exif-info' )
			.click( Inner.photographExifInfoClickHandler );
			
			Inner.oCanvas.find( '.photograph-exif-info-button' )
			.click( Inner.photographExifInfoButtonClickHandler );
			
			Inner.oCanvas.find( '.photograph-description-info' )
			.click( Inner.photographDescriptionInfoClickHandler );
			
			Inner.oCanvas
			.click( Inner.canvasClickHandler )
			.on( 'click' , 'img' , Inner.canvasImageClickHandler )
			.on( 'mousedown' , 'img' , Inner.canvasImageMousedownHandler )
			.on( 'mousemove' , 'img' , Inner.canvasImageMousemoveHandler )
			.on( 'mouseup' , 'img' , Inner.canvasImageMouseupHandler )
			.on( 'touchstart' , 'img' , Inner.canvasImageMousedownHandler )
			.on( 'touchmove' , 'img' , Inner.canvasImageMousemoveHandler )
			.on( 'touchend' , 'img' , Inner.canvasImageMouseupHandler );
		}
	};
	
	/**
	 * Setup document, window and links events
	 * 
	 * @return	void
	 */
	Inner.setupDocumentEvents = function( )
	{
		$( document )
		.mousemove( Inner.documentMousemoveHandler)
		.keypress( Inner.documentKeypressHandler )
		.keydown( Inner.documentKeydownHandler )
		.on( 'click', Options.sSelector, Inner.imageLinkClickHandler );
		
		if (document.addEventListener) {
			Inner.oCanvas[0].addEventListener("mousewheel", Inner.mouseWheelHandler.call( null ), false);
			Inner.oCanvas[0].addEventListener("DOMMouseScroll", Inner.mouseWheelHandler.call( null ), false);
		} else {
			// sq.attachEvent("onmousewheel", Inner.mouseWheelHandler());
		}
		
		// https://gist.github.com/w33tmaricich/7009931
		if (typeof history.pushState === "function") {
			window.onpopstate = function () {
				if( This.isCanvasVisible( ) /*&& Inner.bActive*/ ) {
					Inner.closeReProjector.call( );
				}
			};
		}
	};
	
	/**
	 * Setup options
	 * 
	 * @return	void
	 */
	Inner.setupOptions = function( )
	{
		if( typeof opt === 'object' )
		{
			if( typeof opt.selector === 'string' ) {
				Options.sSelector = opt.selector;
			}
			
			if( typeof opt.theme === 'string' ) {
				if( STYLE_THEMES.indexOf( opt.theme ) !== -1 ){
					if( opt.theme == 'color' ) Options.sTheme = 'accent';
					else Options.sTheme = opt.theme;
				}
			}
			
			if( typeof opt.projectionControls === 'object' )
			{
				if( opt.projectionControls.settings === undefined
					|| opt.projectionControls.settings === true )
					Inner.oCanvas.find( '.settings-projection-cont' ).removeClass( 'invisible' );
				else
					Inner.oCanvas.find( '.settings-projection-cont' ).addClass( 'invisible' );
				
				if( opt.projectionControls.close === undefined
					|| opt.projectionControls.close === true )
					Inner.oCanvas.find( '.close-projection-button' ).removeClass( 'invisible' );
				else
					Inner.oCanvas.find( '.close-projection-button' ).addClass( 'invisible' );
				
				if( opt.projectionControls.prevNext === undefined
					|| opt.projectionControls.prevNext === true )
					Inner.oCanvas.find( '.prev-photograph.projection-control, .next-photograph.projection-control' ).removeClass( 'invisible' );
				else
					Inner.oCanvas.find( '.prev-photograph.projection-control, .next-photograph.projection-control' ).addClass( 'invisible' );
				
				if( opt.projectionControls.exif === undefined
					|| opt.projectionControls.exif === true )
					Inner.oCanvas.find( '.photograph-exif-info' ).removeClass( 'invisible' );
				else
					Inner.oCanvas.find( '.photograph-exif-info' ).addClass( 'invisible' );
				
				if( opt.projectionControls.description === undefined
					|| opt.projectionControls.description === true )
					Inner.oCanvas.find( '.photograph-description-info' ).removeClass( 'invisible' );
				else
					Inner.oCanvas.find( '.photograph-description-info' ).addClass( 'invisible' );
				
				if( typeof opt.projectionControls.keyboard === 'object' ) {
					if( opt.projectionControls.keyboard.theme === true
						|| opt.projectionControls.keyboard.theme === false ) {
						Options.bKeyboardChangeTheme = opt.projectionControls.keyboard.theme;
					}
					
					if( opt.projectionControls.keyboard.exif === true
						|| opt.projectionControls.keyboard.exif === false ) {
						Options.bKeyboardToggleExif = opt.projectionControls.keyboard.exif;
					}
					
					if( opt.projectionControls.keyboard.navigation === true
						|| opt.projectionControls.keyboard.navigation === false ) {
						Options.bKeyboardNavigation = opt.projectionControls.keyboard.navigation;
					}
					
					if( opt.projectionControls.keyboard.toggleControls === true
						|| opt.projectionControls.keyboard.toggleControls === false ) {
						Options.bKeyboardToggleControls = opt.projectionControls.keyboard.toggleControls;
					}
				}
				
				if( typeof opt.projectionControls.mouse === 'object' ) {
					if( opt.projectionControls.mouse.wheel === true
						|| opt.projectionControls.mouse.wheel === false ) {
						Options.bMouseWheelNavigation = opt.projectionControls.mouse.wheel;
					}
					
					if( opt.projectionControls.mouse.swipe === true
						|| opt.projectionControls.mouse.swipe === false ) {
						Options.bSwipeNavigation = opt.projectionControls.mouse.swipe;
					}
					
					if( typeof opt.projectionControls.mouse.timeout !== 'undefined' && parseFloat( opt.projectionControls.mouse.timeout ) ) {
						Options.iTimerFadeOutControls = parseFloat( opt.projectionControls.mouse.timeout );
					}
				}
				
				if( typeof opt.projectionControls.toggle === 'string' ) {
					switch( opt.projectionControls.toggle ) {
						case 'mousemove': Options.sToggle = 'mousemove'; break;
						case 'click': Options.sToggle = 'click'; break;
						default: Options.sToggle = 'none';
					}
				}
				
				if( opt.projectionControls.hideCursor === true || opt.projectionControls.hideCursor === false ) {
					Options.bHideCursor = opt.projectionControls.hideCursor;
				}
				
				if( opt.projectionControls.showNextOnClick === true || opt.projectionControls.showNextOnClick === false ) {
					Options.bShowNextOnClick = opt.projectionControls.showNextOnClick;
				}
				
				if( opt.projectionControls.zoomLinkBox === true || opt.projectionControls.zoomLinkBox === false ) {
					Options.bZoomImageBox = opt.projectionControls.zoomLinkBox;
				}
			}
			
			if( typeof opt.translations === 'object' ) {
				if( typeof opt.translations === 'object' ) {
					for( var i in UserLang ) {
						if( typeof opt.translations[ i ] === 'object' && typeof UserLang[ i ] === 'object' ) {
							for( var j in opt.translations[ i ] ) {
								UserLang[ i ][ j ] = opt.translations[ i ][ j ];
							}
						}
					}
				}
			}
				
			if( typeof opt.callbacks === 'object' ) {
				if( typeof opt.callbacks.open === 'function' )
					this.setOpenCallback( opt.callbacks.open );
				
				if( typeof opt.callbacks.close === 'function' )
					this.setCloseCallback( opt.callbacks.close );
				
				if( typeof opt.callbacks.changePhotograph === 'function' )
					this.setChangePhotographCallback( opt.callbacks.changePhotograph );
				
				if( typeof opt.callbacks.canvasClick === 'function' )
					this.setCanvasClickCallback( opt.callbacks.canvasClick );
			}
		}
		else if( typeof opt === 'string' )
		{
			Options.sSelector = opt;
		}
		
		Options.sSelector = Options.sSelector || DEFAULT_SELECTOR_ARRAY.join( ', ' );
	};
	
	/**
	 * Link to close method
	 * 
	 * @return	Projector
	 */
	this.close = function( )
	{
		Inner.closeReProjector.call( );
		
		return this;
	};
	
	/**
	 * Allow external script to add classes to oCanvas
	 * 
	 * @param	{string}	classes
	 * @return	Projector
	 */
	this.addCanvasClass = function( classes )
	{
		Inner.oCanvas.addClass( classes );
		
		return this;
	};
	
	/**
	 * Checks if projector is visible
	 * 
	 * @return	boolean
	 */
	this.isCanvasVisible = function( )
	{
		return Inner.oCanvas.css( 'zIndex' ) > 0;
	};
	
	/**
	 * Get current link with photograph
	 * 
	 * @return	DOMElement
	 */
	this.getCurrentLink = function( )
	{
		return Inner.oCurr;
	};
	
	/**
	 * Set default open callback
	 * 
	 * @param 	Function 	callback
	 * @return	Projector
	 */
	this.setOpenCallback = function( callback )
	{
		Inner.openCallback = callback;
		
		return this;
	};
	
	/**
	 * Set default close callback
	 * 
	 * @param 	Function 	callback
	 * @return	Projector
	 */
	this.setCloseCallback = function( callback )
	{
		Inner.closeCallback = callback;
		
		return this;
	};
	
	/**
	 * Set default hide controls callback
	 * 
	 * @param 	Function 	callback
	 * @return	Projector
	 */
	this.setChangePhotographCallback = function( callback )
	{
		Inner.changePhotographCallback = callback;
		
		return this;
	};
	
	/**
	 * Set additional canvas click callback
	 * 
	 * @param 	Function 	callback
	 * @return	Projector
	 */
	this.setCanvasClickCallback = function( callback )
	{
		Inner.canvasClickCallback = callback;
		
		return this;
	};
	
	/**
	 * Expands the oCanvas element on fullscreen
	 *
	 * @param 	Function 	callback
	 * @return	Projector
	 */
	this.expandToFullscreen = function( callback )
	{
		Inner.launchIntoFullscreen.call( null, document.documentElement );
		
		if( typeof callback == 'function' )
			callback.call( );
		
		return this;
	};
	
	/**
	 * Expands the oCanvas element on fullscreen
	 *
	 * @param 	Function 	callback
	 * @return	Projector
	 */
	this.exitFullscreen = function( callback )
	{
		Inner.exitFullscreen.call( );
		
		if( typeof callback == 'function' )
			callback.call( );
		
		return this;
	};
	
	/**
	 * Check whether the oCanvas element is in fullscreen
	 *
	 * @return	Projector
	 */
	this.checkIfFullscreen = function( )
	{
		return Inner.inFullscreen.call( );
	};
	
	/**
	 * Get current accent color if possible
	 *
	 * @return string
	 */
	this.getCurrentAccentColor = function( )
	{
		var sAccentColor = this.getCurrentLink( ).data( 'accent-color' );
		return ( sAccentColor && sAccentColor != '' ) ? sAccentColor : DEFAULT_ACCENT_COLOR;
	};
	
	/**
	 * Get theme of {Re}Projector's canvas
	 * 
	 * @return	String
	 */
	this.getCurrentTheme = function( )
	{
		return Inner.getCanvasBackgroundTheme.call( );
	};
	
	/**
	 * Constructor
	 */
	(function( )
	{
		Inner.buildCanvas.call( );
		Inner.setupOptions.call( this );
		Inner.setupDocumentEvents.call( );
	}).call( this );
	
	return this;
};
