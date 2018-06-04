(function(factory) {
	// root is global object
	var root = typeof self == "object" && self.self === self && self;

	root.Backbone = factory(root, {}, root._, root.$);
})(function(root, Backbone, _, $) {
	Backbone.$ = $;

	// Backbone.View
	// -------------

	// Creating a Backbone.View creates its initial element outside of the DOM,
	// if an existing element is not provided...
	var View = (Backbone.View = function(options) {
		const newViewInstanceObject = this;
		newViewInstanceObject.cid = _.uniqueId("stopListeningview");
		// _.extend(this, _.pick(options, viewOptions));
		_.extend(this, options);
		newViewInstanceObject.setElement(
			_.result(newViewInstanceObject, "el")
		);
		newViewInstanceObject.initialize();
	});

	// var viewOptions = ['model', 'collection', 'el', 'id', 'attributes', 'className', 'tagName', 'events'];

	// Set up all inheritable **Backbone.View** properties and methods.
	_.extend(View.prototype, {
		// The default `tagName` of a View's element is `"div"`.
		tagName: "div",

		// Initialize is an empty function by default. Override it with your own
		// initialization logic.
		initialize: function() {},

		// Change the view's element (`this.el` property) and re-delegate the
		// view's events on the new element.
		setElement: function(el) {
			this.$el = el instanceof Backbone.$ ? el : Backbone.$(el);
			this.el = this.$el[0];
		},

		// **render** is the core function that your view should override, in order
		// to populate its element (`this.el`), with the appropriate HTML. The
		// convention is for **render** to always return `this`.
		render: function() {
			return this;
		},
	});

	var Model = Backbone.Model = function(attrs = {}, options = {}) {
		this.cid = _.uniqueId(this.cidPrefix);
		this.attributes = {};
		var defaults = _.result(this, 'defaults');
		attrs = _.defaults(_.extend({}, defaults, attrs), defaults);
		this.set(attrs, options);
		this.changed = {};
		this.initialize(arguments);
	};

	// Attach all inheritable methods to the Model prototype.
	_.extend(Model.prototype, {

		// The default name for the JSON `id` attribute is `"id"`. MongoDB and
		// CouchDB users may want to set this to `"_id"`.
		idAttribute: 'id',

		// The prefix is used to create the client id which is used to identify models locally.
		// You may want to override this if you're experiencing name clashes with model ids.
		cidPrefix: 'c',

		// Initialize is an empty function by default. Override it with your own
		// initialization logic.
		initialize: function() {},

		// Get the value of an attribute.
		get: function(attr) {
			return this.attributes[attr];
		},

		// Set a hash of model attributes on the object, firing `"change"`. This is
		// the core primitive operation of a model, updating the data and notifying
		// anyone who needs to know about the change in state. The heart of the beast.
		set: function(key, val, options) {
			if (key == null) return this;

			// Handle both `"key", value` and `{key: value}` -style arguments.
			var attrs;
			if (typeof key === 'object') {
				attrs = key;
				options = val;
			} else {
				(attrs = {})[key] = val;
			}

			options || (options = {});

			// // Run validation.
			// if (!this._validate(attrs, options)) return false;

			// Extract attributes and options.
			var unset = options.unset;
			var silent = options.silent;
			var changes = [];
			var changing = this._changing;
			this._changing = true;

			if (!changing) {
				this._previousAttributes = _.clone(this.attributes);
				this.changed = {};
			}

			var current = this.attributes;
			var changed = this.changed;
			var prev = this._previousAttributes;

			// For each `set` attribute, update or delete the current value.
			for (var attr in attrs) {
				val = attrs[attr];
				if (!_.isEqual(current[attr], val)) changes.push(attr);
				if (!_.isEqual(prev[attr], val)) {
					changed[attr] = val;
				} else {
					delete changed[attr];
				}
				unset ? delete current[attr] : current[attr] = val;
			}

			// Update the `id`.
			if (this.idAttribute in attrs) this.id = this.get(this.idAttribute);

			// Trigger all relevant attribute changes.
			if (!silent) {
				if (changes.length) this._pending = options;
				for (var i = 0; i < changes.length; i++) {
					this.trigger('change:' + changes[i], this, current[changes[i]], options);
				}
			}

			// You might be wondering why there's a `while` loop here. Changes can
			// be recursively nested within `"change"` events.
			if (changing) return this;
			if (!silent) {
				while (this._pending) {
					options = this._pending;
					this._pending = false;
					this.trigger('change', this, options);
				}
			}
			this._pending = false;
			this._changing = false;
			return this;
		},

		trigger: function(name) {
			if (!this._events) return this;

			var length = Math.max(0, arguments.length - 1);
			var args = Array(length);
			for (var i = 0; i < length; i++) args[i] = arguments[i + 1];

			eventsApi(triggerApi, this._events, name, void 0, args);
			return this;
		},

	});

	// Underscore methods that we want to implement on the Model, mapped to the
	// number of arguments they take.
	var modelMethods = {
		keys: 1,
		values: 1,
		pairs: 1,
		invert: 1,
		pick: 0,
		omit: 0,
		chain: 1,
		isEmpty: 1
	};
	var addMethod = function(length, method, attribute) {
		switch (length) {
			case 1:
				return function() {
					return _[method](this[attribute]);
				};
			case 2:
				return function(value) {
					return _[method](this[attribute], value);
				};
			case 3:
				return function(iteratee, context) {
					return _[method](this[attribute], cb(iteratee, this), context);
				};
			case 4:
				return function(iteratee, defaultVal, context) {
					return _[method](this[attribute], cb(iteratee, this), defaultVal, context);
				};
			default:
				return function() {
					var args = slice.call(arguments);
					args.unshift(this[attribute]);
					return _[method].apply(_, args);
				};
		}
	};
	var addUnderscoreMethods = function(Class, methods, attribute) {
		_.each(methods, function(length, method) {
			if (_[method]) Class.prototype[method] = addMethod(length, method, attribute);
		});
	};

	// Mix in each Underscore method as a proxy to `Model#attributes`.
	addUnderscoreMethods(Model, modelMethods, 'attributes');


	// Helper function to correctly set up the prototype chain for subclasses.
	// Similar to `goog.inherits`, but uses a hash of prototype properties and
	// class properties to be extended.
	var extend = function(protoProps) {
		var BackboneViewConstructor = this;
		var child;

		// The constructor function for the new subclass is either defined by you
		// (the "constructor" property in your `extend` definition), or defaulted
		// by us to simply call the parent constructor.
		child = function() {
			BackboneViewConstructor.apply(this, arguments);
		};

		// Set the prototype chain to inherit from `parent`, without calling
		// `parent`'s constructor function and add the prototype properties.
		child.prototype = _.create(
			BackboneViewConstructor.prototype,
			protoProps
		);
		child.prototype.constructor = child;

		return child;
	};

	Model.extend = View.extend = extend;

	return Backbone;
});
