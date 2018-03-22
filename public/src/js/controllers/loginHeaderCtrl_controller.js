// Controller for user log in / register Header
app.controller('loginHeaderCtrl', ['$scope', '$location', 'botFactory', 'localStorageService', 'userService', '$rootScope', 'reusableFactory', 'growl', '$cookies', function($scope, $location, botFactory, localStorageService, userService, $rootScope, reusableFactory, growl, $cookies) {
    console.log("Entered loginHeaderCtrl");
    $rootScope.$broadcast('onLoginScreen'); //broadcast this message when user is on the login page. $on(homeCtrl) listens to this message and works accoringly
    $scope.login = {};
    $scope.registerUser = {};
    $scope.loginTab = 1;

    //Sign in an User with provided Credentials
    $scope.signInUser = function() {
        console.log(JSON.stringify($scope.login));
        var authData = {},
            user;
        /*   expireDate = new Date();
        expireDate.setDate(expireDate.getDate() + 1);
        alert(expireDate);*/
        authData.email = $scope.login.username;
        authData.password = $scope.login.password;
        userService.auth(authData).then(function(response) { // authenticate and assign user details to session storage
            console.log(response);
            if (response.data.error === 0) {
                console.log(response);
                user = response.data.Data;
                localStorageService.set("user", user);
                $cookies.put('appUserToken', 'dgsdgh8dgh35df4g6h4dfg4h3654dfghDFghdsg5h75g4h6sd'); /*Trail*/
                console.log("user Info Stored");
                $rootScope.$broadcast('loginSuccess'); // this broadcasts when the user is succefully logged into the app
                $location.path('/home');
                $scope.login = {};
            } else {
                // display error message;
                console.log("userService.auth failed. Username and Password Doesn't match."); //notify username and password does not match && user is not registered
                console.log(response.data.Data);
                growl.addErrorMessage(response.data.Data);
            }
            authData = {};
        });
    };

    //Register a User wit the provided Details
    // $scope.registerAUser = function () {
    //     var data = {};
    //     data._emailId = $scope.registerUser.email;
    //     data._orgId = "MSS_45625";
    //     data.createdBy = $scope.registerUser.email;
    //     data.createdOn = reusableFactory.timeStampForNow();
    //     data.designation = $scope.registerUser.designation;
    //     data.firstName = $scope.registerUser.firstName;
    //     data.lastName = $scope.registerUser.lastName;
    //     data.phoneNumber = $scope.registerUser.phoneNumber;
    //     data.mobileNumber = $scope.registerUser.mobileNumber;
    //     data.password = $scope.registerUser.password;
    //     data.profileImage = "";
    //     data.updatedBy = "";
    //     data.updatedOn = "";
    //     data.userType = $scope.registerUser.userType;
    //
    //     console.log(JSON.stringify($scope.registerUser));
    //     console.log(data);
    //
    //     userService.registerAUser(data).then(function (registerAUser) {
    //         if (registerAUser.data.error == 0) {
    //             console.log("User registered Successfully");//TODO notify on user register success or failure
    //         } else {
    //             console.log("Problem in registering an User");
    //         }
    //     });
    //     $scope.registerUser = {};
    // };
    //
    // $scope.cancelUserRegistration = function () {
    //     $scope.registerUser = {};
    // };

    /*userService.getorglist().then(function (orgsResponse) {
        var orgs = orgsResponse.data.Data;
        console.log("From loginCtrl controller show the orglist" + JSON.stringify(orgs));
        $scope.organizations = orgs;
    });*/

    $('.slider').slick({
        // setting-name: setting-value
        'arrows': false,
        'autoplay': true,
        'autoplaySpeed': 3000,
        'pauseOnFocus': false

    });
}]);
