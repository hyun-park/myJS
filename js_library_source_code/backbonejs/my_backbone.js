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
		newViewInstanceObject.setElement(
			_.result(newViewInstanceObject, "el")
		);
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
		},
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

	View.extend = extend;

	return Backbone;
});
