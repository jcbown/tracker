define(function(require) {
    var Backbone = require('backbone');
    var Handlebars = require('handlebars');
    var TaskView = require('js/views/TaskView');
    var TaskDetailsView = require('js/views/TaskDetailsView');

    return Backbone.View.extend({

        events: {
        },
        initialize: function(options) {
            this.tasks = options.tasks;
            this.task = options.task
            this.listenTo(this.task, 'destroy', this.close);
        },
        render: function() {

            var taskView = new TaskView({
                tasks: this.tasks,
                task: this.task
            });
            var detailsView = new TaskDetailsView({
                tasks: this.tasks,
                task: this.task
            });
            detailsView.render();

            var template = Handlebars.getTemplate('editTaskModal');
            var html = template({});
            this.$el.html(html);
            this.$(".modal-body").append(taskView.el);
            this.$(".modal-body").append(detailsView.el);
            this.$(".modal").modal();
        },
        close: function() {
            this.$(".modal").modal('hide');
        }
    });
});
