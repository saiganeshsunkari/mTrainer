app.factory('nlpFactory', ['$http', 'localStorageService', '$rootScope', function($http, localStorageService, $rootScope) {
    var nlpFactory = {};
    var url = '/mTrainer';

    nlpFactory.trainNlp = function(data) {
        console.log(data);
        var user = localStorageService.get("user"),
            activeModel = localStorageService.get("active_model"),
            modelName = activeModel.name + "_" + user._emailId,
            projectName = modelName.replace(/\s+/g, '');
        var req = {
            method: 'POST',
            url: url + '/train?project=' + projectName,
            headers: {
                'Content-Type': 'application/json'

            },
            data: data
        };

        // var promise = $http.post(url +'/train?name='+ projectName,trainingModel).then(function (response) { //NLP 0.9.0
        var promise = $http(req).then(function(response) { //NLP 0.10.0
            console.log(response);
            return response;
        }, function(response) { //Error handler Function
            return response;
        });

        return promise;
    };

    nlpFactory.testProject = function(data) {
        user = localStorageService.get("user");
        var activeModel = localStorageService.get("active_model");
        var modelName = activeModel.name + "_" + user._emailId;
        modelName = modelName.replace(/\s+/g, '');

        // var promise = $http.get(url +'/parse?q=' + data + '&model=' + modelName).then(function (response) { //NLP 0.9.0
        var promise = $http.get(url + '/parse?q=' + data + '&project=' + modelName).then(function(response) { //NLP 0.10.0
            console.log(response);
            return response;
        }, function(response) { //Error handler Function
            return response;
        });

        return promise;
    };

    nlpFactory.publishModel = function(pubData) {

        var activeModel = localStorageService.get("active_model");
        var data = {
            project: activeModel.name + '_' + activeModel.user,
            user: activeModel.user
        };
        var req = {
            method: 'POST',
            url: '/publish',
            headers: {
                'Content-Type': 'application/json'
            },
            data: data
        };
        var promise = $http(req).then(function(response) {
            //gets URL and Token
            return response;
        }, function(response) {
            //error contacting the server, or error at the server.
            return response.data.Data;
        });
        return promise;
    };


    //** GET for Available Models end**//
    return nlpFactory;
}]);
