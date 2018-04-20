// Main javascript file
// (loaded by requirejs after it has been initialized)

define(function (require) {
    var Handlebars = require('handlebars');
    var HomeView = require('js/views/HomeView');
    var Utils = require('js/utils');

    return function () {

        // define handlebars getTemplate function
        Handlebars.getTemplate = function (name) {
            if (Handlebars.compiledTemplates === undefined) {
                Handlebars.compiledTemplates = {};
            }
            // check if its already fetched and compiled
            if (!Handlebars.compiledTemplates[name]) {
                $.get({
                    url: 'templates/'+name+'.handlebars',
                    dataType: "text",
                    async: false,
                    success: function(data) {
                        Handlebars.compiledTemplates[name] = Handlebars.compile(data);
                    }
                });
            }
            return Handlebars.compiledTemplates[name];
        }

        // define Handlebars helpers
        // usage {{#ifCond a '==' b}}
        Handlebars.registerHelper('ifCond', function (v1, operator, v2, options) {
            switch (operator) {
                case '==':
                    return (v1 == v2) ? options.fn(this) : options.inverse(this);
                case '===':
                    return (v1 === v2) ? options.fn(this) : options.inverse(this);
                case '!=':
                    return (v1 != v2) ? options.fn(this) : options.inverse(this);
                case '!==':
                    return (v1 !== v2) ? options.fn(this) : options.inverse(this);
                case '<':
                    return (v1 < v2) ? options.fn(this) : options.inverse(this);
                case '<=':
                    return (v1 <= v2) ? options.fn(this) : options.inverse(this);
                case '>':
                    return (v1 > v2) ? options.fn(this) : options.inverse(this);
                case '>=':
                    return (v1 >= v2) ? options.fn(this) : options.inverse(this);
                case '&&':
                    return (v1 && v2) ? options.fn(this) : options.inverse(this);
                case '||':
                    return (v1 || v2) ? options.fn(this) : options.inverse(this);
                default:
                    return options.inverse(this);
            }
        });
        Handlebars.registerHelper('hashCode', function(v1) {
            return Utils.hashCode(v1);
        });

        // wait for document to load
        $(document).ready(function() {

            // load home view
            var view = new HomeView({
                el: "#bodyContent"
            });
            view.render();

        });
    };
});



