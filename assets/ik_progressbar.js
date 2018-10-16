/** Note: Built for ChromeVox functionality. Due to limited support for the WAI-ARIA progressbar attribute 
	by screen readers other than ChromeVox, there is also a workaround using the jQuery .data() function 
	to output the current value for users of JAWS or NVDA screen readers.  **/

;(function ( $, window, document, undefined ) {
	/*
		Note:
		Create some instructions describing how to operate the progress bar 
		with a screen reader and keyboard, and add them to the default options.
	*/
	var pluginName = 'ik_progressbar',
		defaults = { // values can be overitten by passing configuration options to plugin constructor 
			'instructions': 'Press spacebar, or Enter to get progress',
			'max': 100
		};
	
	/**
	 * @constructs Plugin
	 * @param {Object} element - Current DOM element from selected collection.
	 * @param {Object} options - Configuration options.
	 * @param {string} options.instructions - Custom instructions for screen reader users.
	 * @param {number} options.max - End value.
	 */ 
	function Plugin( element, options ) {
		
		this._name = pluginName;
		this._defaults = defaults;
		this.element = $(element);
		this.options = $.extend( {}, defaults, options) ;
		
		this.init();
	
	}
	
	/** Initializes plugin. */
	/*
		Note:
		Set tabindex="-1" to be sure the bar itself is not keyboard focusable by default, and associate the bar 
		with the instructions so when the bar does receive focus the instructions are read. Set some default values 
		for aria-valuemin, aria-valuenow, and aria-valuemax. Also add keyboard access to the bar, 
		with an on(keydown) reference to the onKeyDown() function, described below.

		Add to the notifications <div> live region attributes so when space/Enter are pressed and the progress 
		percent is added, or "Loading Complete!" is added, they are read aloud by the screen reader.

		Finally create the <div> with instructions referenced by its ID with aria-describedby added to the bar <div>, 
		and hide it by default.
	*/
	Plugin.prototype.init = function () { // initialization function
		
		var id = 'pb' + $('.ik_progressbar').length;
				
		this.element
			.attr({
				'id': id,
				'tabindex': -1, // add current element to tab oder
	            'role': 'progressbar', // assign  progressbar role
	            'aria-valuenow': 0, // set current value to 0
	            'aria-valuemin': 0, // set minimum (start) value to 0 (required by screen readers)
	            'aria-valuemax': this.options.max, // set maximum (end) value
	            'aria-describedby': id + '_instructions' // add aria-describedby attribute
			})
			.addClass('ik_progressbar')
        	.on('keydown.ik', {'plugin': this}, this.onKeyDown);
      ;
		
		this.fill = $('<div/>')
			.addClass('ik_fill');
			
		this.notification = $('<div/>') // add div element to be used to notify about the status of download
	        .attr({
	            'aria-live': 'assertive', // set notofocation priority to high
	            'aria-atomic': 'additions' // notify only about newly added text
	        })
			.addClass('ik_readersonly')
			.appendTo(this.element);

	    $('<div/>') // add div element to be used with aria-described attribute of the progressbar
	        .text(this.options.instructions) // get instruction text from plugin options
	            .addClass('ik_readersonly') // hide element from visual display
	            .attr({
	            'id': id + '_instructions',
	            'aria-hidden': 'true'  // hide element from screen readers to prevent it from being read twice
	    })
	    .appendTo(this.element);

		$('<div/>')
			.addClass('ik_track')
			.append(this.fill)
			.appendTo(this.element);
		
	};
	
	/** 
	 * Gets the current value of progressbar. 
	 *
	 * @returns {number} 
	 */
	/*
		Note:
	 	Replace the data(value) in the getValue() function, used to retrieve the current value of the 
	 	progress bar when the space bar or Enter keys are pressed, with an aria-valuenow attribute, 
	 	replacing the .data(value) needed to function with screen readers other than ChromeVox.
 	*/
	Plugin.prototype.getValue = function() {
		
		var value;
		
		// value = Number( this.element.data('value') ); // inaccessible
		value = Number( this.element.attr('aria-valuenow') ); // accessible
		
		return parseInt( value );
		
	};
	
	/** 
	 * Gets the current value of progressbar. 
	 *
	 * @returns {number} 
	 */
	Plugin.prototype.getPercent = function() {
		
		var percent = this.getValue() / this.options.max * 100;
		
		return parseInt( percent );
		
	};
	
	/** 
	 * Sets the current value of progressbar. 
	 *
	 * @param {number} n - The current value. 
	 */
	/*
		Note:
		Add in a tabindex="-1" to remove keyboard focus from the bar when the max value is reached, and to 
		add the "Loading complete" message to the notification <div>. Finally add either the current value 
		of the progress on keypress, or the max value if progress is complete, to an aria-valuenow attribute, 
		replacing the .data() work-around, needed to function with screen readers other than ChromeVox.
	*/
	Plugin.prototype.setValue = function(n) {
		
		var $el, val, isComplete = false;
		
		$el = $(this.element);
				
		if (n >= this.options.max) {
			val = this.options.max;
			$el.attr({
					'tabindex': -1
				});
			this.notification.text('Loading complete');
		} else {
			val = n;
		}
		
		this.element
			// .data({ // inaccessible
			// 	'value': parseInt(val) 
			// }) 
			.attr({ // accessible
	            'aria-valuenow': val
	        });
      ;
		
		this.updateDisplay();
		
	};
	
	/**
	 * Handles keydown event on progressbar element.
	 *
	 * @param {Object} event - Keyboard event.
	 * @param {object} event.data - Event data.
	 * @param {object} event.data.plugin - Reference to plugin.
	 */
	/*
		Note:
		To allow the current value to be retrieved, set up the Enter and space bar keyboard controls with the 
		onKeyDown() function, which also triggers the notify() function when one of these keys is pressed, 
		outputting the value to the notification <div> that we have set up as a live region.
	*/
	Plugin.prototype.onKeyDown = function(event) {
	       
	    switch(event.keyCode) {
	           
	        case ik_utils.keys.space:
	        case ik_utils.keys.enter:
	            event.preventDefault();
	            event.stopPropagation();
	            event.data.plugin.notify();
	            break;
	    }
	 
	       
	};

	/** Updates visual display. */
	Plugin.prototype.updateDisplay = function() {
		
		this.fill.css({
			'transform': 'scaleX(' + this.getPercent() / 100 + ')'
		});
	
	};
	
	/** Updates text in live region to notify about current status. */
	Plugin.prototype.notify = function() {
		
		this.notification.text(  this.getPercent() + '%' );
		
	};
	
	/** Resets progressbar. */
	Plugin.prototype.reset = function() {
		
		this.setValue(0);
		this.updateDisplay();
		this.notify();
	
	};
	
	$.fn[pluginName] = function ( options ) {
		
		return this.each(function () {
			
			if ( !$.data(this, pluginName )) {
				$.data( this, pluginName,
				new Plugin( this, options ));
			}
			
		});
		
	}
	
})( jQuery, window, document );