//Create bot Controller
app.controller('createBotModalController', ['$scope', 'close', 'botFactory', 'reusableFactory', 'localStorageService', 'growl', 'userService', '$rootScope', function($scope, close, botFactory, reusableFactory, localStorageService, growl, userService, $rootScope) {
    userService.checkUserLogin(); //check for user login(Change is accordingly when token based auth is defined)
    var user = localStorageService.get("user");
    $scope.newModel = {};
    $scope.newModel.name = "";
    $scope.newModel.description = "";
    $scope.newModel.tags = "";
    $scope.haveModel = false;
    var jsonFileInput;
    $(document).ready(function() {
        console.log($('.model-denial').html());
    })
    $scope.cancelnewModel = function(result) {
        $scope.newModel = {};
        close(result, 500); // close, but give 500ms for bootstrap to animate
    };
    //  var uploadedFile = "";
    $scope.uploadFile = function() { // Get the User uploaded JSON file
        //  alert($scope.uploadFilePath);
        jsonFileInput = document.getElementById('fileUploadInput');
        var reader = new FileReader();
        var jsonFile = jsonFileInput.files[0];
        reader.onload = function(e) {
            $scope.$apply(function() {
                //console.log(reader.result);//CAll a function which parses the data and creates the
                uploadedFile = reader.result;
                IsJsonString(uploadedFile);
                //todo is rasa format
            });
        };
        reader.readAsText(jsonFile);
    };


    function IsJsonString(str) {
        try {
            JSON.parse(str);
        } catch (e) {
            document.getElementById('fileUploadInput').value = "";

            growl.addErrorMessage("Your file is not in RASA readable JSON format, choose another file."); // add validation if not a json file
            $scope.showModelReg = false;
            return false;
        }
        console.log("Uploaded is a json file");
        //  growl.addSuccessMessage("Your file is not in RASA readable JSON format, choose another file"); // add validation if not a json file
        $scope.showModelReg = true;
        return true;
    }

    var getModelInformation = function() {
        // Read the New model information from the modal

        var data = {};
        data.user = user._emailId;
        data._modelId = $scope.newModel.name.toLowerCase() + "_" + user._emailId + reusableFactory.botHashID();
        data.name = $scope.newModel.name.toUpperCase();
        data.description = (typeof $scope.newModel.desc === "undefined") ? "" : $scope.newModel.desc;
        data.iconLocation = "public/src/images/bot_icons/apple_no_bg.png";
        data.utteranceSample = (typeof $scope.newModel.utteranceSample === "undefined") ? "" : $scope.newModel.utteranceSample;
        data.tags = (typeof $scope.newModel.tags === "undefined") ? "" : $scope.newModel.tags;
        data.language = (typeof $scope.newModel.language === "undefined") ? "" : $scope.newModel.language; //TODO mTrainer mention utterance sample in the browser
        data.publishMode = "draft";
        data.publishedOn = "";
        data.createdOn = reusableFactory.timeStampForNow();
        data.updatedOn = "";
        data.intents = [];
        data.entities = [];
        return data;
    };

    // On creating new model we create new Intents and Entities associated with the new model by _modelId
    $scope.createnewModel = function(result) {
        var data = {},
            entityData = {},
            entityNum;
        if (!$scope.haveModel) {

            data = getModelInformation();

            if ($scope.models == 'No Models found..') {
                var currentModels = [];
            } else {
                var currentModels = $scope.models;
            }


            var modelsArray = [];

            function checkForModels(currentModels, data) {

                if (data.name != undefined && data.name != "") {
                    var boolArr = [];
                    for (var i = 0; i < currentModels.length; i++) {
                        var bool = false;
                        console.log('in condition', currentModels.length, currentModels)
                        if (currentModels.length == 0) {
                            modelsArray.push(data);
                            console.log(modelsArray);
                        } else {

                            while (currentModels[i].name.toUpperCase() == data.name.toUpperCase()) {
                                console.log('while');
                                bool = true;
                                break;
                            }
                        }
                        boolArr.push(bool);
                    }
                } else {
                    growl.addErrorMessage("Please enter a valid model name  ");
                }

                Array.prototype.contains = function(obj) {
                    var i = this.length;
                    while (i--) {
                        if (this[i] === obj) {
                            return true;
                        }
                    }
                    return false;
                }
                return boolArr.contains(true);
            }

            var check = checkForModels(currentModels, data);

            if (checkForModels(currentModels, data) == false) {

                modelsArray.push(data);

            } else {
                growl.addErrorMessage("Please enter a different model name  ");

            }
            // defining a new intent and associating it to the new model by _modelId V0.3
            var intentData = {};
            intentData.intent = "sample";
            intentData.utterances = [];

            entityData = {};

            entityData.entityName = "sample";
            if (modelsArray.length != 0) {
                botFactory.addNewModel(data).then(function(modelResult) { //V0.3

                    console.log("From Sort controller to add widget" + modelResult);
                    console.log(modelResult);
                    //   var newModelID = modelResult;
                    // $scope.bots = bots;
                    growl.addSuccessMessage("Creating a New Model");
                    /* botFactory.addNewModelIntent(intentData).then(function (intentResult) {//V0.3
          console.log("From Sort controller to add new Intent col for new model" + intentResult);
          console.log(intentResult);
          var newIntentID = intentResult.Data;
          botFactory.pushIntentId(newModelID, newIntentID).then(function (intentIdInModelResult) {
          console.log("sample Intent created successfully and stored its id in the intents array of modelInformation");
        });
        growl.addSuccessMessage("Adding Sample Intents to model");//Notifications on intents adding sucessful
      });
      botFactory.addNewModelEntity(entityData).then(function (entityResult) {//V0.3
      console.log("From Sort controller to add new Entity col for new model" + entityResult);
      console.log(entityResult);//todo add inserted Entity _id to modelinformation Entities array
      var newEntityID = entityResult.Data;
      botFactory.pushEntityId(newModelID, newEntityID).then(function (entityIdInModelResult) {
      growl.addSuccessMessage("Adding Sample Entities to model");//Notifications on adding Entities sucessfully
    });

  });*/

                    close(modelResult, 500); // close, but give 500ms for bootstrap to animate
                    // close(result, 500); // close, but give 500ms for bootstrap to animate
                });
            }

        } else {

            var uploadedJsonFile,
                model = [],
                intentsInModel = [],
                entitiesInModel = [],
                i, revisedModel = [],
                identifiedTempIntent = {},
                rmi,
                e,
                revisedEntities = [],
                identifiedTempUtterance = {},
                entitiesReady = {},
                intentsReady = {}; //intentIndex,
            console.log(uploadedFile)
            uploadedJsonFile = JSON.parse(uploadedFile);
            console.log(uploadedJsonFile);
            if (uploadedJsonFile.rasa_nlu_data == undefined || uploadedJsonFile.rasa_nlu_data == "") {
                growl.addErrorMessage("Your file is not in RASA readable JSON format, choose another file");
                // $scope.cancelnewModel();

            } else {

                if (uploadedJsonFile.rasa_nlu_data.common_examples == undefined || uploadedJsonFile.rasa_nlu_data.common_examples == "") {
                    growl.addErrorMessage("Your file is not in RASA readable JSON format, choose another file");
                    // $scope.cancelnewModel();
                } else {
                    model = uploadedJsonFile.rasa_nlu_data.common_examples;
                    console.log(model);
                    var modelsArray = [];
                    data = getModelInformation();
                    console.log(data);


                    if ($scope.models == 'No Models found..') {
                        var currentModels = [];
                    } else {
                        var currentModels = $scope.models;
                    }

                    function checkForModels(currentModels, data) {

                        if (data.name != undefined && data.name != "") {
                            var boolArr = [];
                            console.log(currentModels.length);
                            for (var i = 0; i < currentModels.length; i++) {
                                var bool = false;
                                console.log(currentModels.length == 0);

                                if (currentModels.length == 0) {
                                    modelsArray.push(data);

                                } else {

                                    while (currentModels[i].name.toUpperCase() == data.name.toUpperCase()) {
                                        console.log('while');
                                        bool = true;
                                        break;
                                    }
                                }
                                boolArr.push(bool);
                            }
                        } else {
                            growl.addErrorMessage("Please enter a valid model name ");
                        }

                        Array.prototype.contains = function(obj) {
                            var i = this.length;
                            while (i--) {
                                if (this[i] === obj) {
                                    return true;
                                }
                            }
                            return false;
                        }
                        return boolArr.contains(true);
                    }

                    var check = checkForModels(currentModels, data);


                    if (checkForModels(currentModels, data) == false) {
                        modelsArray.push(data);
                    } else {
                        growl.addErrorMessage("Please enter a different model name  ");
                    }



                    if (modelsArray.length != 0) {
                        for (i = 0; i < model.length; i++) { //looping through all the objects in common_examples
                            identifiedTempIntent = {};
                            identifiedTempUtterance = {};
                            if (intentsInModel.indexOf(model[i].intent) !== -1) { //if Intent is already encountered
                                for (rmi = 0; rmi < revisedModel.length; rmi++) { // look for the existing Intent in the revisedModel
                                    if (revisedModel[rmi].intent === model[i].intent) { // If Intent matches
                                        console.log(model[i].text);
                                        console.log(model[i].text != undefined || model[i].text != "")
                                        if (model[i].text != undefined && model[i].text != "") {
                                            identifiedTempUtterance.utterance = model[i].text;
                                            if (model[i].entities != undefined || (model[i].entities.start != undefined &&
                                                    model[i].entities.end != undefined && model[i].entities.value != undefined &&
                                                    model[i].entities.entity != undefined)) {
                                                identifiedTempUtterance.entities = model[i].entities;

                                            }
                                            revisedModel[rmi].utterances.push(identifiedTempUtterance);

                                        }
                                        console.log(identifiedTempIntent);

                                    }
                                }
                            } else { // if the Intent is new Intent
                                intentsInModel.push(model[i].intent);
                                growl.addInfoMessage("Intent <strong>" + model[i].intent + "</strong> identified", {
                                    ttl: (i * 500) + 3000
                                });
                                identifiedTempIntent.intent = model[i].intent;
                                console.log(model[i].text);
                                console.log(model[i].text != undefined || model[i].text != "")
                                if (model[i].text != undefined && model[i].text != "") {

                                    identifiedTempUtterance.utterance = model[i].text;
                                    if (model[i].entities != undefined || (model[i].entities.start != undefined &&
                                            model[i].entities.end != undefined && model[i].entities.value != undefined &&
                                            model[i].entities.entity != undefined)) {
                                        identifiedTempUtterance.entities = model[i].entities;

                                    }

                                    identifiedTempIntent.utterances = [];
                                    identifiedTempIntent.utterances.push(identifiedTempUtterance);
                                }
                                console.log(identifiedTempIntent);

                                revisedModel.push(identifiedTempIntent);
                            }
                            for (e = 0; e < model[i].entities.length; e++) {
                                if (entitiesInModel.indexOf(model[i].entities[e].entity) !== -1) {

                                } else {
                                    growl.addInfoMessage("Entity <strong>" + model[i].entities[e].entity + "</strong> identified", {
                                        ttl: (i * 500) + 3000
                                    });

                                    if (model[i].entities[e].entity != undefined && model[i].entities[e].entity != "") {
                                        entitiesInModel.push(model[i].entities[e].entity);
                                    }
                                }
                            }
                        }
                        intentsReady.intents = revisedModel;
                        // console.log(intentsInModel);
                        console.log("Intents array after upload");
                        console.log(intentsReady);

                        for (entityNum = 0; entityNum < entitiesInModel.length; entityNum++) {
                            entityData.entityName = entitiesInModel[entityNum];
                            entityData.entityId = data._modelId + "_" + entityData.entityName;

                            revisedEntities.push(entityData);
                            entityData = {};
                        }
                        entitiesReady.entities = revisedEntities;
                        console.log("Entities array after upload");
                        console.log(entitiesReady);
                        modelsArray[0].entities = revisedEntities;
                        //  modelsArray.entities = entitiesReady.entities;
                        console.log(modelsArray);
                        botFactory.addNewModel(modelsArray).then(function(modelResult) { //V0.3
                            console.log("From uploadModelCtrl controller to add widget" + modelResult['Data'][0]['_id']);
                            console.log(modelResult['Data'][0]['_id']);
                            var newModelID = modelResult['Data'][0]['_id'];
                            // entitiesReady.modelId = newModelID;
                            //   console.log('entitiesready');
                            //   console.log(entitiesReady);
                            growl.addSuccessMessage("Creating a New Model");
                            botFactory.addNewModelIntent(intentsReady).then(function(intentResult) { //V0.3
                                console.log("From uploadModelCtrl controller to add new Intents col for new model" + intentResult);
                                console.log(intentResult);
                                var newIntentID = intentResult.Data.intentIds;
                                botFactory.pushIntentId(newModelID, newIntentID).then(function(intentIdInModelResult) {
                                    console.log("uploaded Intents created successfully and stored its id in the intents array of modelInformation");
                                    //  $rootScope.$broadcast('refreshModelList');
                                    //  $rootScope.$broadcast('modelCreateDelete');
                                    // $scope.activeModel.intents.push(newIntentID);
                                    // var model = user.intents.concat(newIntentID);
                                    // localStorageService.set("active_model", model);
                                    // $scope.activeModel = model;
                                    close(intentIdInModelResult, 500);

                                })
                            });
                            //    console.log(data);
                            //    console.log(modelsArray)

                            /*       botFactory.addModelEntitity(entitiesReady).then(function(entityResult) { //V0.3
              console.log("From Sort controller to add new Entity col for new model" + entityResult);
              console.log(entityResult); //todo add inserted Entity _id to modelinformation Entities array
              //   console.log(entityResult);
              console.log(entityResult.data.Data);
              var newEntityID = entityResult.data.Data;
              growl.addSuccessMessage("Adding Sample Entities to model"); //Notifications on adding Entities sucessfully
              $rootScope.$broadcast('refreshModelList');
              $rootScope.$broadcast('modelCreateDelete');
              //  close(entityIdInModelResult, 500); // close, but give 500ms for bootstrap to animate
              // botFactory.pushEntityId(newModelID, newEntityID).then(function (entityIdInModelResult) {
              //      growl.addSuccessMessage("Adding Sample Entities to model");//Notifications on adding Entities sucessfully
              //      // $rootScope.$broadcast('refreshModelList');
              //      // $rootScope.$broadcast('modelCreateDelete');
              //
              //      close(entityIdInModelResult, 500); // close, but give 500ms for bootstrap to animate
              //  });
            });*/
                        })
                    }
                }
            }

        }
        data = {};
    };


}]);
