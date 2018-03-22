app.factory('botFactory', ['$http', 'localStorageService', '$rootScope', function($http, localStorageService, $rootScope) {
    var botFactory = {};
    var user,
        activeModel = localStorageService.get("active_model");
    //url = "http://localhost:5000";
    console.log("entered botFactory");
    var getUserDetails = function() {
        user = localStorageService.get("user");
    };

    //** GET for Available Models**//
    botFactory.availableModels = function() {
        getUserDetails();
        console.log(user);
        var promise = $http.get('/models/' + user._emailId).then(function(response) {
            console.log(response);
            return response.data;
        }, function(response) { //Error handler Function
            return response.data;
        });
        return promise;
    };
    //** GET for Available Models end**//

    //** post for adding a new Model start**//
    botFactory.addNewModel = function(data) {
        data.createdOn = new Date();
        var promise = $http.post('/models/', data).then(function(response) {
            console.log(response.data);
            // console.log(response.data['Data'][0]['_id']);
            if (response.data['Data'][0] != undefined) {
                return response.data;
            } else {
                console.log(response.data['Data']);
                //  return response.data['Data']._id;
                return response.data;
            }
        }, function(response) { //Error handler Function
            return response.data;
        });
        // this.broadcastModelCreateDelete();
        return promise;
    };
    //** post for adding a new Model end**//

    //**Edit existing model **//
    botFactory.editModel = function(data) {
        var promise = $http.put('/models/', data).then(function(response) {
            console.log("Model updated.");
            console.log(response);
            return response.data.Data;
        }, function(response) {
            console.log("Model Could not be updated");
            console.log(response);
            return response.data.Data;
        });

        return promise;
    }

    //**Broadcast message for updating the navList on creating and deleting the models START
    botFactory.broadcastModelCreateDelete = function() {
        $rootScope.$broadcast('modelCreateDelete');
    };
    //**Broadcast message for updating the navList on creating and deleting the models END

    /*  //!** post for adding a new Model Entities Document start**
      botFactory.addNewModelEntity = function (data) {
          console.log(data);
          var promise = $http.post(url+'/entity/', data).then(function (response) {
              // The return value gets picked up by the then in the controller.
              console.log(response);
              return response.data;
          }, function (response) { //Error handler Function
              /!*console.log("Error response for available bots from botFactory.availableBots()");
               console.log(response);*!/
              return response.data;
          });
          // Return the promise to the controller
          return promise;
      };
      //!** post for adding a new Model Entities Document end**!//*/


    //***INTENTS TAB Start ***///
    //** post for adding a new Model intents Document start**//V0.3
    botFactory.addNewModelIntent = function(data) {
        console.log(data);
        var promise = $http.post('/intents/', data).then(function(response) {
            // The return value gets picked up by the then in the controller.
            console.log(response);
            return response.data;
        }, function(response) { //Error handler Function
            /*console.log("Error response for available bots from botFactory.availableBots()");
             console.log(response);*/
            return response.data;
        });
        // Return the promise to the controller
        return promise;
    };
    //** post for adding a new Model intents Document end**//

    // insert intents id to the modelInformation Intents array V0.3
    botFactory.pushIntentId = function(modelId, intentId) {
        var pushData = {};
        pushData.intentId = intentId;
        pushData.modelId = modelId;
        if (modelId == "") {
            pushData.modelId = activeModel._id;
            console.log("no model Id for pushing Intents Id to the arrayin model information");
        }

        var promise = $http.put('/pushIntentId/', pushData).then(function(response) {
            // The return value gets picked up by the then in the controller.
            console.log("push Model Intents Id response");
            console.log(response);
            return response.data;
        }, function(response) { //Error handler Function
            console.log("Error response for put model Intents ID from botFactory.pushIntentId()");
            console.log(response);
            return response.data;
        });
        // Return the promise to the controller
        return promise;
    };

    //** put for Edting the Intent Name V0.3
    botFactory.renameIntent = function(intentId, newName) {
        var putData = {
            "intentId": intentId,
            "newName": newName
        };
        var promise = $http.put('/intents/', putData).then(function(response) {
            // The return value gets picked up by the then in the controller.
            console.log("rename Intent  response");
            console.log(response);
            return response.data;
        }, function(response) { //Error handler Function
            console.log("Error response for rename Intent from botFactory.renameIntent()");
            console.log(response);
            return response.data;
        });
        // Return the promise to the controller
        return promise;
    };

    //** Delete for deleting an intent Document start**//V0.3
    botFactory.deleteModelIntent = function(intentId) {
        var data = intentId;
        console.log(data);
        var promise = $http.delete('/intents/' + data).then(function(response) {
            console.log("Deleted Model Intent response");
            console.log(response);
            return response.data.Data;
        }, function(response) {
            console.log("Error response for Deleting an Intent from botFactory.deleteModelIntent()");
            console.log(response);
            return response.data.Data;
        });

        return promise;
    };
    //Pull deleted entity id in entities
    botFactory.pullIntentId = function(intentId) {
        activeModel = localStorageService.get("active_model");
        var data = {
            "intentId": intentId,
            "modelId": activeModel._id
        };
        var promise = $http.put('/pullIntentId/', data).then(function(response) {
            console.log("Deleted Model Intent's response: Pulling Intent Id");
            console.log(response);
            return response.data.Data;
        }, function(response) {
            console.log("Error response for pull Intent ID from botFactory.pullIntentId()");
            console.log(response);
            return response.data.Data;
        });

        return promise;
    };
    //** DELETE for deleting an intent Document end**//V0.3

    //** GET for getting available Intents for the active model**//
    botFactory.getModelIntents = function() {
        activeModel = localStorageService.get("active_model");
        var intents = activeModel.intents.toString();
        var promise = $http.get('/intents/' + intents).then(function(response) {
            // The return value gets picked up by the then in the controller.
            console.log("Model Intents response");
            console.log(response);
            return response.data;
        }, function(response) { //Error handler Function
            console.log("Error response for get model Intents from botFactory.getModelIntents()");
            console.log(response);
            return response.data;
        });
        // Return the promise to the controller
        return promise;
    };

    //** post for adding new Utterance for active model's intent**//
    botFactory.addNewUtterance = function(data, toIntent) {
        // activeModel = localStorageService.get("active_model");
        var promise = $http.post('/utterances/' + toIntent, data).then(function(response) {
            // The return value gets picked up by the then in the controller.
            console.log("Model add Intent's Utterance response");
            console.log(response);
            return response.data;
        }, function(response) { //Error handler Function
            console.log("Error response for add Intent's Utterance from botFactory.addNewUtterance()");
            console.log(response);
            return response.data;
        });
        // Return the promise to the controller
        return promise;
    };

    //DELETE for deleting an utterance START V0.3
    botFactory.deleteUtterance = function(utterance, fromIntent) {
        var data = {};
        data.utterance = utterance;
        data.intentId = fromIntent;

        var promise = $http.delete('/utterances/' + data.utterance + '/' + data.intentId).then(function(response) {
            console.log("Response for Deleting an Utterance from  botFactory.deleteUtterance()");
            console.log(response);
            return response.data;
        }, function(response) { //Error handler Function
            console.log("Error deleting an Utterance from  botFactory.deleteUtterance()");
            console.log(response);
            return response.data;
        });

        return promise;
    };
    //DELETE for deleting an utterance END

    //post for adding new entity mapping to an intent
    botFactory.newEntityMapping = function(data, toIntentUtterance) {
        // activeModel = localStorageService.get("active_model");
        console.log(data);
        console.log(JSON.stringify(toIntentUtterance));
        var toIntent = toIntentUtterance.intentId;
        var toUtterance = toIntentUtterance.utterance;
        var promise = $http.post('/mappings/' + toIntent + '/' + toUtterance, data).then(function(response) {
            // The return value gets picked up by the then in the controller.
            console.log("Model add entity Mapping response");
            console.log(response);
            return response.data;
        }, function(response) { //Error handler Function
            console.log("Error response for add entity Mapping from botFactory.newEntityMapping()");
            console.log(response);
            return response.data;
        });
        // Return the promise to the controller
        return promise;
    };

    //Delete for deleting a mapping from Intent's Mapping V0.3
    botFactory.deleteAMapping = function(intent, utterance, mappingInfo) {
        var mappingValue = mappingInfo.value,
            mappingEntity = mappingInfo.entity;
        var promise = $http.delete('/mappings/' + intent + '/' + utterance + '/' + mappingValue + '/' + mappingEntity).then(function(response) {
            console.log("Response for Deleting a mapping  botFactory.deleteAMapping()");
            console.log(response);
            return response.data;
        }, function(response) { //Error handler Function
            console.log("Error deleting a mapping from  botFactory.deleteAMapping()");
            console.log(response);
            return response.data;
        });

        return promise;
    };
    //***INTENTS TAB End ***///

    ///***ENTITIES TAB ***/// TODO   edit entities
    // insert Entities id to the modelInformation Intents array V0.3
    /* botFactory.pushEntityId = function(modelId, entityId) {
         var pushData = {};
         pushData.entityId = entityId;
         pushData.modelId = modelId;
         if (modelId == "") {
             pushData.modelId = activeModel._id;
             console.log("no model Id for pushing Intents Id to the array in model information");
         }

         var promise = $http.put('/entities/', pushData).then(function(response) {
             // The return value gets picked up by the then in the controller.
             console.log("push Model Entity Id response");
             console.log(response);
             return response.data;
         }, function(response) { //Error handler Function
             console.log("Error response for put model Entity ID from botFactory.pushEntityId()");
             console.log(response);
             return response.data;
         });
         // Return the promise to the controller
         return promise;
     };*/


    //** GET Entities for Active Model**//
    // botFactory.getModelEntities = function () {
    //     activeModel = localStorageService.get("active_model");
    //     var entities = activeModel.entities.toString();
    //     console.log('getModelentities');
    //     console.log(entities);
    //
    //     var promise = $http.get(url + '/entities/' + entities).then(function (response) {
    //         // The return value gets picked up by the then in the controller.
    //         console.log("Model Entities response");
    //         console.log(response);
    //         return response.data.Data;
    //     }, function (response) { //Error handler Function
    //         console.log("Error response for get model entities from botFactory.getModelEntities()");
    //         console.log(response);
    //         return response.data.Data;
    //     });
    //     // Return the promise to the controller
    //     return promise;
    // };
    //** GET Entities for Active Model end**//

    //** post add new Entitiy for Active Model**// V0.3
    botFactory.addModelEntitity = function(data) {
        var pushData = {};
        console.log("Printing data in addModelentity");
        console.log(data);
        if (data.modelId == "" || data.modelId == undefined) {
            pushData.modelId = activeModel._id;
            data.modelId = activeModel._id;
            console.log("no model Id for pushing Intents Id to the array in model information");
        }
        //  data.modelId =modelId;
        activeModel = localStorageService.get("active_model");
        console.log("the data for put enjtity");
        console.log(data);
        console.log(activeModel);
        var promise = $http.put('/entities/', data).then(function(response) {
            console.log("Model Entity added");
            console.log(response);
            return response;
        }, function(response) {
            console.log("Error response for get model entities from botFactory.getModelEntities()");
            console.log(response);
            return response.data.Data;
        });

        return promise;
    };
    /* botFactory.pushEntityId = function (modelId, entityId) {
         var pushData = {};
         pushData.entityId = entityId;
         pushData.modelId = modelId;
         if (modelId == "") {
             pushData.modelId = activeModel._id;
             console.log("no model Id for pushing Intents Id to the array in model information");
         }

         var promise = $http.put(url + '/entities/', pushData).then(function (response) {
             // The return value gets picked up by the then in the controller.
             console.log("push Model Entity Id response");
             console.log(response);
             return response.data;
         }, function (response) { //Error handler Function
             console.log("Error response for put model Entity ID from botFactory.pushEntityId()");
             console.log(response);
             return response.data;
         });
         // Return the promise to the controller
         return promise;
     };*/
    //**post add new Entitiy for Active Model end**//

    //** DELETE Entitiy for Active Model**// V0.3
    botFactory.deleteModelEntity = function(data) {
        activeModel = localStorageService.get("active_model");
        var data = data;
        console.log(data);


        var promise = $http.put('/models/', data).then(function(response) {

            console.log("Deleted Model Entities response");
            console.log(response);
            return response.data.Data;
        }, function(response) {
            console.log("Error response for get model entities from botFactory.getModelEntities()");
            console.log(response);
            return response.data.Data;
        });

        return promise;
    };
    //Pull deleted entity id in entities
    botFactory.pullEntityId = function(entityId) {
        activeModel = localStorageService.get("active_model");
        var data = {
            "entityId": entityId,
            "modelId": activeModel._id
        };
        var promise = $http.put('/pullEntityId/', data).then(function(response) {
            console.log("Deleted Model Entities response: Pulling Entity Id");
            console.log(response);
            return response.data.Data;
        }, function(response) {
            console.log("Error response for pull entity ID from botFactory.pullEntityId()");
            console.log(response);
            return response.data.Data;
        });

        return promise;
    };
    //**DELETE Entitiy for Active Model end**//

    //** put Edit Entitiy for Active Model**// //TODO code for Editing an entity
    botFactory.editModelEntity = function(data) {
        // activeModel = localStorageService.get("active_model");

        var promise = $http.put('/models/', data).then(function(response) {
            console.log("New entity saved. Model updated.");
            console.log(response);
            return response.data.Data;
        }, function(response) {
            console.log("Could not update the entity");
            console.log(response);
            return response.data.Data;
        });

        return promise;
    };
    //**put Edit Entitiy for Active Model end**//

    //** put for renaming the Entity in the mapping Start
    botFactory.updateEntityInIntents = function(data) {
        console.log('data to update entity in mapping');
        console.log(data);

        var promise = $http.put('/mappings/', data).then(function(response) {
            console.log("rename Entity in mapping response");
            console.log(response);
            return response.data;
        }, function(response) {
            console.log("Error response for rename entity from botFactory.updateEntityInIntents()");
            console.log(response);
            return response.data;
        });

        return promise;
    };
    //** put for renaming the Entity in the mapping END
    ///***ENTITIES TAB End***///

    //**DELETE MOdel by _modelId start**//
    botFactory.deleteModel = function(modelId) {

        console.log(modelId);
        var promise = $http.delete('/models/' + modelId).then(function(response) {
            console.log("Deleted Modelresponse");
            console.log(response);
            return response;
        }, function(response) {
            console.log("Error response for Delete model from botFactory.deleteModel()");
            console.log(response);
            return response.data.Data;
        });
        return promise;
    };


    //**DELETE MOdel by _modelId end**//

    /* //!**DELETE MOdel's complete Entities by _modelId start**!//V0.2
     botFactory.deleteWholeEntitiesOfModel = function (modelId) {

     console.log(modelId);
     var promise = $http.delete('/deleteWholeEntitiesOfModel/' + modelId).then(function (response) {
     console.log("Deleted Model's  Entities response");
     console.log(response);
     return response;
     }, function (response) {
     console.log("Error response for Delete model's Entities from botFactory.deleteWholeEntitiesOfModel()");
     console.log(response);
     return response;
     });

     return promise;

     };
     //!**DELETE MOdel's complete Entities by _modelId end**!//*/

    /*//!**DELETE MOdel's complete Intents by _modelId start**!//V0.2
     botFactory.deleteWholeIntentsOfModel = function (modelId) {

     console.log(modelId);
     var promise = $http.delete('/deleteWholeIntentsOfModel/' + modelId).then(function (response) {
     console.log("Deleted Model's  Intents response");
     console.log(response);
     return response;
     }, function (response) {
     console.log("Error response for Delete model's Intents from botFactory.deleteWholeEntitiesOfModel()");
     console.log(response);
     return response;
     });

     return promise;

     };
     //!**DELETE MOdel's complete Intents by _modelId end**!//*/



    return botFactory;
}]);


