// Home Controller for header and NAV
app.controller('headerCtrl', ['$scope', '$location', 'botFactory', 'localStorageService', 'userService', '$timeout', 'userService', function($scope, $location, botFactory, localStorageService, userService, $timeout, userService) {
    console.log("entered the Header Controller");
    userService.checkUserLogin(); //check for user login(Change is accordingly when token based auth is defined)
    $scope.$on('onLoginScreen', function() {
        $scope.loggedIn = false; // on login Screen. initialized in html as "false" by default for on load
    });
    $scope.$on('loginSuccess', function() {
        $scope.loggedIn = true; // on successful login From botcontents / sortCtrl

    })

}]);
