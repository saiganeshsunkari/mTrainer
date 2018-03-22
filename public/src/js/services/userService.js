app.factory('userService', ['$http', 'localStorageService', '$location', function($http, localStorageService, $location) {
    var userService = {},
        user = localStorageService.get("user"),
        orgList, organization;
    local = "localhost:5000";

    //Get the list of Organizations to list in register user Modal
    /*userService.getorglist = function () {
        console.log("entered userService.getorglist in factory");
        var promise = $http.get('/organizationsList/').then(function (responseOrgList) {
            console.log(responseOrgList);
            console.log("Success userService.getorglist in factory");
            return responseOrgList;
        }, function (responseOrgList) { //Error handler Function
            console.log(responseOrgList);
            console.log("Failed userService.getorglist in factory");
            return responseOrgList;
        });
        return promise;
    };

    //Get Organization name by org ID
    userService.getOrgName = function () {
        var organizationName = this.getorglist().then(function (response) {
            user = localStorageService.get("user");
            orgList = response.data.Data;
            for (var i = 0; i < orgList.length; i++) {
                if (orgList[i]._orgId === user._orgId) {
                    return orgList[i].orgName;
                }
            }
        });
        return organizationName;
    };*/

    //Register a user
    /*  userService.registerAUser = function (data) {
          console.log("entered userService.registerAUser in factory");
          var promise = $http.post('/registerUser/', data).then(function (registerUserResponse) {
              console.log(registerUserResponse);
              console.log("Success userService.registerAUser in factory");
              return registerUserResponse;
          }, function (registerUserResponse) { //Error handler Function
              console.log(registerUserResponse);
              console.log("Failed userService.registerAUser in factory");
              return registerUserResponse;
          });

          return promise;
      };*/

    //Authenticate user on login
    userService.auth = function(data) {
        console.log("entered userService.auth in factory");
        var promise = $http.post('/login/', data).then(function(response) {
            console.log(response);
            console.log("Success userService.auth in factory");
            return response;
        }, function(response) { //Error handler Function
            console.log(response);
            console.log("Failed userService.auth in factory");
            return response;
        });

        return promise;
    };

    //Check for User Logged In if not direct to login page

    userService.checkUserLogin = function() {
        user = localStorageService.get("user");
        if (user === null) {
            $location.path('/login');
        }
    };

    userService.signOut = function() {
        localStorageService.clearAll();
        $location.path('/login');
    };


    return userService;
}]);
