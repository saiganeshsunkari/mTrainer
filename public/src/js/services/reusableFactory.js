app.factory('reusableFactory', ['$http', function($http) {
    var reusableFactory = {};
    //Current timestamp
    reusableFactory.timeStampForNow = function() {
        var d = new Date();
        var n = d.getTime();
        return n;
    };

    //Import the JSON file
    /*reusableFactory.importJson = function (url) {
     var promise = $http.get(''+url+'').then(function (response) {
     console.log("imported the JSON file");
     console.log(response);
     return response;
     }, function (response) {
     console.log("Error importing the JSON file reusableFactory.importJson()");
     console.log(response);
     return response;
     });
     return promise;
     };*/

    //**Date for hashing _ID**
    reusableFactory.botHashID = function() {
        var date = new Date();
        var components = [
            date.getYear() + 1900,
            date.getMonth() + 1,
            date.getDate(),
            date.getHours(),
            date.getMinutes(),
            date.getSeconds(),
            date.getMilliseconds()
        ];
        var id = components.join("");
        return id;
    };
    return reusableFactory;
}]);
