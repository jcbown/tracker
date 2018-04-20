define(function(require) {
    var Backbone = require('backbone');
    var Task = require('js/models/task');

    return Backbone.Collection.extend({
        model: Task,
        url: 'tasks',
        comparator: 'summary',
        getTags: function() {
            // get all tags
            var allTags = new Set();
            this.each(function(task) {
                var tags = task.get('tagsList');
                if (tags) {
                    for (var i in tags) {
                        var tag = tags[i];
                        allTags.add(tag);
                    }
                }
            });
            return Array.from(allTags).sort();
        }
    });
});