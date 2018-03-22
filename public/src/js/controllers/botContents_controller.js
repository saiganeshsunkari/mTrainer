//Bot Contents Controller
app.controller('botContentsCtrl', ['$scope', '$location', 'botFactory', 'reusableFactory', 'localStorageService', '$timeout', '$rootScope', 'growl', 'userService', 'SweetAlert', 'nlpFactory', 'lodash', function($scope, $location, botFactory, reusableFactory, localStorageService, $timeout, $rootScope, growl, userService, SweetAlert, nlpFactory, lodash) {
    $rootScope.$broadcast('loginSuccess'); // this broadcasts when the user is succefully logged into the app
    userService.checkUserLogin(); //check for user login(Change is accordingly when token based auth is defined)
    //** botContentsCtrl Styling Start**//
    $scope.editableDescription = false;
    $scope.publishing = false;
    $scope.training = false;
    $scope.trainingComplete = false;
    //Contents get header margin
    var sticks = $('.top-bar').height();
    $('.panel-content').css({
        "margin-top": sticks
    });

    function checkIfExists(arrayOfObjects, key, object) {
        return lodash.some(arrayOfObjects, function(eachObject) {
            return eachObject[key].toUpperCase() == object[key].toUpperCase();
        });
    }

    //**Chat Panel icon Start **//
    $(".chat-icon").on('click', function() {
        $(this).css('display', 'none');
        $(".chat-icon").addClass('active');
        $(".slide-panel").addClass('active');
        $('.panel-content').addClass('chat-active');
    });
    $scope.tab = 1; //Set Active tab on the botcontents page
    $rootScope.$on('loadSummaryTab', function() { //If user cliccked on the summary icon of the specific model
        $scope.tab = 1;
    });

    $scope.setTab = function(tabID) {
        $scope.tab = tabID;
    };

    $scope.$on('changeTab', function(event, tabID) {
        //getting the models list from homeHeaderCtrl
        $scope.tab = tabID;

    });

    //Function to Broadcast changes to User Report
    function getavailableModelsList() {
        botFactory.availableModels().then(function(bots) {
            $rootScope.models = bots.Data;
            $rootScope.$broadcast('modelsLoaded', bots);
        });
    }

    //Intents Tab Styling Start
    // MOVED to app.run() as it needs to loaded only once
    //Intents Tab Styling End

    //** botContentsCtrl Styling end**//

    $scope.activeModel = localStorageService.get("active_model");
    var user = localStorageService.get("user");

    ///*** Entities tab Start here***///
    // entity added here
    $scope.dynamicObjects = [];
    $scope.entities = [];

    // $scope.init = function () {
    //     var pre = {
    //
    //         "entityName": "pizza_type",
    //         "archived": "false",
    //         "archivedOn": "null",
    //         "archivedBy": "null",
    //         "createdOn": new Date(),
    //         "createdBy": "admin",
    //         "updatedOn": "null",
    //         "updatedBy": "null"
    //     };
    //
    //     $scope.entities.push(pre);
    //     $scope.dynamicObjects.push("pizza_type");
    // };

    $scope.saveModelChanges = function(changedProperties) {
        var updateData = lodash.pick($scope.activeModel, changedProperties);
        var data = {
            _id: $scope.activeModel._id,
            updateData: updateData
        };
        botFactory.editModel(data).then(function(result) {
            //succesfull change of the description.
            growl.addSuccessMessage("Model Updated");
            localStorageService.set("active_model", $scope.activeModel);
        }, function() {
            growl.addErrorMessage("Model Updated");
            $scope.activeModel = localStorageService.get("active_model");
            //does not change desc.
        });
    }

    $scope.botEntities = {};
    //  entityId = $scope.activeModel._modelId + '_' + $scope.botEntities.newEntity
    $scope.addNewEntity = function() {
        console.log("from add entity" + $scope.botEntities.newEntity);
        var entityarr = [],
            entityReady = {};
        //    activeModel = localStorageService.get("active_model");
        console.log('Hello m active model on botcontents_controller');

        var temp = {

            "entityName": $scope.botEntities.newEntity,
            "entityId": $scope.activeModel._modelId + '_' + $scope.botEntities.newEntity,

        };
        var currentEntities = $scope.activeModel.entities;


        function checkForEntities(currentEntities, temp) {

            if (temp.entityName != undefined && temp.entityName != "") {
                var boolArr = [];
                console.log(currentEntities.length);
                for (var i = 0; i < currentEntities.length; i++) {
                    var bool = false;

                    if (currentEntities.length == 0) {
                        entityarr.push(temp);
                        console.log(entityarr);
                    } else {

                        while (currentEntities[i].entityName.toUpperCase() == temp.entityName.toUpperCase()) {
                            bool = true;
                            break;
                        }
                    }
                    boolArr.push(bool);

                }
            } else {
                growl.addErrorMessage("Please enter a valid entity name  ");
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
            console.log(boolArr);
            console.log(boolArr.contains(true));

            return boolArr.contains(true);

        }

        var check = checkForEntities(currentEntities, temp);
        console.log(check);

        if (checkForEntities(currentEntities, temp) == false) {

            entityarr.push(temp);


        } else {
            growl.addErrorMessage("Please enter a different entity name  ");

        }

        console.log(entityarr);

        entityReady.entities = entityarr;
        //  var newEntityID = response.data.Data;
        if (entityarr.length != 0) {
            var newModelID = "";
            botFactory.addModelEntitity(entityReady, newModelID).then(function(response) {
                console.log("Entity added Successfully");
                entityReady.entities.forEach(function(elem) {
                    $scope.activeModel.entities.push(elem);
                })
                localStorageService.set("active_model", $scope.activeModel);
                //  getModelEntities();
                growl.addSuccessMessage("New Entity created Successfully"); //notify when the Entity is created
                //$rootScope.$broadcast('refreshModelList');
                getavailableModelsList();
            });


        }
        //    });
        /*$scope.entities.unshift(temp);
        $scope.dynamicObjects.unshift($scope.botEntities.newEntity);*/
        $scope.botEntities.newEntity = undefined;


    };
    $scope.renamedEntity = {};
    console.log($scope.intents);
    $scope.editEntity = function(entity, $event, $index) {
        //check if entitity is mapped to an intent
        var oldEntityVal = entity.entityName;
        var newEntityVal = $($event.currentTarget).parent().siblings().find('.entity-edit-input').val();
        $scope.activeModel.entities[$index].entityName = newEntityVal;
        $scope.activeModel.lastUpdated = new Date();
        entity.editable = null;
        var data = {
            _id: $scope.activeModel._id,
            updateData: {
                lastUpdated: $scope.activeModel.lastUpdated,
                entities: $scope.activeModel.entities
            }
        };
        botFactory.editModelEntity(data).then(function(editModelEntityResponse) {
            growl.addSuccessMessage("Entity Changed to <strong>" + newEntityVal + "</strong>.");
            saveRenamedEntityInIntents(oldEntityVal, newEntityVal);
            localStorageService.set("active_model", $scope.activeModel);
        }, function(editModelEntityError) {
            growl.addErrorMessage("Something went wrong. Could not change entity.");
            $scope.activeModel.entities[$index].entityName = oldEntityVal;
            localStorageService.set("active_model", $scope.activeModel);
        });
    }

    $scope.editEntity_old = function(value, entity, $event) { //TODO make database operation on entity editing
        //  var oldValue = $scope.dynamicObjects[value];
        //  console.log("old value is "+oldValue);
        var input_id = "#input_" + value;
        var button_id = "#button_" + value;
        var button1_id = "#button1_" + value;
        var entity_id = "#entity_" + value;
        var data = {};
        var enableEditingAnEntity = function() { // Enables to edit the entity name so that the text box appears
            $(input_id).addClass("active");
            $(button_id).removeClass("fa fa-edit");
            $(button_id).addClass("fa fa-floppy-o");
            $(button1_id).removeClass("deactive");
            $(entity_id).hide();
            $("[id^=input_]").not(input_id).removeClass("active");
            $("[id^=entity_]").not(entity_id).show();
            $("[id^=button1_]").not("#button1_" + value).click();
            $scope.renamedEntity.name = entity.entityName;
        };

        if ($(button_id).hasClass("fa-edit")) { // if clicks on Edit button
            if (checkForEntityInIntent(entity.entityName)) { // Checks for the presence for the selected entity in the mapping. If yes warns the user(on changing the entity name here results change in the mapping.),user accepts allow him to change. if he does not accept dont allow him to change
                console.log("Entity " + entity.entityName + " Is already present in the mapping");
                // var confirmForEntityEdit = confirm("The entity name is already associated with the Intent entity Mapping. If you change the entity name here it will reflect in the mapping as well.Doyou wish to continue");
                SweetAlert.swal({
                    title: "Are you sure?",
                    text: "The entity name is already associated with the Intent-Entity Mapping. If you change the entity name here it will reflect in the mapping as well.Do you wish to continue?",
                    type: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "Proceed",
                    cancelButtonText: "Cancel",
                    closeOnConfirm: true,
                    closeOnCancel: true
                }, function(isConfirm) {
                    if (isConfirm) {
                        enableEditingAnEntity();
                    } else {
                        // SweetAlert.swal("Cancelled", "Your imaginary file is safe :)", "error");
                    }
                });
                // if (confirmForEntityEdit) {
                //     enableEditingAnEntity();
                // } else {
                //     alert("you selected NO");
                // }
                // enableEditingAnEntity();
            } else {
                enableEditingAnEntity();


            }

        } else {
            var editedValue = $scope.renamedEntity.name;

            //   data.changedOn = reusableFactory.timeStampForNow();
            //     data.changedBy = user._emailId;
            if (editedValue !== undefined && editedValue !== "") {
                var oldValue = entity.entityName;
                data.editedValue = editedValue;
                data.oldValue = oldValue;
                console.log("entities set" + $scope.activeModel.entities);
                data.entities = $scope.activeModel.entities;

                entity.entityName = editedValue;

                entity.entityId = $scope.activeModel._modelId + "_" + editedValue;

                data.modelId = $scope.activeModel._id;

                console.log("data showing contents for entity edit");
                console.log(data);

                botFactory.editModelEntity(data).then(function(editModelEntityResponse) { //TODO notify on successful change
                    growl.addSuccessMessage("Entity Changed to <strong>" + editedValue + "</strong>.");
                    /* entityReady.entities.forEach(function(elem){
          $scope.activeModel.entities.push(elem);
        })*/

                    if (entityPresentInIntent) {
                        console.log(oldValue);

                        saveRenamedEntityInIntents(oldValue, editedValue);

                    } else {
                        //     getModelEntities();
                        getModelIntents();

                    }
                    localStorageService.set("active_model", $scope.activeModel);

                    $(input_id).removeClass("active");
                    $(button_id).removeClass("fa fa-floppy-o");
                    $(button_id).addClass("fa fa-edit");
                    $(button1_id).addClass("deactive");
                    $(entity_id).show();


                });

            } else {
                alert("Enter the rename value");
            }
            data = {};
        }
    };
    var entityPresentInIntent;

    var checkForEntityInIntent = function(entity) { // checks whether that entity needs to get renamed already in the Mapping(edit Entity)
        entityPresentInIntent = false;
        var intents = $scope.intents;
        console.log(intents);
        if (intents) {
            console.log("if")
            console.log(intents.length);
            for (var i = 0; i < intents.length; i++) {
                console.log(intents[i].intent);
                for (var u = 0; u < intents[i].utterances.length; u++) {
                    //  console.log(intents[i].utterances[u].utterance);
                    if (intents[i].utterances[u].entities != undefined) {

                        for (var e = 0; e < intents[i].utterances[u].entities.length; e++) {
                            console.log(intents[i].utterances[u].entities.length);
                            // console.log(intents[i].utterances[u].entities[e]);
                            // console.log(intents[i].utterances[u].entities[e].entity + " === " + entity);
                            if (intents[i].utterances[u].entities[e].entity === entity) {
                                entityPresentInIntent = true;
                                console.log('testing');
                                return true;
                            }
                        }

                    }
                }
            }
        } else {
            console.log("Hey")
            return false;
        }
    };
    var saveRenamedEntityInIntents = function(oldValue, newEntity) { // checks whether that entity needs to get renamed already in the Mapping(edit Entity)
        var intents = $scope.intents;

        var oldEntity = oldValue;
        console.log(oldEntity);
        var changeInIntents = [],
            changeInIntentsFinal = [];
        /*var changeInSingleIntent={};*/
        for (var i = 0; i < intents.length; i++) {

            for (var u = 0; u < intents[i].utterances.length; u++) {
                for (var e = 0; e < intents[i].utterances[u].entities.length; e++) {

                    if (intents[i].utterances[u].entities[e].entity === oldEntity) {
                        intents[i].utterances[u].entities[e].entity = newEntity;
                        console.log(intents[i]);
                        changeInIntents.push(intents[i]);
                    }
                }
            }

        }
        console.log(changeInIntents);
        for (var i = 0; i < changeInIntents.length; i++) {
            if ((i !== 0) && (changeInIntents[i]._id === changeInIntents[i - 1]._id)) {
                changeInIntents.splice(i - 1, 1);
                i--;
            }
        }
        console.log(changeInIntents);
        if (changeInIntents.length !== 0) {
            botFactory.updateEntityInIntents(changeInIntents).then(function(updateEntityInIntentsResponse) {
                //       getModelEntities();
                getModelIntents();
                for (var i = 0; i < updateEntityInIntentsResponse.error.length; i++) {
                    if (updateEntityInIntentsResponse.error[i] === 0) {
                        growl.addSuccessMessage("Intent <strong> " + changeInIntents[i].intent + " </strong> Modified successfully ", {
                            ttl: (i * 1000) + 3000
                        });
                    } else {
                        growl.addErrorMessage("Problem in Modifying Intent <strong>" + changeInIntents[i].intent + "</strong>");
                    }
                }
            })
        }

    };

    $scope.noChange = function(value) {
        var input_id = "#input_" + value;
        var button_id = "#button_" + value;
        var button1_id = "#button1_" + value;
        var entity_id = "#entity_" + value;
        $(input_id).removeClass("active");
        $(entity_id).show();
        $(button_id).removeClass("fa fa-floppy-o");
        $(button_id).addClass("fa fa-edit");
        $(button1_id).addClass("deactive");
    };

    $scope.removeEntity = function(entity) {
        // var createdBy = $scope.entities[value].createdBy;
        // var entityName = $scope.entities[value].entityName;
        console.log(entity);
        var entityId = entity.entityId;
        var entityName = entity.entityName;
        var entities = $scope.activeModel.entities;
        console.log(entities);
        console.log(entityId);

        SweetAlert.swal({
            title: "Are you sure?",
            text: "Removing Entity here will also effects with deleting the mappings if associated with this Entity in the Intent-Entity Mapping. Do you wish to continue?",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Proceed",
            cancelButtonText: "Cancel",
            closeOnConfirm: true,
            closeOnCancel: true
        }, function(isConfirm) {

            if (isConfirm) {
                console.log(checkForEntityInIntent(entity.entityName));
                if (checkForEntityInIntent(entity.entityName)) { ///TODO obtain the intents and identify the utterances withmappings delete them and save to intents

                    var model = $scope.activeModel,
                        modifiedIntents;
                    console.log(model);
                    //if (checkForEntityInIntent(entity.entityName)) {///TODO obtain the intents and identify the utterances withmappings delete them and save to intents
                    modifiedIntents = intentsAfterEntityDelete(entity.entityName);

                    console.log(modifiedIntents);
                    if (modifiedIntents) {
                        botFactory.updateEntityInIntents(modifiedIntents).then(function(updateEntityInIntentsResponse) {
                            for (var i = 0; i < updateEntityInIntentsResponse.error.length; i++) {
                                if (updateEntityInIntentsResponse.error[i] === 0) {
                                    growl.addSuccessMessage("Mapping in intent <strong>" + modifiedIntents[i].intent + "</strong> deleted", {
                                        ttl: (i * 1000) + 3000
                                    });
                                } else {
                                    growl.addErrorMessage("Error deleting mapping in Intent <strong>" + modifiedIntents[i].intent + "</strong>");
                                }
                            }
                            if (updateEntityInIntentsResponse.error.indexOf(1) === -1) {

                                console.log(entities);
                                for (var i = 0; i < entities.length; i++) {
                                    var deleteEntity = entities[i];

                                    if (deleteEntity.entityName === entityName) {
                                        entities.splice(i, 1);

                                    }
                                }
                                console.log(entities);
                                var data = {};
                                data.entities = entities;
                                data.modelId = $scope.activeModel._id;

                                botFactory.deleteModelEntity(data).then(function(deleteModelEntityResponse) {
                                    //     botFactory.pullEntityId(entityId).then(function (pullEntityIdResponse) {
                                    console.log("Entity Deleted Sucessfully");
                                    model = $scope.activeModel;
                                    localStorageService.set("active_model", model);
                                    $scope.activeModel = model;
                                    //$rootScope.$broadcast('refreshModelList');
                                    getavailableModelsList();
                                    //     getModelEntities();
                                    growl.addInfoMessage("Entity <strong>" + entity.entityName + "</strong> Deleted Successfully"); //notify Entity deleted successfully
                                });
                                //    });
                            } else {
                                growl.addErrorMessage("Error in deleting the Entity <strong>" + entity.entityName + "</strong>.");
                            }

                        })
                    }
                } else {

                    // entity.entityName = entityName;
                    //
                    // entity.entityId = $scope.activeModel._modelId +"_" + editedValue ;
                    for (var i = 0; i < entities.length; i++) {
                        var deleteEntity = entities[i];

                        if (deleteEntity.entityName === entityName) {
                            entities.splice(i, 1);

                        }
                    }

                    console.log(entities);
                    var data = {};
                    data.entities = entities;
                    data.modelId = $scope.activeModel._id;

                    botFactory.deleteModelEntity(data).then(function(deleteModelEntityResponse) {
                        //      botFactory.pullEntityId(entityId).then(function (pullEntityIdResponse) {
                        console.log("Entity Deleted Sucessfully");
                        model = $scope.activeModel;
                        localStorageService.set("active_model", model);
                        $scope.activeModel = model;
                        //$rootScope.$broadcast('refreshModelList');
                        getavailableModelsList();
                        //       getModelEntities();
                        growl.addInfoMessage("Entity <strong>" + entity.entityName + "</strong> Deleted Successfully"); //notify Entity deleted successfully
                        //    });
                    });
                }


            } else {
                // SweetAlert.swal("Cancelled", "Your imaginary file is safe :)", "error");
            }
        });


        var intentsAfterEntityDelete = function(entity) {
            console.log($scope.intents);
            var intents = $scope.intents,
                intentsAfterCleaning = [],
                cleaned = false;
            for (var i = 0; i < intents.length; i++) {

                for (var u = 0; u < intents[i].utterances.length; u++) {
                    if (intents[i].utterances[u].entities != undefined) {
                        for (var e = 0; e < intents[i].utterances[u].entities.length; e++) {
                            if (intents[i].utterances[u].entities[e].entity === entity) {
                                intents[i].utterances[u].entities.splice(e, 1);
                                cleaned = true;
                                e--;
                            }
                        }
                    }
                }
                if (cleaned) {
                    intentsAfterCleaning.push(intents[i]);
                }
                cleaned = false;
            }
            console.log(intentsAfterCleaning);
            return intentsAfterCleaning;

        }
    };

    // function getModelEntities() {
    //     botFactory.getModelEntities().then(function (entitiesInfo) {
    //         console.log("From Sort controller 'getModelEntities'" + entitiesInfo);
    //         console.log(entitiesInfo);
    //         $scope.entities = entitiesInfo;
    //     });
    // }

    // getModelEntities();

    //** Entity Tab end**//

    //***INTENTS TAB START***//

    //**Request for bot INTENTS based on modelId and orgId **//
    getModelIntents();

    function getModelIntents() {
        botFactory.getModelIntents().then(function(intentsInfo) {
            console.log("From Sort controller 'getModelIntents'" + intentsInfo);
            console.log(intentsInfo);
            $scope.intents = intentsInfo.Data;
            //    console.log($scope.intents);
            //    console.log($scope.entities);
        });
    }

    $scope.newIntentContents = {};
    $scope.addNewIntent = function() {
        if ($scope.intents == undefined)
            $scope.intents = [];
        // console.log("clicked the test btn");
        var brandNewIntent = {};
        var intentsArray = [],
            intentReady = {
                intents: []
            };
        brandNewIntent.intent = $scope.newIntentContents.intent;

        brandNewIntent.utterances = [];
        var currentIntents = $scope.intents;

        //if intents collection is an array and if is not-empty
        if (Array.isArray($scope.intents) && $scope.intents.length != 0) {
            if (checkIfExists($scope.intents, 'intent', brandNewIntent)) {
                growl.addErrorMessage("Please choose a different intent name.");
            } else {
                intentsArray.push(brandNewIntent);
            }
        } else {
            $scope.intents = [];
            intentsArray.push(brandNewIntent);
        }

        //
        intentReady.intents = intentsArray;
        // console.log(brandNewIntent);
        if (intentsArray.length != 0) {
            botFactory.addNewModelIntent(intentReady).then(function(intentResult) { //V0.3
                console.log("From Sort controller to add new Intent col for new model");
                console.log(intentResult);
                var newIntentID = intentResult.Data.intentIds;
                var newModelID = "";
                botFactory.pushIntentId(newModelID, newIntentID).then(function(intentIdInModelResult) {
                    console.log("sample Intent created successfully and stored its id in the intents array of modelInformation");
                    $scope.activeModel.intents.push(newIntentID[0]);
                    localStorageService.set("active_model", $scope.activeModel);
                    brandNewIntent._id = newIntentID.toString(); //Passive loading
                    $scope.intents.push(brandNewIntent); //Passive loading
                    // getModelIntents();//Passive loading
                    growl.addSuccessMessage("Intent added Successfully");
                    //$rootScope.$broadcast('refreshModelList');
                    getavailableModelsList();
                });

            });
        }
        $scope.newIntentContents = {};
    }; //addNewIntent ends

    $scope.enableRenameIntent = 'no';
    $scope.changedIntent = {};
    $scope.renameIntent = function(currentIntent, $event) {
        currentIntent.editable = true;
        // $scope.changedIntent.name = currentIntent;
        // $scope.enableRenameIntent = 'yes';
    };

    $scope.cancelRenameIntent = function(intent) {
        intent.editable = false;;
    };

    $scope.saveRenamedIntent = function(intent, $event) {
        var changedIntentName = $($event.currentTarget).siblings(".renameIntentInput").val()
        botFactory.renameIntent(intent._id, changedIntentName).then(function(renameIntentResponse) {
            $scope.intents[giveIntentPosition(intentId)].intent = $scope.changedIntent.name;
            growl.addSuccessMessage("Intent renamed successfully");
        });
        intent.intent = changedIntentName;
        intent.editable = false;
    };

    $scope.deleteIntent = function(intent) {
        var intentId = intent._id;
        console.log(intentId);

        SweetAlert.swal({
            title: "Are you sure?",
            text: "Do you wish to continue deleting the Intent '" + intent.intent + "' ?",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Proceed",
            cancelButtonText: "Cancel",
            closeOnConfirm: true,
            closeOnCancel: true
        }, function(isConfirm) {
            if (isConfirm) {
                var count = 0;
                botFactory.deleteModelIntent(intentId).then(function(deleteModelIntentResponse) {
                    botFactory.pullIntentId(intentId).then(function(pullIntentIdResponse) {
                        /*console.log("Entity Deleted Sucessfully");
                        var model = $scope.activeModel;

                        model = $scope.activeModel;
                        localStorageService.set("active_model", model);
                        $scope.activeModel = model;
                        */
                        // getModelIntents(); //Passive LOading

                        var position = giveIntentPosition(intentId);
                        $scope.intents.splice(position, 1);

                        growl.addSuccessMessage("Intent Deleted Successfully");
                        $rootScope.$broadcast('refreshModelList');
                        getavailableModelsList();
                    });
                });

            } else {
                // SweetAlert.swal("Cancelled", "Your imaginary file is safe :)", "error");
            }
        });


    };
    var giveIntentPosition = function(selectedIntent) {
        for (var i = 0; i < $scope.intents.length; i++) {
            if ($scope.intents[i]._id === selectedIntent) {
                return i;
            }
        }
    };
    var utterancePosition = function(intentPos, utterance) {
        for (var u = 0; u < $scope.intents[intentPos].utterances.length; u++) {
            if ($scope.intents[intentPos].utterances[u].utterance === utterance) {
                return u;
            }
        }
    };

    $scope.addNewUtterance = function(intent) {
        var brandNewUtterance = {},
            position = giveIntentPosition(intent._id);
        brandNewUtterance.utterance = $scope.newIntentContents.utterance;
        brandNewUtterance.entities = [];
        console.log(brandNewUtterance);
        console.log(intent._id);
        botFactory.addNewUtterance(brandNewUtterance, intent._id).then(function(utteranceInfo) {
            console.log("From botcontents controller after adding an utteranceInfo 'addNewUtteranceToModel'" + utteranceInfo);
            console.log(utteranceInfo);
            // getModelIntents()//Passive Loading
            $scope.intents[position].utterances.push(brandNewUtterance);
            growl.addSuccessMessage("Utterance added Successfully.");
        });
        $scope.newIntentContents = {};
    };

    $scope.deleteUtterance = function(utterance, fromIntent) {
        var intentPos = giveIntentPosition(fromIntent._id); // Passive Loading
        var utterancePos = utterancePosition(intentPos, utterance); // Passive Loading
        console.log("Utterance selected to delete: " + utterance);
        console.log("from Intent" + fromIntent._id);
        botFactory.deleteUtterance(utterance, fromIntent._id).then(function(deleteUtteranceResponse) {
            // getModelIntents(); // Passive Loading
            $scope.intents[intentPos].utterances.splice(utterancePos, 1); // Passive Loading
            growl.addSuccessMessage("Utterance Deleted Successfully.");
            console.log(deleteUtteranceResponse);
        });
    };

    /* function getSelectionCharOffsetsWithin(element) { //previous LOGIC FOR SELECTING THE TEXT AND START AND ENDPOINTS
    var start = 0, end = 0;
    var sel, range, priorRange;
    if (typeof window.getSelection != "undefined") {
    range = window.getSelection().getRangeAt(0);
    priorRange = range.cloneRange();
    priorRange.selectNodeContents(element);
    priorRange.setEnd(range.startContainer, range.startOffset);
    start = priorRange.toString().length;
    end = start + range.toString().length;
    } else if (typeof document.selection != "undefined" &&
    (sel = document.selection).type != "Control") {
    range = sel.createRange();
    priorRange = document.body.createTextRange();
    priorRange.moveToElementText(element);
    priorRange.setEndPoint("EndToStart", range);
    start = priorRange.text.length;
    end = start + range.text.length;
    }
    return {
    start: start,
    end: end
    };
    }
    $scope.alertSelection = function () {
    var mainDiv = document.getElementById("valueSelection");
    var sel = getSelectionCharOffsetsWithin(mainDiv);
    $scope.newIntentContents.selectedValue = "";
    alert(sel.start + ": " + sel.end + "__" + window.getSelection());
    $scope.newIntentContents.selectionstart = sel.start;
    $scope.newIntentContents.selectionend = sel.end;
    $scope.newIntentContents.selectedValue = window.getSelection().toString();
    console.log($scope.newIntentContents.selectedValue);
    };*/

    // $(document).ready(function() {
    /*$('#valueSelection').bind('updateInfo keyup mousedown mousemove mouseup', function(event) {
    if (document.activeElement !== $(this)[0]) {
    return;
    }

    var range = $(this).textrange();

    $('#info .property').each(function() {
    if (typeof range[$(this).attr('id')] !== 'undefined') {
    if ($(this).attr('id') === 'text') {
    range[$(this).attr('id')] = range[$(this).attr('id')].replace(/\n/g, "\\n").replace(/\r/g, "\\r");
    }

    $(this).children('.value').html(range[$(this).attr('id')]);
    }
    });
    });*/
    $scope.selectWord = function($event) {
        var t = '';
        if (window.getSelection && (sel = window.getSelection()).modify) {
            // Webkit, Gecko
            var s = window.getSelection();
            if (s.isCollapsed) {
                s.modify('move', 'forward', 'character');
                s.modify('move', 'backward', 'word');
                s.modify('extend', 'forward', 'word');
                t = s.toString();
                s.modify('move', 'forward', 'character'); //clear selection
            } else {
                t = s.toString();
            }
        } else if ((sel = document.selection) && sel.type != "Control") {
            // IE 4+
            var textRange = sel.createRange();
            if (!textRange.text) {
                textRange.expand("word");
            }
            // Remove trailing spaces
            while (/\s$/.test(textRange.text)) {
                textRange.moveEnd("character", -1);
            }
            t = textRange.text;
        }
        $scope.newIntentContents.selectedValue = t;
        var textActual = $($event.currentTarget).text();
        $scope.newIntentContents.selectionstart = textActual.indexOf(t);
        $scope.newIntentContents.selectionend = $scope.newIntentContents.selectionstart + t.length;
        console.log($scope.newIntentContents);
        $($event.currentTarget).html(textActual);
        var currentTarget = $($event.currentTarget).html();
        $($event.currentTarget).html(currentTarget.replace($scope.newIntentContents.selectedValue, '<span class="strong"> $&</span>'));
        currentTarget = $($event.currentTarget).html();
    }

    $scope.newIntentContents.selectedValue = "";

    // $scope.showMappingDiv= false;
    $scope.cancelNewEntityMapping = function() {
        // $scope.showMappingDiv= false;
        $scope.newIntentContents = {};
    };
    $scope.saveNewEntityMapping = function(toIntent, toUtterance) {
        var newEntityMapping = {};
        var pushTo = {},
            entityExists = false,
            intentPos = giveIntentPosition(toIntent),
            utterancePos = utterancePosition(intentPos, toUtterance);
        newEntityMapping.entity = $scope.newIntentContents.selectedEntity;
        newEntityMapping.value = $scope.newIntentContents.selectedValue;
        newEntityMapping.start = $scope.newIntentContents.selectionstart;
        newEntityMapping.end = $scope.newIntentContents.selectionend;

        console.log("Selected Entity" + JSON.stringify($scope.newIntentContents.selectedEntity));
        console.log("Selected Entity" + JSON.stringify(newEntityMapping));
        console.log("Intent" + toIntent);
        console.log("Utterance" + toUtterance);
        // $scope.showMappingDiv= false;
        pushTo.intentId = toIntent;
        pushTo.utterance = toUtterance;
        for (var i = 0; i < $scope.activeModel.entities.length; i++) {
            console.log($scope.activeModel.entities[i].entityName);
            console.log(newEntityMapping.entity);
            if ($scope.activeModel.entities[i].entityName === newEntityMapping.entity) {
                entityExists = true;
            }
        }
        if (entityExists) {
            console.log(newEntityMapping);
            console.log(pushTo);
            botFactory.newEntityMapping(newEntityMapping, pushTo).then(function(mappingInfo) {
                console.log("From botcontents controller after adding newEntityMapping 'saveNewEntityMapping'" + mappingInfo);
                console.log(mappingInfo);
                // getModelIntents();
                console.log($scope.intents);
                console.log($scope.intents[intentPos].utterances);
                console.log($scope.intents[intentPos].utterances[utterancePos])
                if ($scope.intents[intentPos].utterances[utterancePos].entities != undefined) {
                    $scope.intents[intentPos].utterances[utterancePos].entities.push(newEntityMapping);
                } else if ($scope.intents[intentPos].utterances[utterancePos].entities == undefined) {
                    var entities = [];
                    entities.push(newEntityMapping);
                    $scope.intents[intentPos].utterances[utterancePos]["entities"] = entities;
                }

                growl.addSuccessMessage("Mapping added successfully");
            });
        } else {
            growl.addErrorMessage("Your selection is not present in Entities.");
            growl.addInfoMessage("Select from existing entities or create a new Entity.", {
                ttl: 6000
            })
        }

        pushTo = {};
        $scope.newIntentContents = {};
    };

    $scope.deleteMapping = function(intent, utterance, mappingInfo) {
        var intentPos = giveIntentPosition(intent),
            utterancePos = utterancePosition(intentPos, utterance);
        console.log("Intent Id: " + intent);
        console.log("utterance: " + utterance);
        console.log("Mapping Info: " + JSON.stringify(mappingInfo));
        botFactory.deleteAMapping(intent, utterance, mappingInfo).then(function(deleteAMappingResponse) {
            console.log("Successfully deleted a mapping");
            console.log(deleteAMappingResponse);
            for (var m = 0; m < $scope.intents[intentPos].utterances[utterancePos].entities.length; m++) {
                var existingMapping = $scope.intents[intentPos].utterances[utterancePos].entities[m];
                if (existingMapping.entity === mappingInfo.entity && existingMapping.value === mappingInfo.value && existingMapping.start === mappingInfo.start) {
                    //   alert("mapping found");
                    $scope.intents[intentPos].utterances[utterancePos].entities.splice(m, 1);
                }
            }
            // getModelIntents();//TODO notification for Mapping successfully deleted

        })
    };

    // var activeModel = localStorageService.get("active_model");
    var modelIntentsPosChange;
    $scope.intentMoveUp = function(modelId) {
        modelIntentsPosChange = $scope.activeModel;
        var index;
        $(".moveIntentPosUp").unbind().click(function() {
            event.stopPropagation();
            index = $(this).parents("li").prop('className');
            index = index.split("_").pop();

            if (index > 0) {
                var currentIntent = ".intent_" + index;
                var currentClass = "intent_" + index;
                var previousIntent = ".intent_" + (index - 1);
                var previousClass = "intent_" + (index - 1);
                console.log(currentIntent);
                console.log(previousIntent);
                $(previousIntent).insertAfter($(currentIntent));
                $(previousIntent).removeClass(previousClass).addClass("temp");
                $(currentIntent).removeClass(currentClass).addClass(previousClass);
                $(".temp").removeClass("temp").addClass(currentClass);

                console.log(modelIntentsPosChange.intents);
            }

        });
    };

    $scope.intentMoveDown = function() {
        var index;
        $(".moveIntentPosDown").unbind().click(function() {
            event.stopPropagation();
            index = $(this).parents("li").prop('className');
            index = index.split("_").pop();

            if (index < $scope.intents.length - 1) {
                var currentIntent = ".intent_" + index;
                var currentClass = "intent_" + index;
                var indexToBe = parseInt(index) + 1;
                var nextIntent = ".intent_" + indexToBe;
                var nextClass = "intent_" + indexToBe;

                console.log(currentIntent);
                console.log(nextIntent);
                $(currentIntent).insertAfter($(nextIntent));
                $(nextIntent).removeClass(nextClass).addClass("temp");
                $(currentIntent).removeClass(currentClass).addClass(nextClass);
                $(".temp").removeClass("temp").addClass(currentClass);
            }

        });
    };


    $scope.$on('modelCreateDelete', function() {
        getavailableModelsList(); // loading the bots onto the dashboard on load depends on organization TODO pass _orgId
    });
    //***INTENTS TAB END***//

    //*** Dashboard tab Start here ***//
    // var entities = $scope.entities;
    // var intents = $scope.intents;
    //     console.log($scope.entities.length + " Entities");
    // console.log($scope.intents.length + " Intents");
    // console.log($scope.intents.length+" intents");
    $scope.exportCurrentModel = function() { //Export the the selected model's training data

        var modelJson = getNLPCompaitableJson();
        console.log(modelJson);
        if (typeof modelJson === 'undefined' || modelJson === null || modelJson === "") {
            return;
        }

        var link = document.createElement("a");
        link.download = $scope.activeModel.name.toLocaleLowerCase() + "_mTrainer_model.json";
        var data = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(modelJson));
        link.href = "data:" + data;
        link.click();
    };


    $scope.isTraining = "hide";
    $scope.trained = "hide";

    var getNLPCompaitableJson = function() { //returns the NLP acceptable Output
        if ($scope.activeModel.intents.length === 0 && $scope.activeModel.entities.length === 0) {
            growl.addInfoMessage("Selected model is empty.");
        } else if ($scope.activeModel.intents.length === 0) {
            growl.addInfoMessage("Selected model's Intents are empty.");
        } else {
            var intentsToPublish = $scope.intents;
            var unitInRasa = {
                "text": "",
                "intent": "",
                "entities": ""
            };
            var readyToPublishModel = {
                "rasa_nlu_data": {}
            };
            var rasaUnits = [];
            console.log("intentsToPublish");
            console.log(intentsToPublish);

            for (var intentPublish = 0; intentPublish < intentsToPublish.length; intentPublish++) {
                for (var utterancePublish = 0; utterancePublish < intentsToPublish[intentPublish].utterances.length; utterancePublish++) {
                    console.log("object " + (utterancePublish + 1) + " for RASA");
                    unitInRasa.text = intentsToPublish[intentPublish].utterances[utterancePublish].utterance;
                    unitInRasa.intent = intentsToPublish[intentPublish].intent;
                    unitInRasa.entities = intentsToPublish[intentPublish].utterances[utterancePublish].entities;
                    console.log(unitInRasa);
                    rasaUnits.push(unitInRasa);
                    unitInRasa = {};
                    /*console.log(intentsToPublish[intentPublish].utterances[utterancePublish].utterance);
                    console.log(intentsToPublish[intentPublish].intent);
                    console.log(intentsToPublish[intentPublish].utterances[utterancePublish].entities);*/
                }
            }
            console.log(rasaUnits);
            readyToPublishModel.rasa_nlu_data.common_examples = rasaUnits;
            return readyToPublishModel;
        }
    };

    //***PUBLISH & TRAIN TAB START***//
    function animateProgressBar() {
        var elem = $('.progress');
        var width = 1;
        var id = setInterval(frame, 50);

        function frame() {
            if (width == 70) {
                clearInterval(id);
                $scope.finish();
                // $('.training-ongoing').slideUp();
                // setTimeout(function() {
                //     $scope.trainingComplete = false;
                // }, 500);
            } else {
                width++;
                elem.width(width + '%');
            }
        }
    }

    $scope.finish = function() {
        $scope.training = false;
        $scope.trainingComplete = true;
    }
    $scope.trainModel = function() {
        $scope.publishing = false;
        var modelToNlp = {};
        modelToNlp = getNLPCompaitableJson();
        // $('.training-ongoing').slideDown();
        if (typeof(modelToNlp) === 'undefined') {

        } else {
            $scope.training = true;
            nlpFactory.trainNlp(modelToNlp).then(function(result) {
				
				console.log(result);
				
                if (result.data.info) {
                    console.log("Got back");
                    $scope.training = false;
                    $scope.trainingComplete = true;
                    $timeout(function() {
                        $scope.trainingComplete = false;
                    }, 5000);
                    $scope.activeModel.trainedOn = new Date();
                    $scope.saveModelChanges(['trainedOn'])
                } else {
                    $scope.training = false;
                    console.log("Error Training");
                    growl.addErrorMessage("Encountered a problem in training.")
                }
            });
        }
        // animateProgressBar();
    }
    $scope.publish = function() {
        console.log($scope.intents);
        var modelToNlp = {};

        modelToNlp = getNLPCompaitableJson();
        console.log("readyToPublishModel");
        console.log(modelToNlp);
        if (typeof(modelToNlp) === 'undefined') {

        } else {
            $scope.isTraining = "show";

            growl.addInfoMessage("Training started.");
            nlpFactory.trainNlp(modelToNlp).then(function(result) {

                if (result.data.info) {
                    $scope.trained = "show";
                    $timeout(function() {
                        $scope.trained = "hide";
                    }, 5000);
                    $scope.isTraining = "hide";
                    console.log("From botcontents controller after training the Model" + JSON.stringify(result));
                    growl.addSuccessMessage("Training Successful.");
                } else if (result.data.error) {
                    $scope.isTraining = "hide";
                    growl.addErrorMessage("Encountered a problem in training.")
                }

            });

        }

    };

    $scope.publishModel = function() {
        $scope.publishing = true;
        $scope.activeModel.publishedOn = new Date();
        $scope.activeModel.publishMode = 'published';
        var data = {
            _modelId: $scope.activeModel._modelId,
            name: $scope.activeModel.name,
            user: $scope.activeModel.user,
            createdOn: $scope.activeModel.createdOn,
            publishedOn: $scope.activeModel.publishedOn,
            publishMode: $scope.activeModel.publishMode
        };
        nlpFactory.publishModel(data).then(function(result) {
            $scope.activeModel.modelURL = result.data.API;
            $scope.API = result.data.API;
            $scope.token = result.data.token;
            $scope.saveModelChanges(['publishedOn', 'publishMode', 'modelURL'])
            console.log(result);
        }, function(error) {
            console.log(error);
            //api call fails
        })
    }

    $scope.copyText = function(target, $event) {
        var element = $(target);
        element.select();
        document.execCommand("Copy");
        $($event.currentTarget).html("Copied!")
        $timeout(function() {
            $($event.currentTarget).html("<span class='fa fa-fw fa-copy'></span>")
        }, 5000);
    };

    //***PUBLISH & TRAIN TAB END***//
}]);
