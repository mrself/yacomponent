function ListenDeps(base, $doc, item) {
	var self = this;
	var deps = {};

	this.init = function() {
		item.targets.forEach(function(i) {
			var target = self.makeTarget(i);
			var depName = target['class'].getName();
			self.listenDep(depName, target);
		});
	};

	this.makeTarget = function(origin) {
		var target = $.extend({}, origin);
		target.name = [].concat(target.name);
		return target;
	};

	this.listenDep = function(depName, target) {
		$doc.on(depName + '/init', function(e, inst) {
			deps[depName] = inst;
			self.check(target.name, inst.options.instance);
		});
	};

	this.check = function(names, instName) {
		if (!instName) return;
		var index = names.indexOf(instName);
		if (index == -1) return;
		names.splice(index, 1);
		if (!names.length) this.bindInitEvent();
	};

	this.bindInitEvent = function() {
		$doc.on(base.getName() + '/init', function(e, instance) {
			if (instance.options.instance == item.instance)
				instance[item.method](deps);
		});
	};

	this.init();
}

module.exports = ListenDeps;