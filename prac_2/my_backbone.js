(function(factory) {
	// root is global object
	var root = typeof self == "object" && self.self === self && self;

	root.Backbone = factory(root, {}, root._, root.$);
})(function(root, Backbone, _, $) {
	Backbone.$ = $;



	// Backbone.Events
	// ---------------

	// A module that can be mixed in to *any object* in order to provide it with
	// a custom event channel. You may bind a callback to an event with `on` or
	// remove with `off`; `trigger`-ing an event fires all callbacks in
	// succession.
	//
	//     var object = {};
	//     _.extend(object, Backbone.Events);
	//     object.on('expand', function(){ alert('expanded'); });
	//     object.trigger('expand');
	//
	var Events = Backbone.Events = {};

	// Regular expression used to split event strings.
	var eventSplitter = /\s+/;

	// Iterates over the standard `event, callback` (as well as the fancy multiple
	// space-separated events `"change blur", callback` and jQuery-style event
	// maps `{event: callback}`).
	var eventsApi = function(iteratee, events, name, callback, opts) {
		var i = 0,
			names;
		if (name && typeof name === 'object') {
			// Handle event maps.
			if (callback !== void 0 && 'context' in opts && opts.context === void 0) opts.context = callback;
			for (names = _.keys(name); i < names.length; i++) {
				events = eventsApi(iteratee, events, names[i], name[names[i]], opts);
			}
		} else if (name && eventSplitter.test(name)) {
			// Handle space-separated event names by delegating them individually.
			for (names = name.split(eventSplitter); i < names.length; i++) {
				events = iteratee(events, names[i], callback, opts);
			}
		} else {
			// Finally, standard events.
			events = iteratee(events, name, callback, opts);
		}
		return events;
	};

	// Bind an event to a `callback` function. Passing `"all"` will bind
	// the callback to all events fired.
	Events.on = function(name, callback, context) {
		return internalOn(this, name, callback, context);
	};

	// Guard the `listening` argument from the public API.
	var internalOn = function(obj, name, callback, context, listening) {
		obj._events = eventsApi(onApi, obj._events || {}, name, callback, {
			context: context,
			ctx: obj,
			listening: listening
		});

		if (listening) {
			var listeners = obj._listeners || (obj._listeners = {});
			listeners[listening.id] = listening;
		}

		return obj;
	};

	// Inversion-of-control versions of `on`. Tell *this* object to listen to
	// an event in another object... keeping track of what it's listening to
	// for easier unbinding later.
	Events.listenTo = function(obj, name, callback) {
		if (!obj) return this;
		var id = obj._listenId || (obj._listenId = _.uniqueId('l'));
		var listeningTo = this._listeningTo || (this._listeningTo = {});
		var listening = listeningTo[id];

		// This object is not listening to any other events on `obj` yet.
		// Setup the necessary references to track the listening callbacks.
		if (!listening) {
			var thisId = this._listenId || (this._listenId = _.uniqueId('l'));
			listening = listeningTo[id] = {
				obj: obj,
				objId: id,
				id: thisId,
				listeningTo: listeningTo,
				count: 0
			};
		}

		// Bind callbacks on obj, and keep track of them on listening.
		internalOn(obj, name, callback, this, listening);
		return this;
	};

	// The reducing API that adds a callback to the `events` object.
	var onApi = function(events, name, callback, options) {
		if (callback) {
			var handlers = events[name] || (events[name] = []);
			var context = options.context,
				ctx = options.ctx,
				listening = options.listening;
			if (listening) listening.count++;

			handlers.push({
				callback: callback,
				context: context,
				ctx: context || ctx,
				listening: listening
			});
		}
		return events;
	};

	// Remove one or many callbacks. If `context` is null, removes all
	// callbacks with that function. If `callback` is null, removes all
	// callbacks for the event. If `name` is null, removes all bound
	// callbacks for all events.
	Events.off = function(name, callback, context) {
		if (!this._events) return this;
		this._events = eventsApi(offApi, this._events, name, callback, {
			context: context,
			listeners: this._listeners
		});
		return this;
	};

	// Tell this object to stop listening to either specific events ... or
	// to every object it's currently listening to.
	Events.stopListening = function(obj, name, callback) {
		var listeningTo = this._listeningTo;
		if (!listeningTo) return this;

		var ids = obj ? [obj._listenId] : _.keys(listeningTo);

		for (var i = 0; i < ids.length; i++) {
			var listening = listeningTo[ids[i]];

			// If listening doesn't exist, this object is not currently
			// listening to obj. Break out early.
			if (!listening) break;

			listening.obj.off(name, callback, this);
		}

		return this;
	};

	// The reducing API that removes a callback from the `events` object.
	var offApi = function(events, name, callback, options) {
		if (!events) return;

		var i = 0,
			listening;
		var context = options.context,
			listeners = options.listeners;

		// Delete all events listeners and "drop" events.
		if (!name && !callback && !context) {
			var ids = _.keys(listeners);
			for (; i < ids.length; i++) {
				listening = listeners[ids[i]];
				delete listeners[listening.id];
				delete listening.listeningTo[listening.objId];
			}
			return;
		}

		var names = name ? [name] : _.keys(events);
		for (; i < names.length; i++) {
			name = names[i];
			var handlers = events[name];

			// Bail out if there are no events stored.
			if (!handlers) break;

			// Replace events if there are any remaining.  Otherwise, clean up.
			var remaining = [];
			for (var j = 0; j < handlers.length; j++) {
				var handler = handlers[j];
				if (
					callback && callback !== handler.callback &&
					callback !== handler.callback._callback ||
					context && context !== handler.context
				) {
					remaining.push(handler);
				} else {
					listening = handler.listening;
					if (listening && --listening.count === 0) {
						delete listeners[listening.id];
						delete listening.listeningTo[listening.objId];
					}
				}
			}

			// Update tail event if the list has any events.  Otherwise, clean up.
			if (remaining.length) {
				events[name] = remaining;
			} else {
				delete events[name];
			}
		}
		return events;
	};

	// Bind an event to only be triggered a single time. After the first time
	// the callback is invoked, its listener will be removed. If multiple events
	// are passed in using the space-separated syntax, the handler will fire
	// once for each event, not once for a combination of all events.
	Events.once = function(name, callback, context) {
		// Map the event into a `{event: once}` object.
		var events = eventsApi(onceMap, {}, name, callback, _.bind(this.off, this));
		if (typeof name === 'string' && context == null) callback = void 0;
		return this.on(events, callback, context);
	};

	// Inversion-of-control versions of `once`.
	Events.listenToOnce = function(obj, name, callback) {
		// Map the event into a `{event: once}` object.
		var events = eventsApi(onceMap, {}, name, callback, _.bind(this.stopListening, this, obj));
		return this.listenTo(obj, events);
	};

	// Reduces the event callbacks into a map of `{event: onceWrapper}`.
	// `offer` unbinds the `onceWrapper` after it has been called.
	var onceMap = function(map, name, callback, offer) {
		if (callback) {
			var once = map[name] = _.once(function() {
				offer(name, once);
				callback.apply(this, arguments);
			});
			once._callback = callback;
		}
		return map;
	};

	// Trigger one or many events, firing all bound callbacks. Callbacks are
	// passed the same arguments as `trigger` is, apart from the event name
	// (unless you're listening on `"all"`, which will cause your callback to
	// receive the true name of the event as the first argument).
	Events.trigger = function(name) {
		if (!this._events) return this;

		var length = Math.max(0, arguments.length - 1);
		var args = Array(length);
		for (var i = 0; i < length; i++) args[i] = arguments[i + 1];

		eventsApi(triggerApi, this._events, name, void 0, args);
		return this;
	};

	// Handles triggering the appropriate event callbacks.
	var triggerApi = function(objEvents, name, callback, args) {
		if (objEvents) {
			var events = objEvents[name];
			var allEvents = objEvents.all;
			if (events && allEvents) allEvents = allEvents.slice();
			if (events) triggerEvents(events, args);
			if (allEvents) triggerEvents(allEvents, [name].concat(args));
		}
		return objEvents;
	};

	// A difficult-to-believe, but optimized internal dispatch function for
	// triggering events. Tries to keep the usual cases speedy (most internal
	// Backbone events have 3 arguments).
	var triggerEvents = function(events, args) {
		var ev, i = -1,
			l = events.length,
			a1 = args[0],
			a2 = args[1],
			a3 = args[2];
		switch (args.length) {
			case 0:
				while (++i < l)(ev = events[i]).callback.call(ev.ctx);
				return;
			case 1:
				while (++i < l)(ev = events[i]).callback.call(ev.ctx, a1);
				return;
			case 2:
				while (++i < l)(ev = events[i]).callback.call(ev.ctx, a1, a2);
				return;
			case 3:
				while (++i < l)(ev = events[i]).callback.call(ev.ctx, a1, a2, a3);
				return;
			default:
				while (++i < l)(ev = events[i]).callback.apply(ev.ctx, args);
				return;
		}
	};

	// Aliases for backwards compatibility.
	Events.bind = Events.on;
	Events.unbind = Events.off;

	// Backbone.View
	// -------------

	// Creating a Backbone.View creates its initial element outside of the DOM,
	// if an existing element is not provided...
	var View = (Backbone.View = function(options) {
		const newViewInstanceObject = this;
		newViewInstanceObject.cid = _.uniqueId("stopListeningview");
		_.extend(this, options);
		this._ensureElement();
		newViewInstanceObject.initialize();
	});

	// Set up all inheritable **Backbone.View** properties and methods.
	_.extend(View.prototype, Events, {
		// The default `tagName` of a View's element is `"div"`.
		tagName: "div",

		initialize: function() {},

		render: function() {
			return this;
		},

		_ensureElement: function() {
			if (!this.el) {
				var attrs = _.extend({}, _.result(this, 'attributes'));
				if (this.id) attrs.id = _.result(this, 'id');
				if (this.className) attrs['class'] = _.result(this, 'className');
				this.setElement(this._createElement(_.result(this, 'tagName')));
				this._setAttributes(attrs);
			} else {
				this.setElement(_.result(this, 'el'));
			}
		},

		setElement: function(el) {
			this.$el = el instanceof Backbone.$ ? el : Backbone.$(el);
			this.el = this.$el[0];
		},

		_createElement: function(tagName) {
			return document.createElement(tagName);
		},

		_setAttributes: function(attributes) {
			this.$el.attr(attributes);
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
	_.extend(Model.prototype, Events, {
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



	// Backbone.Collection
	// -------------------

	// If models tend to represent a single row of data, a Backbone Collection is
	// more analogous to a table full of data ... or a small slice or page of that
	// table, or a collection of rows that belong together for a particular reason
	// -- all of the messages in this particular folder, all of the documents
	// belonging to this particular author, and so on. Collections maintain
	// indexes of their models, both in order, and for lookup by `id`.

	// Create a new **Collection**, perhaps to contain a specific type of `model`.
	// If a `comparator` is specified, the Collection will maintain
	// its models in sort order, as they're added and removed.
	var Collection = Backbone.Collection = function(models, options) {
		options || (options = {});
		if (options.model) this.model = options.model;
		if (options.comparator !== void 0) this.comparator = options.comparator;
		this._reset();
		this.initialize.apply(this, arguments);
		if (models) this.reset(models, _.extend({
			silent: true
		}, options));
	};

	// Default options for `Collection#set`.
	var setOptions = {
		add: true,
		remove: true,
		merge: true
	};
	var addOptions = {
		add: true,
		remove: false
	};

	// Splices `insert` into `array` at index `at`.
	var splice = function(array, insert, at) {
		at = Math.min(Math.max(at, 0), array.length);
		var tail = Array(array.length - at);
		var length = insert.length;
		var i;
		for (i = 0; i < tail.length; i++) tail[i] = array[i + at];
		for (i = 0; i < length; i++) array[i + at] = insert[i];
		for (i = 0; i < tail.length; i++) array[i + length + at] = tail[i];
	};

	// Define the Collection's inheritable methods.
	_.extend(Collection.prototype, Events, {

		// The default model for a collection is just a **Backbone.Model**.
		// This should be overridden in most cases.
		model: Model,

		// Initialize is an empty function by default. Override it with your own
		// initialization logic.
		initialize: function() {},

		// Add a model, or list of models to the set. `models` may be Backbone
		// Models or raw JavaScript objects to be converted to Models, or any
		// combination of the two.
		add: function(models, options) {
			return this.set(models, _.extend({
				merge: false
			}, options, addOptions));
		},

		// Remove a model, or a list of models from the set.
		remove: function(models, options) {
			options = _.extend({}, options);
			var singular = !_.isArray(models);
			models = singular ? [models] : models.slice();
			var removed = this._removeModels(models, options);
			if (!options.silent && removed.length) {
				options.changes = {
					added: [],
					merged: [],
					removed: removed
				};
				this.trigger('update', this, options);
			}
			return singular ? removed[0] : removed;
		},

		// Update a collection by `set`-ing a new list of models, adding new ones,
		// removing models that are no longer present, and merging models that
		// already exist in the collection, as necessary. Similar to **Model#set**,
		// the core operation for updating the data contained by the collection.
		set: function(models, options) {
			if (models == null) return;

			options = _.extend({}, setOptions, options);
			if (options.parse && !this._isModel(models)) {
				models = this.parse(models, options) || [];
			}

			var singular = !_.isArray(models);
			models = singular ? [models] : models.slice();

			var at = options.at;
			if (at != null) at = +at;
			if (at > this.length) at = this.length;
			if (at < 0) at += this.length + 1;

			var set = [];
			var toAdd = [];
			var toMerge = [];
			var toRemove = [];
			var modelMap = {};

			var add = options.add;
			var merge = options.merge;
			var remove = options.remove;

			var sort = false;
			var sortable = this.comparator && at == null && options.sort !== false;
			var sortAttr = _.isString(this.comparator) ? this.comparator : null;

			// Turn bare objects into model references, and prevent invalid models
			// from being added.
			var model, i;
			for (i = 0; i < models.length; i++) {
				model = models[i];

				// If a duplicate is found, prevent it from being added and
				// optionally merge it into the existing model.
				var existing = this.get(model);
				if (existing) {
					if (merge && model !== existing) {
						var attrs = this._isModel(model) ? model.attributes : model;
						if (options.parse) attrs = existing.parse(attrs, options);
						existing.set(attrs, options);
						toMerge.push(existing);
						if (sortable && !sort) sort = existing.hasChanged(sortAttr);
					}
					if (!modelMap[existing.cid]) {
						modelMap[existing.cid] = true;
						set.push(existing);
					}
					models[i] = existing;

					// If this is a new, valid model, push it to the `toAdd` list.
				} else if (add) {
					model = models[i] = this._prepareModel(model, options);
					if (model) {
						toAdd.push(model);
						this._addReference(model, options);
						modelMap[model.cid] = true;
						set.push(model);
					}
				}
			}

			// Remove stale models.
			if (remove) {
				for (i = 0; i < this.length; i++) {
					model = this.models[i];
					if (!modelMap[model.cid]) toRemove.push(model);
				}
				if (toRemove.length) this._removeModels(toRemove, options);
			}

			// See if sorting is needed, update `length` and splice in new models.
			var orderChanged = false;
			var replace = !sortable && add && remove;
			if (set.length && replace) {
				orderChanged = this.length !== set.length || _.some(this.models, function(m, index) {
					return m !== set[index];
				});
				this.models.length = 0;
				splice(this.models, set, 0);
				this.length = this.models.length;
			} else if (toAdd.length) {
				if (sortable) sort = true;
				splice(this.models, toAdd, at == null ? this.length : at);
				this.length = this.models.length;
			}

			// Silently sort the collection if appropriate.
			if (sort) this.sort({
				silent: true
			});

			// Unless silenced, it's time to fire all appropriate add/sort/update events.
			if (!options.silent) {
				for (i = 0; i < toAdd.length; i++) {
					if (at != null) options.index = at + i;
					model = toAdd[i];
					model.trigger('add', model, this, options);
				}
				if (sort || orderChanged) this.trigger('sort', this, options);
				if (toAdd.length || toRemove.length || toMerge.length) {
					options.changes = {
						added: toAdd,
						removed: toRemove,
						merged: toMerge
					};
					this.trigger('update', this, options);
				}
			}

			// Return the added (or merged) model (or models).
			return singular ? models[0] : models;
		},

		// When you have more items than you want to add or remove individually,
		// you can reset the entire set with a new list of models, without firing
		// any granular `add` or `remove` events. Fires `reset` when finished.
		// Useful for bulk operations and optimizations.
		reset: function(models, options) {
			options = options ? _.clone(options) : {};
			for (var i = 0; i < this.models.length; i++) {
				this._removeReference(this.models[i], options);
			}
			options.previousModels = this.models;
			this._reset();
			models = this.add(models, _.extend({
				silent: true
			}, options));
			if (!options.silent) this.trigger('reset', this, options);
			return models;
		},

		// Add a model to the end of the collection.
		push: function(model, options) {
			return this.add(model, _.extend({
				at: this.length
			}, options));
		},

		// Remove a model from the end of the collection.
		pop: function(options) {
			var model = this.at(this.length - 1);
			return this.remove(model, options);
		},

		// Add a model to the beginning of the collection.
		unshift: function(model, options) {
			return this.add(model, _.extend({
				at: 0
			}, options));
		},

		// Remove a model from the beginning of the collection.
		shift: function(options) {
			var model = this.at(0);
			return this.remove(model, options);
		},

		// Slice out a sub-array of models from the collection.
		slice: function() {
			return slice.apply(this.models, arguments);
		},

		// Get a model from the set by id, cid, model object with id or cid
		// properties, or an attributes object that is transformed through modelId.
		get: function(obj) {
			if (obj == null) return void 0;
			return this._byId[obj] ||
				this._byId[this.modelId(obj.attributes || obj)] ||
				obj.cid && this._byId[obj.cid];
		},

		// Returns `true` if the model is in the collection.
		has: function(obj) {
			return this.get(obj) != null;
		},

		// Get the model at the given index.
		at: function(index) {
			if (index < 0) index += this.length;
			return this.models[index];
		},

		// Return models with matching attributes. Useful for simple cases of
		// `filter`.
		where: function(attrs, first) {
			return this[first ? 'find' : 'filter'](attrs);
		},

		// Return the first model with matching attributes. Useful for simple cases
		// of `find`.
		findWhere: function(attrs) {
			return this.where(attrs, true);
		},

		// Force the collection to re-sort itself. You don't need to call this under
		// normal circumstances, as the set will maintain sort order as each item
		// is added.
		sort: function(options) {
			var comparator = this.comparator;
			if (!comparator) throw new Error('Cannot sort a set without a comparator');
			options || (options = {});

			var length = comparator.length;
			if (_.isFunction(comparator)) comparator = _.bind(comparator, this);

			// Run sort based on type of `comparator`.
			if (length === 1 || _.isString(comparator)) {
				this.models = this.sortBy(comparator);
			} else {
				this.models.sort(comparator);
			}
			if (!options.silent) this.trigger('sort', this, options);
			return this;
		},

		// Pluck an attribute from each model in the collection.
		pluck: function(attr) {
			return this.map(attr + '');
		},

		// Fetch the default set of models for this collection, resetting the
		// collection when they arrive. If `reset: true` is passed, the response
		// data will be passed through the `reset` method instead of `set`.
		fetch: function(options) {
			options = _.extend({
				parse: true
			}, options);
			var success = options.success;
			var collection = this;
			options.success = function(resp) {
				var method = options.reset ? 'reset' : 'set';
				collection[method](resp, options);
				if (success) success.call(options.context, collection, resp, options);
				collection.trigger('sync', collection, resp, options);
			};
			wrapError(this, options);
			return this.sync('read', this, options);
		},

		// Create a new instance of a model in this collection. Add the model to the
		// collection immediately, unless `wait: true` is passed, in which case we
		// wait for the server to agree.
		create: function(model, options) {
			options = options ? _.clone(options) : {};
			var wait = options.wait;
			model = this._prepareModel(model, options);
			if (!model) return false;
			if (!wait) this.add(model, options);
			var collection = this;
			var success = options.success;
			options.success = function(m, resp, callbackOpts) {
				if (wait) collection.add(m, callbackOpts);
				if (success) success.call(callbackOpts.context, m, resp, callbackOpts);
			};
			model.save(null, options);
			return model;
		},

		// **parse** converts a response into a list of models to be added to the
		// collection. The default implementation is just to pass it through.
		parse: function(resp, options) {
			return resp;
		},

		// Create a new collection with an identical list of models as this one.
		clone: function() {
			return new this.constructor(this.models, {
				model: this.model,
				comparator: this.comparator
			});
		},

		// Define how to uniquely identify models in the collection.
		modelId: function(attrs) {
			return attrs[this.model.prototype.idAttribute || 'id'];
		},

		// Private method to reset all internal state. Called when the collection
		// is first initialized or reset.
		_reset: function() {
			this.length = 0;
			this.models = [];
			this._byId = {};
		},

		// Prepare a hash of attributes (or other model) to be added to this
		// collection.
		_prepareModel: function(attrs, options) {
			if (this._isModel(attrs)) {
				if (!attrs.collection) attrs.collection = this;
				return attrs;
			}
			options = options ? _.clone(options) : {};
			options.collection = this;
			var model = new this.model(attrs, options);
			if (!model.validationError) return model;
			this.trigger('invalid', this, model.validationError, options);
			return false;
		},

		// Internal method called by both remove and set.
		_removeModels: function(models, options) {
			var removed = [];
			for (var i = 0; i < models.length; i++) {
				var model = this.get(models[i]);
				if (!model) continue;

				var index = this.indexOf(model);
				this.models.splice(index, 1);
				this.length--;

				// Remove references before triggering 'remove' event to prevent an
				// infinite loop. #3693
				delete this._byId[model.cid];
				var id = this.modelId(model.attributes);
				if (id != null) delete this._byId[id];

				if (!options.silent) {
					options.index = index;
					model.trigger('remove', model, this, options);
				}

				removed.push(model);
				this._removeReference(model, options);
			}
			return removed;
		},

		// Method for checking whether an object should be considered a model for
		// the purposes of adding to the collection.
		_isModel: function(model) {
			return model instanceof Model;
		},

		// Internal method to create a model's ties to a collection.
		_addReference: function(model, options) {
			this._byId[model.cid] = model;
			var id = this.modelId(model.attributes);
			if (id != null) this._byId[id] = model;
			model.on('all', this._onModelEvent, this);
		},

		// Internal method to sever a model's ties to a collection.
		_removeReference: function(model, options) {
			delete this._byId[model.cid];
			var id = this.modelId(model.attributes);
			if (id != null) delete this._byId[id];
			if (this === model.collection) delete model.collection;
			model.off('all', this._onModelEvent, this);
		},

		// Internal method called every time a model in the set fires an event.
		// Sets need to update their indexes when models change ids. All other
		// events simply proxy through. "add" and "remove" events that originate
		// in other collections are ignored.
		_onModelEvent: function(event, model, collection, options) {
			if (model) {
				if ((event === 'add' || event === 'remove') && collection !== this) return;
				if (event === 'destroy') this.remove(model, options);
				if (event === 'change') {
					var prevId = this.modelId(model.previousAttributes());
					var id = this.modelId(model.attributes);
					if (prevId !== id) {
						if (prevId != null) delete this._byId[prevId];
						if (id != null) this._byId[id] = model;
					}
				}
			}
			this.trigger.apply(this, arguments);
		}

	});

	// Underscore methods that we want to implement on the Collection.
	// 90% of the core usefulness of Backbone Collections is actually implemented
	// right here:
	var collectionMethods = {
		forEach: 3,
		each: 3,
		map: 3,
		collect: 3,
		reduce: 0,
		foldl: 0,
		inject: 0,
		reduceRight: 0,
		foldr: 0,
		find: 3,
		detect: 3,
		filter: 3,
		select: 3,
		reject: 3,
		every: 3,
		all: 3,
		some: 3,
		any: 3,
		include: 3,
		includes: 3,
		contains: 3,
		invoke: 0,
		max: 3,
		min: 3,
		toArray: 1,
		size: 1,
		first: 3,
		head: 3,
		take: 3,
		initial: 3,
		rest: 3,
		tail: 3,
		drop: 3,
		last: 3,
		without: 0,
		difference: 0,
		indexOf: 3,
		shuffle: 1,
		lastIndexOf: 3,
		isEmpty: 1,
		chain: 1,
		sample: 3,
		partition: 3,
		groupBy: 3,
		countBy: 3,
		sortBy: 3,
		indexBy: 3,
		findIndex: 3,
		findLastIndex: 3
	};

	// Allow the `Backbone` object to serve as a global event bus, for folks who
	// want global "pubsub" in a convenient place.
	_.extend(Backbone, Events);

	// Helper function to correctly set up the prototype chain for subclasses.
	// Similar to `goog.inherits`, but uses a hash of prototype properties and
	// class properties to be extended.
	var extend = function(protoProps) {
		var BackboneComponentConstructor = this;
		var child;

		// The constructor function for the new subclass is either defined by you
		// (the "constructor" property in your `extend` definition), or defaulted
		// by us to simply call the parent constructor.
		child = function() {
			BackboneComponentConstructor.apply(this, arguments);
		};

		// Set the prototype chain to inherit from `parent`, without calling
		// `parent`'s constructor function and add the prototype properties.
		child.prototype = _.create(
			BackboneComponentConstructor.prototype,
			protoProps
		);
		child.prototype.constructor = child;

		return child;
	};

	View.extend = Model.extend = Collection.extend = extend;

	return Backbone;
});