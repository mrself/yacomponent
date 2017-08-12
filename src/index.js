var Del = require('ya-del'),
	Instance = require('yainstance'),
	ListenDeps = require('./listen-deps');

function Base() {
	
}

Base.prototype = $.extend({}, Del, {
	init: function() {
		this.$el = this.options.$el;
		this._initDel_base();
		this._defineComponents();
		if (this.options.template)
			this.defineTemplate();
		if (this.options.instance) this.constructor.instance.add(this);
		this.$el.trigger(this.options.dName + '/init', this);
	},

	_defineComponents: function() {
		this._getComponents().forEach(this._defineComponent.bind(this));
	},

	_defineComponent: function(component) {
		if (component.separate) {
			var options = $.extend({
				$el: component['class'].findIn(this.$el)
			}, component.options);
		} else {
			var options = $.extend(this._makeComponentOptions(component), component.options);
		}
		this[component.name] = component['class'].init(options);
	},

	_makeComponentOptions: function(component) {
		var dName = component['class'].defaults.dName;
		return {
			$el: this.find(dName),
			dName: this.makeName(dName)
		};
	},

	defineTemplate: function() {
		
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
	return inst;
};

Base.getEl = function() {
	if (this.defaults.autoBoot)
		return $('.' + this.defaults.dName).not('[data-' + this.defaults.dName.toLowerCase() + '-auto=false]');
	else return $('.' + this.defaults.dName + '[data-' + this.defaults.dName.toLowerCase() + '-auto');
};

Base.findIn = function($parent) {
	if ($parent.is('.' + this.defaults.dName)) return $parent;
	return $parent.find('.' + this.defaults.dName);
};

Base.getName = function() {
	return this.defaults.dName;
};

Base.serviceConfig = {};

Base.componentConfig = {};

Base.defaults = {
	autoBoot: false,
	template: false,
	instance: false
};

Base.register = function() {
	this.instance = new Instance({bind: this.defaults.dName});
	this.listenDeps();
};

Base.listenDeps = function() {
	var config = this.componentConfig.listenDeps;
	if (!config) return;
	var $doc = $(document);
	var self = this;
	config.forEach(function(i) {
		new ListenDeps(self, $doc, i);
	});
};

Base.getInst = function() {
	return this.instance.instances[0];
};

Base.booted = false;

Base.boot = function() {
	var self = this;
	this.getEl().each(function() {
		var $this = $(this);
		var dataClass = $this.data(self.defaults.dName + 'Class');
		if (dataClass && self.class != dataClass) return;
		self.init({
			$el: $this,
			dName: self.defaults.dName
		});
	});
	this.booted = true;
};

module.exports = Base;