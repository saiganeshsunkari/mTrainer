/**
MOVED TO CREATE MODEL
 **/
/*
app.controller('uploadModelCtrl', ['$scope', '$location', 'botFactory', 'reusableFactory', 'localStorageService', '$timeout', '$rootScope', 'growl', 'userService', function ($scope, $location, botFactory, reusableFactory, localStorageService, $timeout, $rootScope, growl, userService) {
    console.log('Entered uploadModelCtrl');
    userService.checkUserLogin();//check for user login(Change is accordingly when token based auth is defined)
    var user = localStorageService.get("user");
    var uploadedFile = {};
    $scope.newModel = {};
    $scope.showModelReg = false;

    $scope.uploadFile = function () { // Get the User uploaded JSON file
        // alert($scope.uploadFilePath);
        var jsonFileInput = document.getElementById('fileUploadInput');
        var reader = new FileReader();
        var jsonFile = jsonFileInput.files[0];
        reader.onload = function (e) {
            $scope.$apply(function () {
                //console.log(reader.result);//CAll a function which parses the data and creates the
                uploadedFile = reader.result;
                IsJsonString(uploadedFile);
            });
        };
        reader.readAsText(jsonFile);
    };

    function IsJsonString(str) {
        try {
            JSON.parse(str);
        } catch (e) {
            console.log("uploaded is not a JSON File");
            document.getElementById('fileUploadInput').value = "";
            growl.addErrorMessage("Selected file is not in json format.");// add validation if not a json file
            $scope.showModelReg = false;
            return false;
        }
        console.log("Uploaded is a json file");
        growl.addSuccessMessage("Your file is in JSON format.");// add validation if not a json file
        $scope.showModelReg = true;
        return true;
    }

    $scope.uploadAndSave = function (userSelection) {
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
            intentsReady = {};//intentIndex,
        uploadedJsonFile = JSON.parse(uploadedFile);
        // var checkIntentAvailable = function (currentIntent) {
        //     intentIndex = intentsInModel.indexOf(currentIntent);
        //     if ( intentIndex !== -1) {
        //         //the intent is already present in intentsInModel so just push to the particular document
        //         return true;
        //     } else {
        //         //create a document in revisedModel, push intent name in intentsInModel[].
        //         return false;
        //     }
        //
        // };

        console.log(uploadedJsonFile);
        model = uploadedJsonFile.rasa_nlu_data.common_examples;
        for (i = 0; i < model.length; i++) { //looping through all the objects in common_examples
            identifiedTempIntent = {};
            identifiedTempUtterance = {};
            if (intentsInModel.indexOf(model[i].intent) !== -1) {//if Intent is already encountered
                for (rmi = 0; rmi < revisedModel.length; rmi++) { // look for the existing Intent in the revisedModel
                    if (revisedModel[rmi].intent === model[i].intent) { // If Intent matches
                        identifiedTempUtterance.utterance = model[i].text;
                        identifiedTempUtterance.entities = model[i].entities;
                        revisedModel[rmi].utterances.push(identifiedTempUtterance);
                        /!* for (rmu = 0; rmu < revisedModel[rmi].utterances.length; rmu++) { // look whether the utterance is already present
                         if (revisedModel[rmi].utterances[rmu].utterance === model[i].text) {// look whether the utterance is already present, if yes Concate nate
                         revisedModel[rmi].utterances[rmu].entities=revisedModel[rmi].utterances[rmu].entities.concat(model[i].entities);
                         continue;
                         }else{
                         identifiedTempUtterance.utterance = model[i].text;
                         identifiedTempUtterance.entities = model[i].entities;
                         }
                         }*!/
                    }
                }
            } else { // if the Intent is new Intent
                intentsInModel.push(model[i].intent);
                growl.addSuccessMessage("Intent <strong>" + model[i].intent + "</strong> identified");
                identifiedTempIntent.intent = model[i].intent;
                identifiedTempUtterance.utterance = model[i].text;
                identifiedTempUtterance.entities = model[i].entities;
                identifiedTempIntent.utterances = [];
                identifiedTempIntent.utterances.push(identifiedTempUtterance);
                revisedModel.push(identifiedTempIntent);
            }
            for (e = 0; e < model[i].entities.length; e++) {
                if (entitiesInModel.indexOf(model[i].entities[e].entity) !== -1) {

                } else {
                    entitiesInModel.push(model[i].entities[e].entity);
                }
            }
        }
        intentsReady.intents = revisedModel;
        // console.log(intentsInModel);
        console.log("Intents array after upload");
        console.log(intentsReady);

        // console.log(model);

        //Model data collection
        var data = {};
        var entityData = {}, entityNum;
        data._orgId = user._orgId;
        data._modelId = $scope.newModel.name.toLowerCase() + "_" + user._orgId + reusableFactory.botHashID();
        data.name = $scope.newModel.name.toUpperCase();
        data.description = $scope.newModel.desc;
        data.iconLocation = "public/src/images/bot_icons/apple_no_bg.png";
        data.utteranceSample = $scope.newModel.utteranceSample;
        data.tags = $scope.newModel.tags;
        data.language = $scope.newModel.language;//TODO mTrainer mention utterance sample in the browser
        data.archived = "No";
        data.archivedOn = "";
        data.archivedBy = "";
        data.lockedForEditing = "No";
        data.lockedBy = "";
        data.publishMode = "draft";
        data.publishedOn = "";
        data.publishedBy = "";
        data.createdOn = reusableFactory.timeStampForNow();
        data.createdBy = user._emailId;
        data.updatedOn = "";
        data.updatedBy = "";
        data.intents = [];
        data.entities = [];

        console.log(data);

        for (entityNum = 0; entityNum < entitiesInModel.length; entityNum++) {
            entityData.entityName = entitiesInModel[entityNum];
            entityData.createdOn = reusableFactory.timeStampForNow();
            entityData.createdBy = user._emailId;
            entityData.archived = "No";
            entityData.archivedOn = "";
            entityData.archivedBy = "";
            entityData.updatedBy = "";
            entityData.updatedOn = "";
            revisedEntities.push(entityData);
            entityData = {};
        }
        entitiesReady.entities = revisedEntities;
        console.log("Entities array after upload");
        console.log(entitiesReady);
        botFactory.addNewModel(data).then(function (modelResult) { //V0.3
            console.log("From uploadModelCtrl controller to add widget" + modelResult);
            console.log(modelResult);
            var newModelID = modelResult.Data;
            growl.addSuccessMessage("Creating a New Model");
            botFactory.addNewModelIntent(intentsReady).then(function (intentResult) {//V0.3
                console.log("From uploadModelCtrl controller to add new Intents col for new model" + intentResult);
                console.log(intentResult);
                var newIntentID = intentResult.Data.intentIds;
                botFactory.pushIntentId(newModelID, newIntentID).then(function (intentIdInModelResult) {
                    console.log("uploaded Intents created successfully and stored its id in the intents array of modelInformation");
                    // $scope.activeModel.intents.push(newIntentID);
                    // var model = user.intents.concat(newIntentID);
                    // localStorageService.set("active_model", model);
                    // $scope.activeModel = model;

                })
            });
            botFactory.addModelEntitity(entitiesReady).then(function (entityResult) {//V0.3
                console.log("From Sort controller to add new Entity col for new model" + entityResult);
                console.log(entityResult);//todo add inserted Entity _id to modelinformation Entities array
                var newEntityID = entityResult.data.Data;
                botFactory.pushEntityId(newModelID, newEntityID).then(function (entityIdInModelResult) {
                    growl.addSuccessMessage("Adding Sample Entities to model");//Notifications on adding Entities sucessfully
                    $rootScope.$broadcast('refreshModelList');
                    close(userSelection, 500); // close, but give 500ms for bootstrap to animate
                });

            });
        })

    } // uploadAndSave END


}
]);*/
