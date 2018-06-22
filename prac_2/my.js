(function() {
    var Post = Backbone.Model.extend({});

    var Posts = Backbone.Collection.extend({
        model: Post,
        url: "https://jsonplaceholder.typicode.com/posts"
    });

    var posts = new Posts();

    var PostView = Backbone.View.extend({
        template: _.template(
            `
				<h2><%- title %></h2>
				<p>
					<%- body %>
				</p>
			`
        ),
        tagName: "div",
        className: "post",
        render: function() {
            console.log(this.model);
            $(this.el).html(this.template(this.model.attributes));
            return this;
        }
    });

    var PostsView = Backbone.View.extend({
        tagName: "div",
        render: function() {
            const self = this;
            const posts = this.collection.models;

            for (let i = 0; i < posts.length; i++) {
                const postView = new PostView({
                    model: posts[i]
                });
                $(self.el).append(postView.render().el);
            }

            return this;
        }
    });

    var AppView = Backbone.View.extend({
        // el - stands for element. Every view has a element associate in with HTML
        //      content will be rendered.
        // el: $('#app'),
        el: "#app",

        events: {
            "click #submit-btn": "createPost"
        },

        template: _.template(
            `
				<h1>The Junghyun Blog</h1>
				<div id="posts-form">
				<div class="title-form-wrapper">
					<label class="title">
					Title:
					</label>
					<br>
					<input type="text" id="title-input" />
				</div>
				<div class="content-form-wrapper">
					<label class="content-wrapper">
					Content:
					</label>
					<br>
					<textarea id="content-input"></textarea>
				</div>
				<div class="submit-form-wrapper">
					<button id="submit-btn">Submit</button>
				</div>
				<div id="posts-container">
				</div>
			`
        ),
        initialize: function() {
            const self = this;
            posts.fetch({
                success: function(resp) {
                    self.postsCollection = posts;
                    self.render();
                },
                error: function(err) {
                    console.log(err);
                }
            });
        },
        // $el - it's a cached jQuery object (el), in which you can use jQuery functions
        //       to push content. Like the Hello World in this case.
        render: function() {
            $(this.el).html(this.template());

            postsView = new PostsView({
                collection: this.postsCollection
            });

            $(this.el)
                .find("#posts-container")
                .append(postsView.render().el);

            return this;
        },
        createPost: function() {
            this.postsCollection.add(
                new Post({
                    title: $(this.el)
                        .find("#title-input")
                        .val(),
                    body: $(this.el)
                        .find("#content-input")
                        .val()
                })
            );
        }
    });

    var appView = new AppView();
})();
