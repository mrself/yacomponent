function ListenDeps(base, $doc, item) {
	var self = this;
	var deps = {};

	this.init = function() {
		this.bindInitEvent();
		var defs = item.targets.map(function(i) {
			var def = $.Deferred();
			var target = self.makeTarget(i);
			var depName = target['class'].getName();
			self.listenDep(depName, target, def);
			return def;
		});
		this.def = $.when.apply(null, defs);
	};

	this.makeTarget = function(origin) {
		var target = $.extend({}, origin);
		target.name = [].concat(target.name);
		return target;
	};

	this.listenDep = function(depName, target, def) {
		$doc.on(depName + '/init', function(e, inst) {
			deps[depName] = inst;
			self.check(target.name, inst.options.instance, def);
		});
	};

	this.check = function(names, instName, def) {
		if (!instName) return;
		var index = names.indexOf(instName);
		if (index == -1) return;
		names.splice(index, 1);
		if (!names.length) def.resolve();
	};

	this.bindInitEvent = function() {
		$doc.on(base.getName() + '/init', function(e, instance) {
			if (instance.options.instance == item.instance) {
				self.def.done(function() {
					instance[item.method](deps);
				});
			}
		});
	};

	this.init();
}

module.exports = ListenDeps;