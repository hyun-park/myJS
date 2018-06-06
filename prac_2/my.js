(function() {


	var Post = Backbone.Model.extend({
		defaults: {
			author: "rocket"
		}
	});

	var Posts = Backbone.Collection.extend({
		model: Post
	});


	var post1 = new Post({
		title: "The fundamental of Backbone.",
		content: "When I started learning BackboneJS..."
	});

	var post2 = new Post({
		title: "The fundamental of JS.",
		content: "When I started learning JS..."
	});

	var posts = new Posts();

	posts.add([post1, post2]);

	var PostView = Backbone.View.extend({
		el: '#posts-container',
		template: _.template(
			`
				<h3><%- title %></h3>
				<h4>By <%- author %></h4>
				<p>
					<%- content %>
				</p>
			`
		),
		tagName: 'div',
		className: 'post',
		initialize: function() {
			this.render();
		},
		render: function() {
			this.$el.html(this.template(this.model.attributes));
			return this;
		},

	});

	var AppView = Backbone.View.extend({
		// el - stands for element. Every view has a element associate in with HTML
		//      content will be rendered.
		// el: $('#app'),
		el: '#app',

		template: _.template(
			`
				<h1>The Junghyun Blog</h1>
				<div id="posts-container">
				</div>
			`
		),
		initialize: function() {


			this.render();
		},
		// $el - it's a cached jQuery object (el), in which you can use jQuery functions
		//       to push content. Like the Hello World in this case.
		render: function() {
			this.$el.html(this.template());
			for (let i = 0; i < this.collection.length; i += 1) {
				const postView = new PostView({
					model: this.collection.models[i]
				});
				this.$el.find("#posts-container").append(postView.render().$el);
			}

			return this;
		}
	});

	var appView = new AppView({
		collection: posts
	});
})();