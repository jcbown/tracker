define(function(require) {
    var Backbone = require('backbone');
    var Handlebars = require('handlebars');
    var Utils = require('js/utils');
    var DateTimePicker = require('bootstrap-datetimepicker');
    var Moment = require('moment');

    return Backbone.View.extend({

        initialize: function(options) {
            this.task = options.task;
        },
        events: {
            // we use the mousedown because the popover disappears before a click event fires due to 'defocus'
            "mousedown .laterTodayBtn": "setLaterToday",
            "mousedown .tomorrowBtn": "setTomorrow",
            "mousedown .threeDaysBtn": "setThreeDays",
            "mousedown .nextWeekBtn": "setNextWeek",
            "mousedown .twoWeeksBtn": "setTwoWeeks",
            "mousedown .fourWeeksBtn": "setFourWeeks",
            "mousedown .customSnoozeBtn": "setCustom",
            "mousedown .unsnoozeBtn": "unsnooze"
        },
        render: function() {
            var template = Handlebars.getTemplate('snooze');
            var html = template({
            });
            this.$el.html(html);

            var defaultDate = Moment().hours(8).minutes(0).seconds(0);
            if (this.task.get('snoozedUntil')) {
                defaultDate = new Date(this.task.get('snoozedUntil'));
            }
            $('#snoozeDateTimePicker').datetimepicker({
                inline: true,
                sideBySide: true,
                defaultDate: defaultDate
            });
        },
        setLaterToday: function() {
            var date = Moment().add(4, 'hours');
            this.task.set('snoozedUntil', date);
            this.task.save();
        },
        setTomorrow: function() {
            var date = Moment().add(1, 'days').hours(8).minutes(0).seconds(0);
            this.task.set('snoozedUntil', date);
            this.task.save();
        },
        setThreeDays: function() {
            var date = Moment().add(3, 'days').hours(8).minutes(0).seconds(0);
            this.task.set('snoozedUntil', date);
            this.task.save();
        },
        setNextWeek: function() {
            var date = Moment().add(1, 'weeks').startOf('week').hours(8).minutes(0).seconds(0);
            this.task.set('snoozedUntil', date);
            this.task.save();
        },
        setTwoWeeks: function() {
            var date = Moment().add(2, 'weeks').startOf('week').hours(8).minutes(0).seconds(0);
            this.task.set('snoozedUntil', date);
            this.task.save();
        },
        setFourWeeks: function() {
            var date = Moment().add(4, 'weeks').startOf('week').hours(8).minutes(0).seconds(0);
            this.task.set('snoozedUntil', date);
            this.task.save();
        },
        setCustom: function() {
            var date = $('#snoozeDateTimePicker').data("DateTimePicker").date();
            this.task.set('snoozedUntil', date);
            this.task.save();
        },
        unsnooze: function() {
            this.task.unset('snoozedUntil');
            this.task.save();
        }
    });
});

