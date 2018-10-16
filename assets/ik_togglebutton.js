;(function ( $, window, document, undefined ) {
 
	var pluginName = 'ik_togglebutton',
		defaults = {
			"label": "toggle button",
			"isPressed": false,
			"onToggle": function() { console.log('toggle action is undefined'); }
		};
	 
	/**
	 * @constructs Plugin
	 * @param {Object} element - Current DOM element from selected collection.
	 * @param {Object} [options] - Configuration options.
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
		
		var plugin, id, $elem;
		
		plugin = this;
		id = 'toggle' + $('.ik_togglebutton').length; // generate unique id
		/*
			Note:
			Add a tabindex to each button to make them keyboard focusable, 
			define the role="button" and add a label with aria-label="[button name]" and 
			set the default state to “not pressed” with aria-pressed="false".
		*/
		$elem = this.element
			.attr({
				"id": id,
				"tabindex": 0,
				"role": "button",
				"aria-label": plugin.options.label,
				"aria-pressed": false
			});
		
		plugin.options.onToggle = plugin.options.onToggle.bind(plugin);
		
		/*
			Note: 
			Add in equivalent keyboard access where mouse access is provided, referencing 
			the onActivate() function, described below, with jQuery .on('keydown').
		*/
		$elem
			.on('click', {plugin: plugin}, plugin.onActivate)
			.on('keydown', {plugin: plugin}, plugin.onActivate)
		;
		
	};
	
	/** 
	 * Triggers button's action.
	 * 
	 * @param {Object} event - Keydown or click event.
	 * @param {object} event.data - Event data.
	 * @param {object} event.data.plugin - Reference to plugin.
	 */
	Plugin.prototype.onActivate = function (event) {
		
		var plugin, $me;

		/*
			Note:
			No added keyboard interaction is required for the toggle buttons beyond 
			the standard space bar and Enter key defined in the ik_utils.js file. 
			Reference to these key events is added to the onActivate() function.
		*/
		if (event.type === 'click' || event.keyCode === ik_utils.keys.enter || event.keyCode === ik_utils.keys.space) {
			
			event.stopPropagation();
			
			plugin = event.data.plugin;
			$me = plugin.element;
			
			/*
				Note:
				Set aria-pressed = "[true | false]" for buttons when activated or 
				deactivated to announce the button’s state to screen readers.
			*/
			if (plugin.options.isPressed) {
				$me
					.removeClass('pressed')
					.attr({
						"aria-pressed": false
					});
				plugin.options.isPressed = false;
			} else {
				$me
					.addClass('pressed')
					.attr({
						"aria-pressed": true
					});
				plugin.options.isPressed = true;
			}
			
			plugin.options.onToggle();
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