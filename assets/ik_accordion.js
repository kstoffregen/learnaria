;(function ( $, window, document, undefined ) {
 	
	var pluginName = 'ik_accordion',
		defaults = {
			autoCollapse: false,
			animationSpeed: 200
		};
	 
	/**
	 * @constructs Plugin
	 * @param {Object} element - Current DOM element from selected collection.
	 * @param {Object} options - Configuration options.
	 * @param {boolean} options.autoCollapse - Automatically collapse inactive panels.
	 * @param {number} options.animationSpeed - Panel toggle speed in milliseconds.
	 */
	function Plugin( element, options ) {
		
		this._name = pluginName;
		this._defaults = defaults;
		this.element = $(element);
		this.options = $.extend( {}, defaults, options) ; // override default parameters if setup object is present
		
		this.init();
	}
	
	/** Initializes plugin. */
	Plugin.prototype.init = function () {
		
		var id, $elem, plugin;
		
		id = 'acc' + $('.ik_accordion').length; // create unique id
		$elem = this.element;
		plugin = this;
		
		/*
			Note:
			Add the accordion to the landmarked regions by assigning role="region" to the opening 
			<DL> element when the accordion is initialized, adding the region role to the init() function.
		*/
		$elem.attr({
			'id': id,
			'role': 'region' // add the accordion to the landmarked regions
		}).addClass('ik_accordion');

		/*
			Note:
			Add the aria-multiselectable attribute to the <DL>, to be dynamically set to true or false 
			based on plugin configuration settings. This lets a user know that more than one accordion 
			panel can be opened when set to TRUE, or only a single panel when set to FALSE. 
			Refer to the $(document).ready block in the HTML, where the assignment takes place.
		*/
		$elem.attr({'aria-multiselectable': !this.options.autoCollapse}); // define if more than one panel can be expanded
		
		/*
			Note:
			The semantics of the children of the <DL> element, which was assigned role="presentation", 
			will also have their definition list semantics removed. Add the accordion semantics role="heading" 
			to assign a heading role to the <DT> elements. The aria-level attribute might be used to implement 
			nested accordion panels, but for the purpose of this course a simplified version should be sufficient.
		*/
		this.headers = $elem.children('dt')
        	.attr({'role': 'heading'}); // set heading role for each accordion header

        /*
    		Note:
        	Add a <div> inside the header (i.e. DT) and define its role as a button. The button is given an 
        	aria-controls attribute to define which of the accordion panels it controls. By default the toggle 
        	state is set to false with aria-expanded="false" to be updated dynamically when the button is 
        	clicked or key pressed. Finally add tabindex="0" to the button (<div>) to make it keyboard focusable.

        	Adding .on('keydown') activates the onKeyDown function, defined below, so the 
        	accordion headers operate with both a mouse click and a keypress.
        */
		this.headers = $elem.children('dt').each(function(i, el) {
			var $me, $btn;
			
			$me = $(el);
			$btn = $('<div/>').attr({
		        	'id': id + '_btn_' + i,
		            'role': 'button',
	                'aria-controls': id + '_panel_' + i, // associate button with corresponding panel
	                'aria-expanded': false, // toggle expanded state
	                'tabindex': 0 //add keyboard focus
		        })
		        .addClass('button')
		        .html($me.html())
		        .on('keydown', {'plugin': plugin}, plugin.onKeyDown) // enable keyboard navigation
		        .on('click', {'plugin': plugin}, plugin.togglePanel);
        
			$me.empty().append($btn); // wrap content of each header in an element with role button
		});
		
		/*
			Note:
			Add semantics to the accordion panel by defining the <DD> elements that 
			had semantics removed when role="presentation" was added to the parent <DL>. 
			Panels are given a generic role="region", to make the panel browsable in the landmarks list, 
			set to be hidden by default with aria-hidden="true" so all panels are closed when the page loads. 
			Tabindex="0" is also added to make the panels keyboard focusable so the content of the panel 
			is read as the user navigates to them.
		*/
		this.panels = $elem.children('dd').each(function(i, el) {
			var $me = $(this), id = $elem.attr('id') + '_panel_' + i;
			$me.attr({
				'id': id,
				'role': 'region', // add role region to each panel
                'aria-hidden': true, // mark all panels as hidden
                'tabindex': 0 // add panels into the tab order
			});
		}).hide();
		
	};
	
	/** 
	 * Toggles accordion panel.
	 *
	 * @param {Object} event - Keyboard or mouse event.
	 * @param {object} event.data - Event data.
	 * @param {object} event.data.plugin - Reference to plugin.
	 */
	Plugin.prototype.togglePanel = function (event) {
		
		var plugin, $elem, $panel, $me, isVisible;
		
		plugin = event.data.plugin;
		$elem = $(plugin.element);
		$me = $(event.target);
		$panel = $me.parent('dt').next();
		
		if(plugin.options.autoCollapse) { // expand current panel and collapse the rest
			
			plugin.headers.each(function(i, el) {
				var $hdr, $btn; 
				
				$hdr = $(el);
				$btn = $hdr.find('.button');
				
				if($btn[0] != $(event.currentTarget)[0]) { 
					$btn.removeClass('expanded').attr({'aria-expanded':false});
					$hdr.next().slideUp(plugin.options.animationSpeed);
				} else { 
					$btn.addClass('expanded').attr({'aria-expanded':true});
					$hdr.next().slideDown(plugin.options.animationSpeed);
				}
			});
			
		} else { // toggle current panel depending on the state
		
			isVisible = !!$panel.is(':visible');
			$panel.slideToggle({ duration: plugin.options.animationSpeed });
			$me.addClass('expanded').attr({"aria-expanded": true});
			
		}
	};

	/**
     * Handles kedown event on header button.
     *
     * @param {Object} event - Keyboard event.
     * @param {object} event.data - Event data.
     * @param {object} event.data.plugin - Reference to plugin.
     */
	/*
		Note:
		The following onKeyDown function has been created to add keyboard operability to the header elements of the accordion, 
		allowing both space bar and Enter keys to operate the toggles (i.e. headers) that open and close panels, and the Arrow keys 
		to move between the accordion headers. By default, users can navigate between headers, and between headers and panels using the Tab key.
	*/
    Plugin.prototype.onKeyDown = function (event) {
       
        var $me, $header, plugin, $elem, $current, ind;
       
        $me = $(event.target);
        $header = $me.parent('dt');
        plugin = event.data.plugin;
        $elem = $(plugin.element);
       
        switch (event.keyCode) {
           
            // toggle panel by pressing enter key, or spacebar
            case ik_utils.keys.enter:
            case ik_utils.keys.space:
                event.preventDefault();
                event.stopPropagation();
                plugin.togglePanel(event);
                break;
           
            // use up arrow to jump to the previous header
            case ik_utils.keys.up:
                ind = plugin.headers.index($header);
                if (ind > 0) {
                    plugin.headers.eq(--ind).find('.button').focus();
                }
                console.log(ind);
                break;
           
            // use down arrow to jump to the next header
            case ik_utils.keys.down:
                ind = plugin.headers.index($header);
                if (ind < plugin.headers.length - 1) {
                    plugin.headers.eq(++ind).find('.button').focus();
                }
                break;
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