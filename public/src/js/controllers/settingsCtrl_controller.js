/* removed Settings page
app.controller('settingsCtrl', ['$scope', '$location', 'botFactory', 'reusableFactory', 'localStorageService', '$timeout', '$rootScope', 'growl','userService', function ($scope, $location, botFactory, reusableFactory, localStorageService, $timeout, $rootScope, growl, userService) {
    console.log("Entered settingsCtrl");
    $rootScope.$broadcast('loginSuccess'); // this broadcasts when the user is succefully logged into the app
    userService.checkUserLogin();//check for user login(Change is accordingly when token based auth is defined)
    // Get Header Height //
    var sticks = $('.top-bar').height();
    $('.panel-content').css({
        "margin-top": sticks // -8
    });

}]);*/
