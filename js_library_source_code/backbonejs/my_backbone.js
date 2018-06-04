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

	var Model = Backbone.Model = function(attributes, options) {
		var attrs = attributes || {};
		options || (options = {});
		this.cid = _.uniqueId(this.cidPrefix);
		this.attributes = {};
		if (options.collection) this.collection = options.collection;
		if (options.parse) attrs = this.parse(attrs, options) || {};
		var defaults = _.result(this, 'defaults');
		attrs = _.defaults(_.extend({}, defaults, attrs), defaults);
		this.set(attrs, options);
		this.changed = {};
		this.initialize.apply(this, arguments);
	};

	// Attach all inheritable methods to the Model prototype.
	_.extend(Model.prototype, {

		// A hash of attributes whose current and previous value differ.
		changed: null,

		// The value returned during the last failed validation.
		validationError: null,

		// The default name for the JSON `id` attribute is `"id"`. MongoDB and
		// CouchDB users may want to set this to `"_id"`.
		idAttribute: 'id',

		// The prefix is used to create the client id which is used to identify models locally.
		// You may want to override this if you're experiencing name clashes with model ids.
		cidPrefix: 'c',

		// Initialize is an empty function by default. Override it with your own
		// initialization logic.
		initialize: function() {},

		// Return a copy of the model's `attributes` object.
		toJSON: function(options) {
			return _.clone(this.attributes);
		},

		// Proxy `Backbone.sync` by default -- but override this if you need
		// custom syncing semantics for *this* particular model.
		sync: function() {
			return Backbone.sync.apply(this, arguments);
		},

		// Get the value of an attribute.
		get: function(attr) {
			return this.attributes[attr];
		},

		// Get the HTML-escaped value of an attribute.
		escape: function(attr) {
			return _.escape(this.get(attr));
		},

		// Returns `true` if the attribute contains a value that is not null
		// or undefined.
		has: function(attr) {
			return this.get(attr) != null;
		},

		// Special-cased proxy to underscore's `_.matches` method.
		matches: function(attrs) {
			return !!_.iteratee(attrs, this)(this.attributes);
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

		// Remove an attribute from the model, firing `"change"`. `unset` is a noop
		// if the attribute doesn't exist.
		unset: function(attr, options) {
			return this.set(attr, void 0, _.extend({}, options, {
				unset: true
			}));
		},

		// Clear all attributes on the model, firing `"change"`.
		clear: function(options) {
			var attrs = {};
			for (var key in this.attributes) attrs[key] = void 0;
			return this.set(attrs, _.extend({}, options, {
				unset: true
			}));
		},

		// Determine if the model has changed since the last `"change"` event.
		// If you specify an attribute name, determine if that attribute has changed.
		hasChanged: function(attr) {
			if (attr == null) return !_.isEmpty(this.changed);
			return _.has(this.changed, attr);
		},

		// Return an object containing all the attributes that have changed, or
		// false if there are no changed attributes. Useful for determining what
		// parts of a view need to be updated and/or what attributes need to be
		// persisted to the server. Unset attributes will be set to undefined.
		// You can also pass an attributes object to diff against the model,
		// determining if there *would be* a change.
		changedAttributes: function(diff) {
			if (!diff) return this.hasChanged() ? _.clone(this.changed) : false;
			var old = this._changing ? this._previousAttributes : this.attributes;
			var changed = {};
			for (var attr in diff) {
				var val = diff[attr];
				if (_.isEqual(old[attr], val)) continue;
				changed[attr] = val;
			}
			return _.size(changed) ? changed : false;
		},

		// Get the previous value of an attribute, recorded at the time the last
		// `"change"` event was fired.
		previous: function(attr) {
			if (attr == null || !this._previousAttributes) return null;
			return this._previousAttributes[attr];
		},

		// Get all of the attributes of the model at the time of the previous
		// `"change"` event.
		previousAttributes: function() {
			return _.clone(this._previousAttributes);
		},

		// Fetch the model from the server, merging the response with the model's
		// local attributes. Any changed attributes will trigger a "change" event.
		fetch: function(options) {
			options = _.extend({
				parse: true
			}, options);
			var model = this;
			var success = options.success;
			options.success = function(resp) {
				var serverAttrs = options.parse ? model.parse(resp, options) : resp;
				if (!model.set(serverAttrs, options)) return false;
				if (success) success.call(options.context, model, resp, options);
				model.trigger('sync', model, resp, options);
			};
			wrapError(this, options);
			return this.sync('read', this, options);
		},

		// Set a hash of model attributes, and sync the model to the server.
		// If the server returns an attributes hash that differs, the model's
		// state will be `set` again.
		save: function(key, val, options) {
			// Handle both `"key", value` and `{key: value}` -style arguments.
			var attrs;
			if (key == null || typeof key === 'object') {
				attrs = key;
				options = val;
			} else {
				(attrs = {})[key] = val;
			}

			options = _.extend({
				validate: true,
				parse: true
			}, options);
			var wait = options.wait;

			// If we're not waiting and attributes exist, save acts as
			// `set(attr).save(null, opts)` with validation. Otherwise, check if
			// the model will be valid when the attributes, if any, are set.
			// if (attrs && !wait) {
			// 	if (!this.set(attrs, options)) return false;
			// } else if (!this._validate(attrs, options)) {
			// 	return false;
			// }

			// After a successful server-side save, the client is (optionally)
			// updated with the server-side state.
			var model = this;
			var success = options.success;
			var attributes = this.attributes;
			options.success = function(resp) {
				// Ensure attributes are restored during synchronous saves.
				model.attributes = attributes;
				var serverAttrs = options.parse ? model.parse(resp, options) : resp;
				if (wait) serverAttrs = _.extend({}, attrs, serverAttrs);
				if (serverAttrs && !model.set(serverAttrs, options)) return false;
				if (success) success.call(options.context, model, resp, options);
				model.trigger('sync', model, resp, options);
			};
			wrapError(this, options);

			// Set temporary attributes if `{wait: true}` to properly find new ids.
			if (attrs && wait) this.attributes = _.extend({}, attributes, attrs);

			var method = this.isNew() ? 'create' : (options.patch ? 'patch' : 'update');
			if (method === 'patch' && !options.attrs) options.attrs = attrs;
			var xhr = this.sync(method, this, options);

			// Restore attributes.
			this.attributes = attributes;

			return xhr;
		},

		// Destroy this model on the server if it was already persisted.
		// Optimistically removes the model from its collection, if it has one.
		// If `wait: true` is passed, waits for the server to respond before removal.
		destroy: function(options) {
			options = options ? _.clone(options) : {};
			var model = this;
			var success = options.success;
			var wait = options.wait;

			var destroy = function() {
				model.stopListening();
				model.trigger('destroy', model, model.collection, options);
			};

			options.success = function(resp) {
				if (wait) destroy();
				if (success) success.call(options.context, model, resp, options);
				if (!model.isNew()) model.trigger('sync', model, resp, options);
			};

			var xhr = false;
			if (this.isNew()) {
				_.defer(options.success);
			} else {
				wrapError(this, options);
				xhr = this.sync('delete', this, options);
			}
			if (!wait) destroy();
			return xhr;
		},

		// Default URL for the model's representation on the server -- if you're
		// using Backbone's restful methods, override this to change the endpoint
		// that will be called.
		url: function() {
			var base =
				_.result(this, 'urlRoot') ||
				_.result(this.collection, 'url') ||
				urlError();
			if (this.isNew()) return base;
			var id = this.get(this.idAttribute);
			return base.replace(/[^\/]$/, '$&/') + encodeURIComponent(id);
		},

		// **parse** converts a response into the hash of attributes to be `set` on
		// the model. The default implementation is just to pass the response along.
		parse: function(resp, options) {
			return resp;
		},

		// Create a new model with identical attributes to this one.
		clone: function() {
			return new this.constructor(this.attributes);
		},

		// A model is new if it has never been saved to the server, and lacks an id.
		isNew: function() {
			return !this.has(this.idAttribute);
		},

		// // Check if the model is currently in a valid state.
		// isValid: function(options) {
		// 	return this._validate({}, _.extend({}, options, {
		// 		validate: true
		// 	}));
		// },
		//
		// // Run validation against the next complete set of model attributes,
		// // returning `true` if all is well. Otherwise, fire an `"invalid"` event.
		// _validate: function(attrs, options) {
		// 	if (!options.validate || !this.validate) return true;
		// 	attrs = _.extend({}, this.attributes, attrs);
		// 	var error = this.validationError = this.validate(attrs, options) || null;
		// 	if (!error) return true;
		// 	this.trigger('invalid', this, error, _.extend(options, {
		// 		validationError: error
		// 	}));
		// 	return false;
		// },


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
