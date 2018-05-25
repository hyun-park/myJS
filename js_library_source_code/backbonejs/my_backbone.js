(function(factory) {
    // root is global object
    var root = typeof self == "object" && self.self === self && self;

    root.Backbone = factory(root, {}, root._, root.$);
})(function(root, Backbone, _, $) {
    // Create a local reference to a common array method we'll want to use later.
    var slice = Array.prototype.slice;
    Backbone.$ = $;

    // Backbone.View
    // -------------

    // Creating a Backbone.View creates its initial element outside of the DOM,
    // if an existing element is not provided...
    var View = (Backbone.View = function(options) {
        const newViewInstanceObject = this;
        newViewInstanceObject.cid = _.uniqueId("stopListeningview");
        newViewInstanceObject._ensureElement();
        newViewInstanceObject.initialize.apply(
            newViewInstanceObject,
            arguments
        );
    });

    // Set up all inheritable **Backbone.View** properties and methods.
    _.extend(View.prototype, {
        // The default `tagName` of a View's element is `"div"`.
        tagName: "div",

        // Initialize is an empty function by default. Override it with your own
        // initialization logic.
        initialize: function() {},

        // Ensure that the View has a DOM element to render into.
        // If `this.el` is a string, pass it through `$()`, take the first
        // matching element, and re-assign it to `el`. Otherwise, create
        // an element from the `id`, `className` and `tagName` properties.
        _ensureElement: function() {
            const newViewInstanceObject = this;
            console.log(newViewInstanceObject);
            if (!newViewInstanceObject.el) {
                var attrs = _.extend(
                    {},
                    _.result(newViewInstanceObject, "attributes")
                );
                if (newViewInstanceObject.id)
                    attrs.id = _.result(newViewInstanceObject, "id");
                if (newViewInstanceObject.className)
                    attrs["class"] = _.result(
                        newViewInstanceObject,
                        "className"
                    );
                newViewInstanceObject.setElement(
                    newViewInstanceObject._createElement(
                        _.result(newViewInstanceObject, "tagName")
                    )
                );
                newViewInstanceObject._setAttributes(attrs);
            } else {
                newViewInstanceObject.setElement(
                    _.result(newViewInstanceObject, "el")
                );
            }
        },

        // Change the view's element (`this.el` property) and re-delegate the
        // view's events on the new element.
        setElement: function(element) {
            this._setElement(element);
            return this;
        },

        // Creates the `this.el` and `this.$el` references for this view using the
        // given `el`. `el` can be a CSS selector or an HTML string, a jQuery
        // context or an element. Subclasses can override this to utilize an
        // alternative DOM manipulation API and are only required to set the
        // `this.el` property.
        _setElement: function(el) {
            this.$el = el instanceof Backbone.$ ? el : Backbone.$(el);
            this.el = this.$el[0];
        },

        // Produces a DOM element to be assigned to your view. Exposed for
        // subclasses using an alternative DOM manipulation API.
        _createElement: function(tagName) {
            return document.createElement(tagName);
        },

        // **render** is the core function that your view should override, in order
        // to populate its element (`this.el`), with the appropriate HTML. The
        // convention is for **render** to always return `this`.
        render: function() {
            return this;
        },

        // Set attributes from a hash on this view's element.  Exposed for
        // subclasses using an alternative DOM manipulation API.
        _setAttributes: function(attributes) {
            this.$el.attr(attributes);
        }
    });

    // Helper function to correctly set up the prototype chain for subclasses.
    // Similar to `goog.inherits`, but uses a hash of prototype properties and
    // class properties to be extended.
    var extend = function(protoProps, staticProps) {
        var BackboneViewConstructor = this;
        var child;

        // The constructor function for the new subclass is either defined by you
        // (the "constructor" property in your `extend` definition), or defaulted
        // by us to simply call the parent constructor.
        child = function() {
            BackboneViewConstructor.apply(this, arguments);
        };

        // Add static properties to the constructor function, if supplied.
        _.extend(child, BackboneViewConstructor, staticProps);

        // Set the prototype chain to inherit from `parent`, without calling
        // `parent`'s constructor function and add the prototype properties.
        child.prototype = _.create(
            BackboneViewConstructor.prototype,
            protoProps
        );
        child.prototype.constructor = child;

        return child;
    };

    // Set up inheritance for the model, collection, router, view and history.
    View.extend = extend;

    return Backbone;
});
