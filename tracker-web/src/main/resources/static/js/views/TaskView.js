define(function(require) {
    var Backbone = require('backbone');
    var Handlebars = require('handlebars');
    var Utils = require('js/utils');
    var SnoozeView = require('js/views/SnoozeView');
    var Moment = require('moment');

    return Backbone.View.extend({

        initialize: function(options) {
            this.tasks = options.tasks;
            this.task = options.task;
            this.selected = false;
            this.listenTo(this.task, 'sync', this.render);
            this.render();
        },
        events: {
            "dblclick .taskSummarySpan": "editSummary",
            "keyup .taskSummaryInput": "onKeyupSummary",
            "blur .taskSummaryInput": "saveSummary",
            "click .waitingBtn": "toggleWaiting",
            "click .startedBtn": "toggleStarted",
            "click .doneBtn": "toggleDone",
            "click .snoozeBtn": "snooze",
            "click .task-card": "unsnoozeCheck"
        },
        render: function() {
            var template = Handlebars.getTemplate('task');
            var html = template({
                id: this.task.get('id'),
                selected: this.selected,
                summary: this.task.get('summary'),
                tags: this.task.get('tagsList'),
                status: this.task.get('status'),
                recurrenceSchedule: this.task.get('recurrenceSchedule'),
                snoozedUntil: Moment(this.task.get('snoozedUntil')).fromNow(),
                dueSoon: this.task.isDueSoon(),
                overdue: this.task.isOverdue(),
                snoozed: this.task.isSnoozed(),
                unsnoozed: this.task.isUnsnoozed()
            });
            this.$el.html(html);
            this.$(".taskSummaryInput").hide(); // initially hidden

            // setup snooze popover
            var snoozeView = new SnoozeView({
                task: this.task
            });
            this.$('.snoozeBtn').popover({
                animation: false,
                html: true,
                content: snoozeView.$el
            }).on('shown.bs.popover', function() {
                snoozeView.render();
            });
        },
        onKeyupSummary: function(e) {
            if (e.keyCode == 13) {
//                this.saveSummary();
                this.$(".taskSummaryInput").blur();
            }
        },
        editSummary: function() {
            this.$(".taskSummarySpan").hide();
            this.$(".taskSummaryInput").val(this.task.get('summary'));
            this.$(".taskSummaryInput").show();
            this.$(".taskSummaryInput").focus();
            this.$(".taskSummaryInput").select();
        },
        saveSummary: function() {
            var newSummaryText = this.$(".taskSummaryInput").val();
            this.task.set('summary', newSummaryText);
            this.task.save();

            this.$(".taskSummaryInput").hide();
            this.$(".taskSummarySpan").text(this.task.get('summary'));
            this.$(".taskSummarySpan").show();
            this.$(".task-card").focus();
        },
        toggleWaiting: function() {
            var status = this.task.get('status');
            if (status == 'WAITING') {
                this.task.set('status', 'READY');
                this.task.unset('completedDateTime');
            } else {
                this.task.set('status', 'WAITING');
                this.task.unset('completedDateTime');
            }
            this.task.save();
        },
        toggleStarted: function() {
            var status = this.task.get('status');
            if (status == 'STARTED') {
                this.task.set('status', 'READY');
                this.task.unset('completedDateTime');
            } else {
                this.task.set('status', 'STARTED');
                this.task.unset('completedDateTime');
            }
            this.task.save();
        },
        toggleDone: function() {
            var status = this.task.get('status');
            if (status == 'DONE') {
                this.task.set('status', 'READY');
                this.task.unset('completedDateTime');
            } else {
                this.task.set('status', 'DONE');
                this.task.set('completedDateTime', new Date());
                this.createTaskRecurrence();
            }
            this.task.save();
        },
        snooze: function() {
            this.$(".snoozeBtn").focus(); // will prompt popover to appear
        },
        /* if unsnoozed then unset snoozedUntil property */
        unsnoozeCheck: function() {
            if (this.task.isUnsnoozed()) {
                this.task.unset('snoozedUntil');
                this.task.save();
            }
        },
        select() {
            this.selected = true;
            this.$(".task-card").addClass("selected");
        },
        unselect() {
            this.selected = false;
            this.$(".task-card").removeClass("selected");
        },
        /*
            Create task based on recurrenceSchedule (if present)
            This task will be automatically snoozed until the time of the schedule.
        */
        createTaskRecurrence: function() {
            var cron = this.task.get("recurrenceSchedule");
            if (cron) {
                var schedule = later.parse.cron(cron);
                var snoozedUntil = later.schedule(schedule).next(1);

                var newTask = this.task.clone();
                delete newTask.id;
                newTask.unset('id');
                newTask.unset('dueDate');
                newTask.unset('createdDateTime');
                newTask.unset('modifiedDateTime');
                newTask.unset('completedDateTime');
                newTask.set('status', "READY");
                newTask.set('threeThings', false);
                newTask.set('snoozedUntil', snoozedUntil);

                newTask.save({}, {
                    success: function(model) {
                        this.tasks.add(model);
                    }.bind(this)
                });
            }
        }
    });
});

