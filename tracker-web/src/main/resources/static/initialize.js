requirejs.config({
    baseUrl: '',
    paths: {
        jquery: 'libs/jquery-3.1.1.min',
        underscore: 'libs/underscore.min',
        backbone: 'libs/backbone.min',
        handlebars: 'libs/handlebars',
        bootstrap: 'libs/bootstrap.min',
        bootstrapSelect: 'libs/bootstrap-select.min',
        sortable: 'libs/sortable.min',
        moment: 'libs/moment',
        'bootstrap-datetimepicker': 'libs/bootstrap-datetimepicker.min',
        chosen: 'libs/chosen.jquery.min',
        later: 'libs/later.min',
        "datatables.net": 'libs/DataTables/DataTables-1.10.13/js/jquery.dataTables.min',
        bootstrapDataTables: 'libs/DataTables/DataTables-1.10.13/js/dataTables.bootstrap.min',
        sweetAlert: 'libs/sweetalert.min',
        commonmark: 'libs/commonmark'
    },
    shim: {
        'backbone': {
            deps: ['underscore', 'jquery'],
            exports: 'Backbone'
        },
        'underscore': {
            exports: '_'
        },
        'jquery': {
            exports: '$'
        },
        'handlebars': {
            exports: 'Handlebars'
        },
        'bootstrap': {
            deps: ['jquery']
        },
        'boostrapSelect': {
            deps: ['bootstrap']
        },
        'sortable': {
            deps: ['jquery'],
            exports: 'sortable'
        },
        'bootstrap-datetimepicker': {
            deps: ['jquery', 'bootstrap', 'moment']
        },
        'chosen': {
            deps: ['jquery']
        },
        'bootstrapDataTables': {
            deps: ['datatables.net']
        }
    }
});

// load the main libraries into the global namespace and kick off main.js
require(['js/main', 'jquery', 'underscore', 'backbone', 'handlebars', 'bootstrap'], function(main) {
    new main();
});