/*
 //Reference

 app.factory('myService', function($http) {
 var myService = {
 async: function() {
 // $http returns a promise, which has a then function, which also returns a promise
 var promise = $http.get('test.json').then(function (response) {
 // The then function here is an opportunity to modify the response
 console.log(response);
 // The return value gets picked up by the then in the controller.
 return response.data;
 });
 // Return the promise to the controller
 return promise;
 }
 };
 return myService;
 });

 app.controller('MainCtrl', function( myService,$scope) {
 // Call the async method and then do stuff with what is returned inside our own then function
 myService.async().then(function(d) {
 $scope.data = d;
 });
 });

 //Complicated
 //Complicated

 app.factory('myService', function($http) {
 var promise;
 var myService = {
 async: function() {
 if ( !promise ) {
 // $http returns a promise, which has a then function, which also returns a promise
 promise = $http.get('test.json').then(function (response) {
 // The then function here is an opportunity to modify the response
 console.log(response);
 // The return value gets picked up by the then in the controller.
 return response.data;
 });
 }
 // Return the promise to the controller
 return promise;
 }
 };
 return myService;
 });

 app.controller('MainCtrl', function( myService,$scope) {
 $scope.clearData = function() {
 $scope.data = {};
 };
 $scope.getData = function() {
 // Call the async method and then do stuff with what is returned inside our own then function
 myService.async().then(function(d) {
 $scope.data = d;
 });
 };
 });*/
