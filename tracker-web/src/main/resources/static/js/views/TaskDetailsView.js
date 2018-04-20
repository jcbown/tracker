define(function(require) {
    var Backbone = require('backbone');
    var Handlebars = require('handlebars');
    var Moment = require('moment');
    var Utils = require('js/utils');
    var Chosen = require('chosen');
    var Later = require('later');
    var SweetAlert = require('sweetAlert');
    var CommonMark = require('commonmark');

    return Backbone.View.extend({

        initialize: function(options) {
            this.tasks = options.tasks;
            this.task = options.task;
            later.date.localTime(); // set later to calculate occurrences using localtime
        },
        events: {
            "change #tags": "saveTask",
            "blur #dueDate": "saveTask",
            "click #saveNotesBtn": "saveTask",
            'change input:checkbox[name="reportingLevel"]': "saveTask",
            "blur #recurrenceSchedule": "saveTask",
            "click #recurrencesBtn": "showNextRecurrences",
            "click #deleteBtn": "deleteTask"
        },
        render: function() {
            // prepare tasks object
            var tagDetails = [];
            _.each(this.tasks.getTags(), function(tag) {
                tagDetails.push({
                    name: tag,
                    selected: this.task.has('tagsList') ? _.contains(this.task.get('tagsList'), tag) : false
                });
            }.bind(this));

            var modifiedDateTime = this.task.get('modifiedDateTime');
            var completedDateTime = this.task.get('completedDateTime');

            // convert notes markdown to html
            var mdHtml;
            if (this.task.get('notes')) {
                var reader = new CommonMark.Parser();
                var writer = new CommonMark.HtmlRenderer();
                var parsed = reader.parse(this.task.get('notes')); // parsed is a 'Node' abstract syntax tree
                mdHtml = writer.render(parsed);
            }

            var template = Handlebars.getTemplate('taskDetailsPanel');
            var html = template({
                createdDateTime: Moment(this.task.get('createdDateTime')).format("ddd Do MMM YYYY HH:mm:ss"),
                modifiedDateTime: modifiedDateTime ? Moment(modifiedDateTime).format("ddd Do MMM YYYY HH:mm:ss") : null,
                completedDateTime: completedDateTime ? Moment(this.task.get('completedDateTime')).format("ddd Do MMM YYYY HH:mm:ss") : null,
                createdDateTimeFriendly: Moment(this.task.get('createdDateTime')).fromNow(),
                modifiedDateTimeFriendly: modifiedDateTime ? Moment(this.task.get('modifiedDateTime')).fromNow() : null,
                completedDateTimeFriendly: completedDateTime ? Moment(this.task.get('completedDateTime')).fromNow() : null,
                dueDate: this.task.has('dueDate') ? Moment(this.task.get('dueDate')).format("YYYY-MM-DD") : null,
                reportingLevel: this.task.get('reportingLevel'),
                tagDetails: tagDetails,
                notes: this.task.get('notes'),
                notesMarkdown: mdHtml,
                recurrenceSchedule: this.task.get('recurrenceSchedule')

            });
            this.$el.html(html);

            // initialise tags input
            this.$("#tags").chosen({
                width: '100%'
            });

            // allow adding new tags to the list
            this.$(".chosen-container").on('keyup',function(event) {
                var enteredText = $(event.target).val();
                if(event.which === 13 && enteredText && enteredText != "" && enteredText != 'notag' && enteredText.indexOf(",") < 0) { //enter key and not the special value
                    $("#tags").append('<option value="' + enteredText + '" selected="selected">' + enteredText + '</option>');
                    $("#tags").trigger('chosen:updated');
                    $("#tags").trigger('change');
                }
            });

            // initialise datetimepicker
            var dueDate = this.task.get('dueDate');
            var $dueDate = this.$('#dueDate');
            $dueDate.datetimepicker({
                showClear: true
            }).on("dp.show", function(){
                if (!dueDate) {
                    var defaultDate = Moment().hours(8).minutes(0).seconds(0).toDate();
                    $dueDate.data('DateTimePicker').date(defaultDate);
                }
            });
            if (dueDate) {
                $dueDate.data('DateTimePicker').date(new Date(dueDate));
            }
            this.$("#dueDate").data("DateTimePicker").format("ddd Do MMM YYYY HH:mm");

            this.$('#notes').keydown(function (e) {
                // listen to Ctrl+Enter to save notes
                if (e.ctrlKey && e.keyCode == 13) {
                    this.saveTask();
                }
                // prevent tab key from leaving notes textarea
                if (e.keyCode == 9) {
                    e.preventDefault();
                }
                // Esc key should leave text area without saving
                if (e.keyCode == 27) {
                    this.render();
                }
            }.bind(this));
        },
        toggleFirstReportingLevel: function() {
            var $checkbox = this.$('input:checkbox[name="reportingLevel"][value="level10"]');
            this.toggleCheckbox($checkbox);
        },
        toggleSecondReportingLevel: function() {
            var $checkbox = this.$('input:checkbox[name="reportingLevel"][value="level20"]');
            this.toggleCheckbox($checkbox);
        },
        toggleThirdReportingLevel: function() {
            var $checkbox = this.$('input:checkbox[name="reportingLevel"][value="level30"]');
            this.toggleCheckbox($checkbox);
        },
        toggleCheckbox: function($checkbox) {
            $checkbox.prop('checked', !$checkbox.prop('checked'));
            this.saveTask();
        },
        focusNotes: function() {
            this.$("#collapseNotes").collapse('show');
            this.$("#notes").focus();
            // place cursor at end
            var len = this.$("#notes").val().length * 2; // * 2 has no harm
            this.$("#notes")[0].setSelectionRange(len, len);
        },
        focusTags: function() {
            this.$(".chosen-container input").focus();
        },
        showNextRecurrences: function() {
            var cron = this.task.get("recurrenceSchedule");
            if (cron) {
                var schedule = later.parse.cron(cron);
                var nexts = later.schedule(schedule).next(10);
                var msg = "";
                for (var i in nexts) {
                    msg += nexts[i] + "\n"
                }
                swal("Next occurences of this schedule", msg);
            }
        },
        saveTask: function() {
            this.task.set('dueDate', this.$("#dueDate").data("DateTimePicker").date());
            this.task.set('tagsList', this.$("#tags").val());
            this.task.set('notes', this.$("#notes").val());
            this.task.set('recurrenceSchedule', this.$('#recurrenceSchedule').val());
            this.task.set('reportingLevel', {
                level10 : this.$('input:checkbox[name="reportingLevel"][value="level10"]').is(":checked"),
                level20 : this.$('input:checkbox[name="reportingLevel"][value="level20"]').is(":checked"),
                level30 : this.$('input:checkbox[name="reportingLevel"][value="level30"]').is(":checked"),
            });
            this.task.save();
        },
        deleteTask: function() {
            swal({
              title: "Delete this task?",
              text: this.task.get("summary") + "\n\nThis will delete any future occurrences of a recurring task.",
              type: "warning",
              showCancelButton: true,
              confirmButtonColor: "#DD6B55",
              confirmButtonText: "Yes, delete it!",
              closeOnConfirm: false
            },
            function(){
                this.task.destroy();
                swal("Deleted!", "Your task has been deleted.", "success");
            }.bind(this));
        }
    });
});

