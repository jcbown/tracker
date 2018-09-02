define(function(require) {
    var Backbone = require('backbone');
    var Handlebars = require('handlebars');
    var BootstrapSelect = require('bootstrapSelect');
    var Sortable = require('sortable');
    var Moment = require('moment');
    var Utils = require('js/utils');
    var SweetAlert = require('sweetAlert');

    var Tasks = require('js/collections/tasks');
    var Task = require('js/models/task');
    var TaskView = require('js/views/TaskView');
    var TaskDetailsView = require('js/views/TaskDetailsView');

    return Backbone.View.extend({

        events: {
            "click #createTaskBtn": "createTask",
            "sortupdate .sortableTaskList": "onGridPositionChange",
            "keyup #searchFilter": "renderTasks",
            "change #statusFilter": "renderTasks",
            "change #tagsFilter": "renderTasks",
            "click #snoozedFilter": "renderTasks",
            "mousedown #taskGridContainer .task-card": "onClickTask",
            "click .threeThingsBtn": "unsetThreeThings"
        },
        initialize: function() {
            this.tasks = new Tasks();
            this.listenToOnce(this.tasks, 'sync', this.render); // necessary to kick things off including populating tags dropdown
            this.listenTo(this.tasks, 'sync', this.onSync);
            this.listenTo(this.tasks, 'destroy', this.render);
            var completedAfterDate = Moment().subtract(7, 'days').startOf('day').toDate();
            this.tasks.fetch({data: {completedAfter: completedAfterDate.valueOf()}});
        },
        render: function() {
            var template = Handlebars.getTemplate('activeTasks');
            var html = template({
                showCleanupWarning: this.tasks.length > 20,
                tags: this.tasks.getTags()
            });
            this.$el.html(html);

            // initialise dropdowns
            this.$('.selectpicker').selectpicker();

            // add tasks to grid
            this.renderTasks();
        },
        renderTasks: function() {
            var template = Handlebars.getTemplate('taskGrid');
            var html = template({});
            this.$("#taskGridContainer").html(html);

            // navigateGrid is a temporary object we will use to determine the next/prev order of the tasks
            // the key identifies the grid list and the value is an array of the tasks in that list
            // we will alphabetically sort the keys and concatenate the arrays together to form an ordered list of tasks
            // then we can set the predecessor and successor properties of each task for use in navigation
            var navigateGrid = {};

            var filteredTasks = this.filterTasks();
            _.forEach(filteredTasks, function(task) {
                var taskView = new TaskView({
                    tasks: this.tasks,
                    task: task
                });
                task.view = taskView;

                var urgency = task.get('urgency');
                var value = task.get('value');
                this.getGridList(urgency, value).append($("<li></li>").append(taskView.el));

                // add to sortGrid
                var navigateGridKey = "urgency-" + urgency + "-value-" + value;
                if (!navigateGrid[navigateGridKey]) {
                    navigateGrid[navigateGridKey] = [];
                }
                navigateGrid[navigateGridKey].push(task);
            }.bind(this));

            // set predecessor and successor fields (used for next/prev)
            var keys = Object.keys(navigateGrid).sort();
            var orderedTaskArray = [];
            for (var i in keys) {
                var tasks = navigateGrid[keys[i]];
                orderedTaskArray = orderedTaskArray.concat(tasks);
            }
            var predecessor = null;
            delete this.firstTaskId;
            delete this.lastTaskId;
            for (var j in orderedTaskArray) {
                 var task = orderedTaskArray[j];
                 delete task.predecessorId;
                 delete task.successorId;

                 if (j == 0) {
                    this.firstTaskId = task.id;
                 }
                 if (j == orderedTaskArray.length - 1) {
                    this.lastTaskId = task.id;
                 }

                 if (predecessor) {
                    task.predecessorId = predecessor.id;
                    predecessor.successorId = task.id;
                 }
                 predecessor = task;
            }

            // initialise drag and drop
            Sortable('.sortableTaskList', {
                handle: '.task-card',
                connectWith: 'tasks-connected',
                forcePlaceholderSize: true
            });
            this.$(".sortableTaskList").first().on('sortupdate', this.onGridPositionChange.bind(this)); // only need to listen to one list

            // select task
            if (this.tasks.length !== 0) {
                this.selectLastSelectedTask();
            }

            // render three things
            this.$("#threeThingsContainer").empty();
            var threeThingsTasks = this.tasks.where({threeThings: true});
            if (threeThingsTasks.length == 0) {
                this.$("#threeThingsContainer").html("None Selected");
            }
            _.each(threeThingsTasks, function(task) {
                var view = new TaskView({
                    tasks: this.tasks,
                    task: task
                });
                this.$("#threeThingsContainer").append(view.el);
                this.$(view.el).append("<a class='threeThingsBtn' data-task-id='" + task.id + "' href='javascript:void(0)'>&times;</a>");
            }.bind(this));
        },
        filterTasks: function() {
            var searchValue = this.$("#searchFilter").val();
            var statuses = this.$("#statusFilter").val();
            var tags = this.$("#tagsFilter").val();
            var showSnoozed = this.$("#snoozedFilter").is(':checked');

            var filteredTasks = this.tasks.models;
            filteredTasks = _.filter(filteredTasks, function(task) { // apply search
                return task.search(searchValue);
            });
            filteredTasks = _.filter(filteredTasks, function(task) { // status filtering
                var taskStatus = task.get('status');
                for (var i in statuses) {
                    if (taskStatus == statuses[i]) return true;
                }
                return false;
            });
            filteredTasks = _.filter(filteredTasks, function(task) { // tags filtering
                if (tags.length ==0) return true; // if nothing selected - show all tasks
                if (_.contains(tags, 'notag') && (!task.has('tagsList') || task.get('tagsList').length == 0)) return true; // show task in the case that 'None' is selected and there are no tasks
                var taskTags = task.get('tagsList');
                return _.some(taskTags, function(taskTag) {
                    return _.contains(tags, taskTag);
                });
            });
            filteredTasks = _.filter(filteredTasks, function(task) { // snooze filtering
                return showSnoozed || !task.isSnoozed();
            });
            return filteredTasks;
        },
        renderTaskDetails: function(taskId) {
            var task = this.tasks.get(taskId);
            this.taskDetailsView = new TaskDetailsView({
                tasks: this.tasks,
                task: task
            });
            this.$("#taskDetailsContainer").html(this.taskDetailsView.el);
            this.taskDetailsView.render();
        },
        createTask: function() {
            var task = new Task({
                summary: "<task description>",
                status: "READY",
                urgency: 1,
                value: 1,
                threeThings: false,
                reportingLevel: {
                    level10: true,
                    level20: false,
                    level30: false
                }
            });
            task.save({}, {
                createdTask: task,
                success: function(model) {
                    this.tasks.add(model);
                }.bind(this)
            });
        },
        onSync: function(collectionOrModel, response, options) {
            this.renderTasks();
            // check if new task has been created
            if (options && options.createdTask) {
                this.selectFirstTask();
                options.createdTask.view.editSummary();
            }
        },
        checkKeyup: function(e) {
            // check that the user is not filling in a form
            var domTag = e.target.tagName.toLowerCase();
            if (domTag != 'input' && domTag != 'textarea' && !e.ctrlKey) {
                switch(e.keyCode) {
                    case 67: // 'c' creates a new task
                        this.createTask();
                        break;
                    case 69: // 'e' edits a task summary
                        var id = this.$('.task-card.selected').data('task-id');
                        if (id) {
                            this.tasks.get(id).view.editSummary();
                        }
                        break;
                    case 70: // 'f' adds a quick follow-up task
                        this.addFollowUpTask();
                        break;
                    case 73: // 'i' marks a task as started
                        var id = this.$('.task-card.selected').data('task-id');
                        if (id) {
                            this.tasks.get(id).view.toggleStarted();
                        }
                        break;
                    case 74: // 'j' moves down the task list
                        this.selectNextTask();
                        break;
                    case 75: // 'k' moves up the task list
                        this.selectPreviousTask();
                        break;
                    case 78: // 'n' focuses on the notes for a task
                        this.taskDetailsView.focusNotes();
                        break;
                    case 80: // 'p' toggles as three things
                        var id = this.$('.task-card.selected').data('task-id');
                        if (id) {
                            this.toggleThreeThings(id);
                        }
                        break;
                    case 83: // 's' snoozes a task
                        var id = this.$('.task-card.selected').data('task-id');
                        if (id) {
                            this.tasks.get(id).view.snooze();
                        }
                        break;
                     case 84: // 't' focuses on the tags for a task
                        this.taskDetailsView.focusTags();
                        break;
                    case 87: // 'w' marks a task as waiting
                        var id = this.$('.task-card.selected').data('task-id');
                        if (id) {
                            this.tasks.get(id).view.toggleWaiting();
                        }
                        break;
                    case 89: // 'y' marks a task as done
                        var id = this.$('.task-card.selected').data('task-id');
                        if (id) {
                            this.tasks.get(id).view.toggleDone();
                        }
                        break;
                    case 36: // 'home' selects first task
                        this.selectFirstTask();
                        break;
                    case 35: // 'end' selects last task
                        this.selectLastTask();
                        break;
                    case 46: // 'delete' deletes the selected task
                        if (this.taskDetailsView) {
                            this.taskDetailsView.deleteTask();
                        }
                        break;
                    case 38: // 'up' moves task in grid
                        this.moveTaskUp();
                        break;
                    case 40: // 'down' moves task in grid
                        this.moveTaskDown();
                        break;
                    case 37: // 'left' moves task in grid
                        this.moveTaskLeft();
                        break;
                    case 39: // 'right' moves task in grid
                        this.moveTaskRight();
                        break;
                    case 191: // '/' focuses on search box
                        this.focusSearch();
                        break;
                    case 49: // '1' toggles first reporting level
                        this.taskDetailsView.toggleFirstReportingLevel();
                        break;
                    case 50: // '2' toggles second reporting level
                        this.taskDetailsView.toggleSecondReportingLevel();
                        break;
                    case 51: // '3' toggles third reporting level
                        this.taskDetailsView.toggleThirdReportingLevel();
                        break;
                }
            } else if (e.target.id == "searchFilter" && (e.keyCode == 13 || e.keyCode == 27)) { // enter or esc key
                this.$("#searchFilter").blur();
            }
        },
        changeGridPosition: function(taskId, urgency, value) {
            // save new grid position
            var task = this.tasks.get(taskId);
            task.set('urgency', urgency);
            task.set('value', value);
            task.save();
        },
        onGridPositionChange: function(e) {
            // find new grid position
            // e.detail.item); is the li element
            var $td = this.$(e.detail.item).closest("td"); // find the td containing this element
            var urgency = $td.index() + 1;
            var value = $td.closest('tr').index() + 1;

            // save new grid position
            var id = this.$(e.detail.item).find(".task-card").data("task-id");
            this.changeGridPosition(id, urgency, value);
        },
        moveTaskUp: function() {
            var task = this.tasks.get(this.selectedTaskId);
            var urgency = task.get('urgency');
            var value = task.get('value');
            if (task.get('value') > 1) {
                this.changeGridPosition(this.selectedTaskId, urgency, --value);
            }
        },
        moveTaskDown: function() {
            var task = this.tasks.get(this.selectedTaskId);
            var urgency = task.get('urgency');
            var value = task.get('value');
            if (task.get('value') < 4) {
                this.changeGridPosition(this.selectedTaskId, urgency, ++value);
            }
        },
        moveTaskLeft: function() {
            var task = this.tasks.get(this.selectedTaskId);
            var urgency = task.get('urgency');
            var value = task.get('value');
            if (task.get('urgency') > 1) {
                this.changeGridPosition(this.selectedTaskId, --urgency, value);
            }
        },
        moveTaskRight: function() {
            var task = this.tasks.get(this.selectedTaskId);
            var urgency = task.get('urgency');
            var value = task.get('value');
            if (task.get('urgency') < 4) {
                this.changeGridPosition(this.selectedTaskId, ++urgency, value);
            }
        },
        /* returns a jquery object representing the sortableList tasks are placed in */
        getGridList: function(urgency, value) {
            return this.$("#tableGrid tbody")
                .find("tr:nth-child(" + value + ")")
                .find("td:nth-child(" + urgency + ")")
                .find(".sortableTaskList");
        },
        onClickTask: function(e) {
            this.selectTask(this.$(e.currentTarget));
        },
        selectTask: function($taskElement) {
            // unselect all first
            this.tasks.each(function(task) {
                if (task.view) task.view.unselect();
            });
            // select clicked
            var id = $taskElement.data("task-id");
            this.tasks.get(id).view.select();
            if (!Utils.isElementInViewport($taskElement)) {
                $taskElement[0].scrollIntoView(false);
            }

            this.renderTaskDetails(id);

            this.selectedTaskId = id;
        },
        selectFirstTask: function() {
            if (this.firstTaskId) {
                var $taskEl = this.$("#taskGridContainer .task-card[data-task-id='" + this.firstTaskId + "']");
                this.selectTask($taskEl);
            }
        },
        selectLastTask: function() {
            if (this.lastTaskId) {
                var $taskEl = this.$("#taskGridContainer .task-card[data-task-id='" + this.lastTaskId + "']");
                this.selectTask($taskEl);
            }
        },
        selectNextTask: function() {
            var task = this.tasks.get(this.selectedTaskId);
            var id = task.successorId;
            if (id) {
                var $taskEl = this.$("#taskGridContainer .task-card[data-task-id='" + id + "']");
                this.selectTask($taskEl);
            }
        },
        selectPreviousTask: function() {
            var task = this.tasks.get(this.selectedTaskId);
            var id = task.predecessorId;
            if (id) {
                var $taskEl = this.$("#taskGridContainer .task-card[data-task-id='" + id + "']");
                this.selectTask($taskEl);
            }
        },
        // if there was a previously selected task, select it if possible
        selectLastSelectedTask: function() {
            if (this.selectedTaskId) {
                var selector = "#taskGridContainer .task-card[data-task-id='" + this.selectedTaskId + "']";
                if (this.$(selector).length) {
                    this.selectTask(this.$(selector));
                } else {
                    this.selectFirstTask();
                }
            } else {
                this.selectFirstTask();
            }
        },
        toggleThreeThings: function(id) {
            var task = this.tasks.get(id);
            if (task.get('threeThings') == true) {
                task.set('threeThings', false);
            } else {
                task.set('threeThings', true);
            }
            task.save();
        },
        addFollowUpTask: function() {
            swal(
                {
                    title: "Quick Follow-Up Task",
                    text: "Enter the summary for a new follow-up task. This will be snoozed until tomorrow morning.",
                    type: "input",
                    showCancelButton: true,
                    closeOnConfirm: false,
                    animation: "slide-from-top",
                    inputPlaceholder: "<task description>"
                },
                function(inputValue){
                    if (inputValue === false || inputValue == "") {
                        swal.showInputError("You need to provide a task summary.");
                    } else {
                        // create task
                        var task = new Task({
                            summary: inputValue,
                            status: "WAITING",
                            urgency: 2,
                            value: 3,
                            threeThings: false,
                            tagsList: ["follow-up"],
                            snoozedUntil: Moment().add(1, 'day').hours(8).minutes(0).seconds(0)
                        });
                        task.save({}, {
                            success: function(model) {
                                this.tasks.add(model);
                            }.bind(this)
                        });
                        swal.close();
                    }
                }.bind(this)
            );
        },
        unsetThreeThings: function(e) {
            var id = this.$(e.currentTarget).data('task-id');
            this.toggleThreeThings(id);
        },
        focusSearch: function() {
            this.$('#searchFilter').focus();
        },
        close: function() {
            this.remove();
        }
    });
});
