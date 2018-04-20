define(function(require) {
    var Backbone = require('backbone');
    var Handlebars = require('handlebars');

    return Backbone.View.extend({

        events: {
        },
        initialize: function() {
        },
        render: function() {
            var template = Handlebars.getTemplate('help');
            var html = template({
            });
            this.$el.html(html);
        },
        close: function() {
            this.remove();
        }
    });
});
