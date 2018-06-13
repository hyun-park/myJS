(function() {

	var AppView = Backbone.View.extend({
		el: "#app",
		initialize: function() {
			this.render();
		},
		render: function() {
			$(this.el).html(`
				<h1>Hi</h1>
			`)
			return this;
		}
	});

	var appView = new AppView();
})();