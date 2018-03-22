/**
 * AngularJS Tutorial 1
 * @author Nick Kaye <nick.c.kaye@gmail.com>
 */

/**
 * Main AngularJS Web Application
 */


/**
 * Configure the Routes
 */

if (typeof Storage !== "undefined") {
    var app = angular.module('mTrainer', ['ngRoute', 'angularModalService', 'LocalStorageModule', 'luegg.directives', 'angular-growl', 'ngSanitize', 'ngAnimate', 'ngCookies', 'oitozero.ngSweetAlert', 'ngLodash']);
} else {
    alert("Please update your Browser for Using this website")
}


app.config(['$routeProvider', function($routeProvider) {
    $routeProvider
        .when("/home", {
            templateUrl: "public/src/partials/home.html",
            controller: "SortCtrl"
        })
        /* .when("/intents", {
  templateUrl: "public/src/partials/intents.html",
  controller: "intentsCtrl"
})
.when("/entities", {
templateUrl: "public/src/partials/Entities.html",
controller: "entitiesCtrl"
})
.when("/summary", {
templateUrl: "public/src/partials/summary.html",
controller: "summaryCtrl"
})
.when("/pubish&Train", {
templateUrl: "public/src/partials/publish&Train.html",
controller: "publishTrainCtrl"
})
.when("/dashboard", {
templateUrl: "public/src/partials/dashboard.html",
controller: "dashboardCtrl"
})*/
        .when("/botcontents", {
            templateUrl: "public/src/partials/botContents.html",
            controller: "botContentsCtrl"
        })
        .when("/", {
            templateUrl: "public/src/partials/home.html",
            controller: "SortCtrl"
        })
        .when("/login", {
            templateUrl: "public/src/partials/login.html",
            controller: "loginContentsCtrl"
        })
        /*.when("/userProfile", { Removed after the requirement is clear
        templateUrl: "public/src/partials/userProfile.html",
        controller: "userProfileCtrl"
        })
        .when("/settings", {
        templateUrl: "public/src/partials/settings.html",
        controller: "settingsCtrl"
        })*/

        // else 404
        .otherwise({
            templateUrl: "public/src/partials/home.html",
            controller: "SortCtrl"
        })

}]);

app.config(function(localStorageServiceProvider) { // configuration for accessing the browser session Storage
    localStorageServiceProvider
        .setPrefix('app')
        .setStorageType('sessionStorage')
        .setNotify(true, true)
});

app.config(['growlProvider', function(growlProvider) { // configuration for Growl(Angular Notifications)
    growlProvider.globalTimeToLive(3000);
}]);

app.config(['growlProvider', function(growlProvider) { // configuration for Growl accepting the HTML code in it.(Angular Notifications)
    growlProvider.globalEnableHtml(true);
}]);


app.run(function() {
    /*Logic For Intents Accordion*/
    $(document).on('click', '.toggle', function(e) {
        e.preventDefault();
        //event.stopPropagation();
        var $this = $(this);

        if ($this.next().hasClass('show')) {
            $this.next().removeClass('show');
            $this.next().slideUp(500);
        } else {

            $this.parent().parent().find('li .inner').slideUp(500);
            $this.next().slideToggle(500);
            $this.parent().parent().find('li .inner').removeClass('show');
            $this.next().toggleClass('show');
        }
    });

});
