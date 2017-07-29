var Del = require('ya-del'),
	Instance = require('yainstance');

function Base() {
	
}

Base.prototype = $.extend({}, Del, {
	init: function() {
		this.$el = this.options.$el;
		this._initDel_base();
		this._defineComponents();
	},

	_defineComponents: function() {
		var self = this;
		this._getComponents().forEach(function(component) {
			if (component.separate) {
				var options = $.extend({
					$el: component['class'].findIn(self.$el)
				}, component.options);
			} else {
				var options = $.extend({
					$el: self.find(component['class'].defaults.dName),
					dName: self.makeName(component['class'].defaults.dName)
				}, component.options);
			}
			self[component.name] = component['class'].init(options);
		});
	},

	_initDel_base: function() {
		this.initDel({
			dName: this.options.dName
		});
	},
	setOptions: function(options) {
		this.options = $.extend(true, {}, this.constructor.defaults, options);
		$.extend(true, this.options, this.getDataOptions(), this.getOuterOptions());
	},

	getOuterOptions: function() {
		if (this.options.dName in window)
			return window[this.options.dName];
		else return {};
	},

	getDataOptions: function() {
		return this.options.$el.data(this.options.dName.replace(/__/g, '-'));
	},

	_getComponents: function() {
		return [];
	},
});

Base.init = function(options) {
	var inst = new this;
	inst.setOptions(options);
	inst.init();
	if (this.instance) this.instance.add(inst);
	return inst;
};

Base.getEl = function() {
	if (this.defaults.autoBoot)
		return $('.' + this.defaults.dName).not('[data-' + this.defaults.dName.toLowerCase() + '-auto=false]');
	else return $('.' + this.defaults.dName + '[data-' + this.defaults.dName.toLowerCase() + '-auto');
};

Base.findIn = function($parent) {
	return $parent.find('.' + this.defaults.dName);
};

Base.getName = function() {
	return this.defaults.dName;
};

Base.serviceConfig = {};

Base.defaults = {
	autoBoot: false
};

Base.register = function() {
	this.instance = new Instance();
};

Base.boot = function() {
	var self = this;
	this.getEl().each(function() {
		self.init({
			$el: $(this),
			dName: self.defaults.dName
		});
	});
};

module.exports = Base;