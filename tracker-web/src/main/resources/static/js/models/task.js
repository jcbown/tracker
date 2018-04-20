define(function(require) {
    var Backbone = require('backbone');
    var Moment = require('moment');
    var Utils = require('js/utils');

    return Backbone.Model.extend({
        urlRoot: 'tasks',
        parse: function(response, options) {
            // parse tags CSV as array
            if (response.tags) {
                response.tagsList = response.tags.split(",").sort();
            }

            // parse reportingLevelJson as object
            var reportingLevel = {
                level10: false,
                level20: false,
                level30: false
            };
            Object.assign(reportingLevel, JSON.parse(response.reportingLevelJson)); // overrides default false values
            response.reportingLevel = reportingLevel;

            return response;
        },
        save: function (key, val, options) {
            // turn tags array to CSV
            if (this.has('tagsList') && this.get('tagsList').length != 0) {
                this.set('tags', this.get('tagsList').join(','));
            } else {
                this.unset('tags'); // no tags is equivalent to null
            }
            // turn reporting level into JSON
            if (this.has('reportingLevel')) {
                this.set('reportingLevelJson', JSON.stringify(this.get('reportingLevel')));
            } else {
                this.unset('reportingLevelJson');
            }
            return Backbone.Model.prototype.save.call(this, key, val, options);
        },
        isSnoozed: function() {
            var snoozedUntil = this.get('snoozedUntil');
            var now = new Date();
            return snoozedUntil && now < new Date(snoozedUntil);
        },
        isUnsnoozed: function() {
            var snoozedUntil = this.get('snoozedUntil');
            var now = new Date();
            return snoozedUntil && now >= new Date(snoozedUntil);
        },
        isDueSoon: function() {
            var threshold = Moment().add(2, 'days').toDate();
            var dueDate = this.get('dueDate');
            var status = this.get('status');
            return status != "DONE" && dueDate && new Date(dueDate) < threshold;
        },
        isOverdue: function() {
            var now = new Date();
            var dueDate = this.get('dueDate');
            var status = this.get('status');
            return status != "DONE" && dueDate && new Date(dueDate) < now;
        },
        search: function(searchValue) {
            if (searchValue) {
                var inSummary = this.get('summary') ? this.get('summary').toLowerCase().indexOf(searchValue.toLowerCase()) >= 0 : false;
                var inTags = this.get('tagsList') ? _.some(this.get('tagsList'), function(tag) {
                    return tag.toLowerCase().indexOf(searchValue.toLowerCase()) >= 0;
                }) : false;
                return inSummary || inTags;
            } else {
                return true;
            }
        }
    });
});