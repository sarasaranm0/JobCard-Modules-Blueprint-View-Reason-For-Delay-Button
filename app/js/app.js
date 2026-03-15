var pageLoad = null;

// Create Angular app
var app = angular.module('zohoWidgetApp', []);

// Zoho Init
ZOHO.embeddedApp.on("PageLoad", function (data) {

    pageLoad = data;

    // Bootstrap Angular after Zoho loads
    angular.bootstrap(document.getElementById("app"), ['zohoWidgetApp']);
});

ZOHO.embeddedApp.init();
