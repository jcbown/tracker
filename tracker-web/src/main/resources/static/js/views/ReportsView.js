define(function(require) {
    var Backbone = require('backbone');
    var Handlebars = require('handlebars');
    var Moment = require('moment');
    var DataTables = require('bootstrapDataTables');

    var Tasks = require('js/collections/tasks');
    var Task = require('js/models/task');
    var EditTaskView = require('js/views/EditTaskView');



    return Backbone.View.extend({

        events: {
            "keyup #searchFilter": "renderTasks",
            "change input[name='doneDates']": "fetchTasks",
            "change input[name='reportingLevel']": "renderTasks",
            "change input[name='statuses']": "renderTasks",
            "change input[name='groupBy']": "renderTasks",
            "click .editBtn": "editTask",
            "click #reportAccordionControls .expandAll": "expandAccordion",
            "click #reportAccordionControls .collapseAll": "collapseAccordion"
        },
        initialize: function() {
            this.tasks = new Tasks();
            this.tasks.comparator = function(task) {
                return -task.get("completedDateTime");
            };
            this.listenTo(this.tasks, 'sync', this.renderTasks);
            this.listenTo(this.tasks, 'destroy', this.renderTasks);
            this.render();
            this.fetchTasks();
        },
        render: function() {
            var template = Handlebars.getTemplate('reports');
            var html = template({
            });
            this.$el.html(html);
        },
        renderTasks: function() {
            var tableTemplate = Handlebars.getTemplate('reportTable');

            // we must remove the tasks based on reportingLevel and status
            var tasksToDisplay = new Tasks();
            var statuses = this.$('input[name="statuses"]:checked').map(function () {
                 return this.value;
            }).get();
            this.tasks.forEach(function(task) {
                if (_.contains(statuses, task.get('status'))) {
                    tasksToDisplay.add(task);
                }
            });

            // filter by reporting level
            var reportingLevels = this.$('input[name="reportingLevel"]:checked').map(function() {
                return this.value;
            }).get();
            tasksToDisplay = new Tasks(tasksToDisplay.filter(function(task) {
                var taskReportingLevel = task.get('reportingLevel');
                var addTask = false;
                _.each(reportingLevels, function(lvl) {
                    if (lvl == "none") {
                        if (!taskReportingLevel.level10 && !taskReportingLevel.level20 && !taskReportingLevel.level30) {
                            addTask = true;
                        }
                    } else if (taskReportingLevel[lvl]) {
                        addTask = true;
                    }
                });
                return addTask;
            }));

            tasksToDisplay.forEach(function(task) {
                if (task.get('status') == 'DONE') {
                    task.friendlyCompletedDateTime = Moment(task.get('completedDateTime')).fromNow();
                    task.formattedCompletedDateTime = Moment(task.get('completedDateTime')).format("ddd Do MMM YYYY HH:mm:ss");
                    task.isoCompletedDateTime = Moment(task.get('completedDateTime')).toISOString();
                }
            });

            // filter the tasks by search criteria
            var searchValue = this.$("#searchFilter").val();
            var filteredTasks = tasksToDisplay.models;
            filteredTasks = _.filter(filteredTasks, function(task) { // apply search
                return task.search(searchValue);
            });

            var groupBy = this.$('input[name="groupBy"]:checked').val();
            var html = "Error: no group by category";
            if (groupBy == "doneDate") {
                html = tableTemplate({
                    tasks: filteredTasks
                });
            }
            if (groupBy == "tags") {
                var accordionTemplate = Handlebars.getTemplate("reportAccordion");

                var tasksWithoutTags = [];
                var tasksByTag = {};
                _.each(filteredTasks, function(task) {
                    if (task.has('tagsList') && task.get('tagsList').length > 0) {
                        _.each(task.get('tagsList'), function(tag) {
                            if (!tasksByTag[tag]) {
                                tasksByTag[tag] = [];
                            }
                            tasksByTag[tag].push(task);
                        });
                    } else {
                        tasksWithoutTags.push(task);
                    }
                });

                // now create again but sorted correctly
                var tasksByTagList = [];
                _.each(Object.keys(tasksByTag).sort(), function(tagName) {
                    tasksByTagList.push({
                        tagName: tagName,
                        tasks: tasksByTag[tagName]
                    });
                });
                if (tasksWithoutTags.length > 0) {
                    tasksByTagList.push({
                        tagName: "No Tags",
                        tasks: tasksWithoutTags
                    });
                }

                html = accordionTemplate({
                    tasksByTag: tasksByTagList
                });
            }
            this.$("#reportTable").html(html);
            this.$(".table").DataTable({
                "order": [[ 2, "desc"], [3, "desc"]],
                "columnDefs": [
                    { "orderable": false, "targets": 4 } // don't allow sorting on fifth column
                ],
                "pageLength": 50,
                "lengthMenu": [10, 25, 50, 100, 500]
            });
        },
        fetchTasks: function() {
            var completedAfterVal = this.$('input[name="doneDates"]:checked').val();
            var completedAfterDate;
            switch(completedAfterVal) {
                case 'today':
                    completedAfterDate = Moment().startOf('day').toDate();
                    break;
                case 'last3Days':
                    completedAfterDate = Moment().subtract(3, 'days').startOf('day').toDate();
                    break;
                case 'last7Days':
                    completedAfterDate = Moment().subtract(7, 'days').startOf('day').toDate();
                    break;
                case 'last14Days':
                    completedAfterDate = Moment().subtract(14, 'days').startOf('day').toDate();
                    break;
                case 'last30Days':
                    completedAfterDate = Moment().subtract(30, 'days').startOf('day').toDate();
                    break;
                case 'last90Days':
                    completedAfterDate = Moment().subtract(90, 'days').startOf('day').toDate();
                    break;
                case 'last365Days':
                    completedAfterDate = Moment().subtract(365, 'days').startOf('day').toDate();
                    break;
                case 'all':
                default:
                    completedAfterDate = new Date(0);
                    break;
            }
            this.tasks.fetch({data: {completedAfter: completedAfterDate.valueOf()}});
        },
        editTask: function(e) {
            var id = this.$(e.currentTarget).data('task-id');
            var view = new EditTaskView({
                tasks: this.tasks,
                task: this.tasks.get(id)
            });
            this.$("#editTaskContainer").html(view.el);
            view.render();
        },
        expandAccordion: function() {
            this.$(".collapse").addClass("in");
        },
        collapseAccordion: function() {
            this.$(".collapse").removeClass("in");
        },
        close: function() {
            this.remove();
        }

    });
});
