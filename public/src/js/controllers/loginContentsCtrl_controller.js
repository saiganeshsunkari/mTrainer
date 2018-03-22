//Controller for the page below the header when the user is in the login / Register page
app.controller('loginContentsCtrl', ['$scope', '$location', 'botFactory', 'localStorageService', 'userService', '$rootScope', function($scope, $location, botFactory, localStorageService, userService, $rootScope) {

    // Get Header Height //
    var sticks = $('.top-bar').height();
    $('.panel-content').css({
        "margin-top": sticks // -8
    });
    var setLoginPage = function() {
        if (window.innerWidth >= 1590) {
            $('.main-content').css({
                "padding": 30
            });
        } else {
            $('.main-content').css({
                "padding": "30px 30px 30px 276px"
            });
        }
    };
    setLoginPage();
    $(window).resize(function() {
        setLoginPage();
    });
    $rootScope.$broadcast('onLoginScreen');
    //broadcast this message when user is on the login page. $on(homeCtrl) listens to this message and works accoringly

}]);
