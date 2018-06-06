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
		_.extend(this, options);
		newViewInstanceObject.setElement(_.result(newViewInstanceObject, "el"));
		newViewInstanceObject.initialize();
	});

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
		}
	});

	var Model = (Backbone.Model = function(attrs = {}, options = {}) {
		this.cid = _.uniqueId(this.cidPrefix);
		this.attributes = {};
		var defaults = _.result(this, "defaults");
		attrs = _.defaults(_.extend({}, defaults, attrs), defaults);
		this.set(attrs, options);
		this.initialize(arguments);
	});

	// Attach all inheritable methods to the Model prototype.
	_.extend(Model.prototype, {
		// The default name for the JSON `id` attribute is `"id"`. MongoDB and
		// CouchDB users may want to set this to `"_id"`.
		idAttribute: "id",

		// The prefix is used to create the client id which is used to identify models locally.
		// You may want to override this if you're experiencing name clashes with model ids.
		cidPrefix: "c",

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
			if (typeof key === "object") {
				attrs = key;
				options = val;
			} else {
				(attrs = {})[key] = val;
			}

			options || (options = {});

			var current = this.attributes;

			// For each `set` attribute, update or delete the current value.
			for (var attr in attrs) {
				val = attrs[attr];
				current[attr] = val;
			}

			// Update the `id`.
			if (this.idAttribute in attrs) this.id = this.get(this.idAttribute);

			return this;
		}
	});

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