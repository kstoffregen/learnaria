;(function ( $, window, document, undefined ) {
	 
	var pluginName = 'ik_tabs',
		defaults = {
			tabLocation: 'top',
			selectedIndex: 0
		};
	
	/**
	 * @constructs Plugin
	 * @param {Object} element - Current DOM element from selected collection.
	 * @param {Object} [options] - Configuration options.
	 * @param {number} [options.tabLocation='top'] - Tab location (currently supports only top).
	 * @param {number} [options.selectedIndex] - Initially selected tab.
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
		
		var id, $elem, $tabbar, pad;
		
		plugin = this;
		id = 'tabs' + $('.ik_tabs').length; // create unique id
		$elem = this.element.addClass('ik_tabs');
		
		/*
			NOTE:
			In our case we are generating the tabs for each child <div> defined in the HTML, 
			though tabs and tab panels could be static HTML. The tablist is made up of a <ul> 
			and child <li> elements. We assign role="tablist" to the <ul> to remove its list 
			semantics and replace it with tab panel semantics. 
		*/

		$tabbar = $('<ul/>') // create ul element to hold all tabs
			.addClass('ik_tabbar cf')
			.attr({
		        'role': 'tablist' // add tablistr role
		    })
			.prependTo($elem);
		
		plugin.panels = $elem // initialize panels and create tabs
			.children('div')
			.each( function(i, el) {
				
				var $tab, $panel, lbl;
				
				/*
					Note:
					Add WAI-ARIA to the panels, assign role="tabpanel" to each of the original <div> elements, 
					hide them by default with aria-hidden="true", and add tabindex="0" to make the panels keyboard focusable.
				*/
				$panel = $(el).attr({
					'id': id + '_panel' + i,  // add unique id for a panel		
				    'role': 'tabpanel', // add tabpanel role
				    'aria-hidden': true, // initially hide from screen readers
				    'tabindex': 0 // add to tab order
				})
				.addClass('ik_tabpanel')
				.hide();
				
				lbl = $panel.attr('title'); // get tab label from panel title
				
				$panel.removeAttr('title');
				
				/*
					Note:
					Replace the list item semantics with tab semantics adding role="tab" to each of the <li> elements generated. 
					We also need to define which tab controls which tabpanel, dynamically generating aria-controls="[panel_id]" for each of the tabs.
				*/
				$tab = $('<li/>').attr({
					'id': id + '_tab' + i, // create unique id for a tab
				    'role': 'tab', // assign tab role
				    'aria-controls': 'panel' + i // define which panel it controls
				})
				.text(lbl > '' ? lbl : 'Tab ' + (i + 1))
				.on('keydown', {'plugin': plugin, 'index': i}, plugin.onKeyDown) // add keyboard event handler
				.on('click', {'plugin': plugin, 'index': i}, plugin.selectTab) // add mouse event handler
				.appendTo($tabbar);
			});
		
		plugin.tabs = $tabbar.find('li');
		
		plugin.selectTab({ // select a pre-defined tab / panel 
			data:{
				'plugin': plugin, 
				'index': plugin.options.selectedIndex
			}
		});
	};
	
	/** 
	 * Selects specified tab.
	 * 
	 * @param {Object} [event] - Keyboard event (optional).
	 * @param {object} event.data - Event data.
	 * @param {object} event.data.plugin - Reference to plugin.
	 * @param {object} event.data.index - Index of a tab to be selected.
	 */
	Plugin.prototype.selectTab = function (event) {
		
		var plugin = event.data.plugin, 
			ind = event.data.index, 
			$tabs, 
			$panels;
		
		$elem = plugin.element;
		$tabs = plugin.tabs;
		$panels = plugin.panels;
		
		/*
			Note:
			When a tab is selected, we want to remove selection from other tabs with aria-selected="false", and remove keyboard access temporarily by 
			assigning tabindex="-1" to the unselected tabs, so that the tabpanel becomes next in the tab order, and users can 
			navigate directly from the tab to the panel without having to pass through the other tabs in the tablist.
		*/
		$tabs // deselect all tabs
			.removeClass('selected')
		    .attr({
		        'aria-selected': false,
		        'tabindex': -1 // remove them from tab order
		    })
			.blur();
		/*
			Note:
			When a tab is selected we assign aria-selected="true" so screen readers announce the selected tab, 
			and we add tabindex="0" as the roving tabindex to make that tab focusable.
		*/
		$($tabs[ind]) // select specified tab
			.addClass('selected')
		    .attr({
		        'aria-selected': true,
		        tabindex: 0
		    });
		
		if (event.type) $($tabs[ind]).focus(); // move focus to current tab if reached by mouse or keyboard
		
		/*
			Note:
			As the tabs change, hide all the panels with aria-hidden="true" so screen readers do not see them, 
			then open the panel the current tab controls with aria-hidden="false" so screen readers can see the active panel.
		*/
		$panels // hide all panels
		    .attr({
		        'aria-hidden': true
		    })
			.hide(); 
		
		$($panels[ind]) // show current panel
		    .attr({
		        'aria-hidden': false
		    })
			.show(); 
		
	}

	/**
	* Handles keydown event on header button.
	*
	* @param {Object} event - Keyboard event.
	* @param {object} event.data - Event data.
	* @param {object} event.data.plugin - Reference to plugin.
	*/
	/*
		Note:
		Add arrow key navigation between tabs, and between tabs and panels. 
		Tab navigation and Enter keys are enabled by default and do not need to be defined here.
	*/
	Plugin.prototype.onKeyDown = function (event) {
	    var plugin = event.data.plugin,
	        ind = event.data.index,
	        $tabs,
	        $panels,
	        next;
	           
	    $elem = plugin.element;
	    $tabs = plugin.tabs;
	    $panels = plugin.panels;
	       
	    switch (event.keyCode) {
	        case ik_utils.keys.left:
	        case ik_utils.keys.up:
	            next = ind > 0 ? --ind : 0;
	            plugin.selectTab({data:{'plugin': plugin, 'index': next}});
	            break;
	        case ik_utils.keys.right:
	        case ik_utils.keys.down:
	            next = ind < $tabs.length - 1 ? ++ind : $tabs.length - 1;
	            plugin.selectTab({data:{'plugin': plugin, 'index': next}});
	            break;
	        case ik_utils.keys.space:
	            event.preventDefault();
	            event.stopPropagation();
	            return false;
	    }
	}
	
	$.fn[pluginName] = function ( options ) {
		
		return this.each(function () {
			
			if ( !$.data(this, pluginName )) {
				$.data( this, pluginName,
				new Plugin( this, options ));
			}
			
		});
		
	}
 
})( jQuery, window, document );