;(function ( $, window, document, undefined ) {
 
	var pluginName = 'ik_tooltip',
		defaults = {
			'position': 'top'
		};
	 
	/**
	 * @constructs Plugin
	 * @param {Object} element - Current DOM element from selected collection.
	 * @param {Object} [options] - Configuration options.
	 * @param {number} [options.position='top'] - Tooltip location (currently supports only top).
	 */
	function Plugin( element, options ) {
		
		this._name = pluginName;
		this._defaults = defaults;
		this.element = $(element);
		this.options = $.extend( {}, defaults, options) ;
		
		this.init();
	}
	
	/** Initializes plugin. */
	Plugin.prototype.init = function () {
		
		var id, $elem, $tooltip, tip;
		
		id = 'tip' + $('.ik_tooltip').length; // generate unique id
		
		$elem = this.element;
		tip = $elem.attr('title'); // get text from element title attribute (required)
		
		if(tip.length > 0) {
			
			/*
				Define the tooltip with role="tooltip". Hide the tooltip by default with aria-hidden="true". 
				Also add a live region with aria-live="polite" so screen readers automatically read the tooltip 
				when it appears. Note that the WAI-ARIA 1.1 best practices recommend using aria-describedby 
				within the owning element to reference the content of a tooltip, which does not announce as 
				expected with current versions of Chrome, so here we have decided to use aria-live, which 
				announces correctly across all current browsers.
			*/
			$tooltip = $('<span/>') // create tooltip
				.text(tip)
				.addClass('ik_tooltip')
				.attr({
					'id': id,
					'role': 'tooltip', // assign tooltip role
			        'aria-hidden': 'true', // hide it from screen reader to prevent it from been read twice
			        'aria-live': 'polite' // make it live region
				});
			
			/*
				Add keyboard focus to the element the tooltip belongs to with tabindex="0", and 
				add focus to .on('mouseover') so both a mouse hover and keyboard focus open the tooltip.
			*/
			$elem
				.attr({
			        'tabindex': 0 // add tab order
			    })
				.css('position', 'relative')
				.removeAttr('title') // remove title to prevent it from being read
				.after($tooltip)
				//.on('mouseover', function(event) {
				.on('mouseover focus', function(event) {

					var y, x;
					
					y = $elem.position().top - $tooltip.height() - 20;
					x = $elem.position().left;
					
					if(!$elem.is(':focus')) { // remove focus from a focused element
						$(':focus').blur();
					}
					
					$('.ik_tooltip').removeClass('mouseover'); // remove mouseover class from all tooltips
					
					if (event.type === 'mouseover') {
						$tooltip.addClass('mouseover'); // add mouseover class when mouse moves over the current element
					}
					
					/*
						Add aria-hidden="false" so the hidden-by-default tooltip becomes visible when the mouse hover or keyboard focus occurs.
					*/
					$tooltip // position and show tooltip
						.attr({
				        	'aria-hidden': 'false'
				        })
						.css({
							'top': y, 
							'left': x
						})
						.addClass('visible');
				})
				/*
					Add aria-hidden="true" to be sure the tooltip is hidden from screen readers, should a mouseout event close the tooltip, 
					adding it to .on(mouseout) chained to the element ($elem) definition.
				*/
				.on('mouseout', function(event) {
					
					if (!$(event.currentTarget).is(':focus') ) { // hide tooltip if current element is not focused
						
						$tooltip
							.attr({
				            	'aria-hidden': 'true'
				            })
							.removeClass('visible mouseover');					
					}
										
				})
				/*
					As a keyboard equivalent for the .on(mouseout) described above, .on(blur) is chained to the $elem element and 
					within it aria-hidden="true" hides the tooltip again, if the mouse pointer is not over the element.
				*/
				.on('blur', function(event) {              
				    if (!$tooltip.hasClass('mouseover') ) { // hide tooltip if mouse is not over the current element               
				    $tooltip
				        .attr({
				            'aria-hidden': 'true'
				        })
				        .removeClass('visible');       
				    }
				})
				/*
					If the Esc key is used, add aria-hidden="true" to hide the tooltip, even if the mouse is hovering, or the owning element has focus.
				*/
				.on('keyup', function(event) {         
				    if(event.keyCode == ik_utils.keys.esc) { // hide when escape key is pressed
				        $tooltip
				            .attr({
				                'aria-hidden': 'true'
				            })
				            .removeClass('visible');
				    }              
				});

		}
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