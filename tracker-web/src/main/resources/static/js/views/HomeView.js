define(function(require) {
    var Backbone = require('backbone');
    var Handlebars = require('handlebars');
    var ActiveTasksView = require('js/views/ActiveTasksView');
    var ReportsView= require('js/views/ReportsView');
    var HelpView= require('js/views/HelpView');

    return Backbone.View.extend({

        events: {
            "click #homeBtn": "showActiveTasksView",
            "click #activeTasksBtn": "showActiveTasksView",
            "click #reportsBtn": "showReportsView",
            "click #helpBtn": "showHelpView"
        },
        initialize: function() {
            $(window).on("keyup", this.checkKeyup.bind(this)); // register key handler
        },
        render: function() {
            var template = Handlebars.getTemplate('home');
            var html = template({
            });
            this.$el.html(html);

            this.showActiveTasksView();
        },
        showActiveTasksView: function() {
            this.closeCurrentView();
            this.$(".nav").find(".active").removeClass("active");
            this.$('#activeTasksBtn').parent().addClass("active");

            var view = new ActiveTasksView();
            this.$("#homeContent").html(view.el);
            this.currentView = view;
        },
        showReportsView: function() {
            this.closeCurrentView();
            this.$(".nav").find(".active").removeClass("active");
            this.$('#reportsBtn').parent().addClass("active");

            var view = new ReportsView();
            this.$("#homeContent").html(view.el);
            this.currentView = view;
            view.render();
        },
        showHelpView: function() {
            this.closeCurrentView();
            this.$(".nav").find(".active").removeClass("active");
            this.$('#helpBtn').parent().addClass("active");

            var view = new HelpView();
            this.$("#homeContent").html(view.el);
            this.currentView = view;
            view.render();
        },
        checkKeyup: function(e) {
            if (e.ctrlKey && e.altKey) {
                switch(e.keyCode) {
                    case 49: // '1' Opens Active Tasks View
                        this.showActiveTasksView();
                        break;
                    case 50: // '2' Opens Reports View
                        this.showReportsView();
                        break;
                    case 51: // '3' Opens Help View
                        this.showHelpView();
                        break;
                }
            }
            if (this.currentView.checkKeyup) {
                this.currentView.checkKeyup(e);
            }
        },
        closeCurrentView: function() {
            if (this.currentView) {
                this.currentView.close();
            }
        }
    });
});
