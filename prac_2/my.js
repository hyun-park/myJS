(function() {


	var Post = Backbone.Model.extend();

	var Posts = Backbone.Collection.extend({
		model: Post,
		url: "https://jsonplaceholder.typicode.com/posts"
	});

	// var post1 = new Post({
	// 	title: "The fundamental of Backbone.",
	// 	content: "When I started learning BackboneJS..."
	// });
	//
	// var post2 = new Post({
	// 	title: "The fundamental of JS.",
	// 	content: "When I started learning JS..."
	// });

	var posts = new Posts();



	var PostView = Backbone.View.extend({
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
		render: function() {
			$(this.el).html(this.template(this.model.attributes));
			return this;
		},
	});

	var PostsView = Backbone.View.extend({
		tagName: 'div',
		render: function() {
			const self = this;

			this.collection.fetch({
				success: function(resp) {
					console.log(resp);
					console.log(self);
				}
			});

			// const posts = this.collection.models;
			// for (let i = 0; i < posts.length; i++) {
			// 	const postView = new PostView({
			// 		model: posts[i]
			// 	});
			// 	$(self.el).append(postView.render().el);
			// }
			return this;
		}
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
			const self = this;
			$(this.el).html(this.template());

			const postsView = new PostsView({
				collection: posts
			});

			$(this.el).find("#posts-container").append(postsView.render().el);

			return this;
		}
	});

	var appView = new AppView();
})();