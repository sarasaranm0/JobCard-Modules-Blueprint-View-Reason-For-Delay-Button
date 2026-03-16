var pageLoad = null;

// Create Angular app
var app = angular.module('zohoWidgetApp', []);

// Zoho Init
ZOHO.embeddedApp.on("PageLoad", function (data) {

    pageLoad = data;

    // Bootstrap Angular after Zoho loads
    angular.bootstrap(document.getElementById("app"), ['zohoWidgetApp']);
});

function formatZohoDateTime(date) {

    let y = date.getFullYear();
    let m = String(date.getMonth() + 1).padStart(2, '0');
    let d = String(date.getDate()).padStart(2, '0');
    let h = String(date.getHours()).padStart(2, '0');
    let min = String(date.getMinutes()).padStart(2, '0');
    let s = "00";

    return `${y}-${m}-${d}T${h}:${min}:${s}+05:30`;
}
ZOHO.embeddedApp.init();
