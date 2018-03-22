// Sort Controller //dashboard on which the models are present
app.controller('SortCtrl', ['$scope', '$location', '$http', 'botFactory', 'ModalService', 'localStorageService', 'userService', '$rootScope', 'growl', '$timeout', 'SweetAlert', function($scope, $location, $http, botFactory, ModalService, localStorageService, userService, $rootScope, growl, $timeout, SweetAlert) {
    userService.checkUserLogin(); //check for user login(Change is accordingly when token based auth is defined)
    $rootScope.$broadcast('loginSuccess'); // this broadcasts when the user is succefully logged into the app
    console.log("Entered SORT controller");
    //Check whether the browser supports the Local storage
    if (!localStorageService.isSupported) {
        alert("Please update your browser for working with is website.");
    }

    $scope.loadSummarytab = function() { //if User selects the Summary of the Model
        $timeout(function() {
            $rootScope.$broadcast('loadSummaryTab');
        })
    };
    // Get Header Height //
    var sticks = $('.top-bar').height();
    $('.panel-content').css({
        "margin-top": sticks // -8
    });

    // userService.getOrgName().then(function (response) { //Organizationname
    //     $scope.organization = response;
    // });

    $scope.takeToBotContents = function(bot) {
        localStorageService.set("active_model", bot);
        $location.path('/botcontents');
    };

    $scope.deleteModel = function(modelId) {
        // console.log("delete Model: " + modelId);
        event.stopPropagation();
        SweetAlert.swal({
                title: "Are you sure?",
                text: "You will not be able to recover this Model!",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes, delete it!",
                cancelButtonText: 'Cancel',
                closeOnConfirm: false,
                closeOnCancel: true
            },
            function(isConfirm) {
                if (isConfirm) {
                    botFactory.deleteModel(modelId).then(function(response) {
                        /*botFactory.deleteWholeEntitiesOfModel(modelId).then(function (response) {
                        botFactory.deleteWholeIntentsOfModel(modelId).then(function (response) {
                        getavailableModelsList();
                        console.log("Model's Entities Deleted Successfully");
                        console.log("Model's Intents Deleted Successfully");*/
                        for (var i = 0; i < $rootScope.models.length; i++) { //remove the deleted object
                            if ($rootScope.models[i]._modelId === modelId) {
                                $rootScope.models.splice(i, 1);
                            }
                        }
                        SweetAlert.swal({
                            title: "Deleted!",
                            text: "Selected Model has been deleted.",
                            timer: 2000,
                            type: "success"
                        });
                        $rootScope.$broadcast('refreshModelList');
                        growl.addSuccessMessage("Model Deleted Successfully"); //notification for model deleted successfully
                        console.log("Model Deleted Successfully");
                        $location.path("/home");

                        /*});
        });*/
                    });

                } else {
                    SweetAlert.swal("Cancelled", "Your imaginary file is safe :)", "error");
                }
            });

    };

    //**Create New Bot MODAL Start**//
    $scope.showAModal = function() {

        // Just provide a template url, a controller and call 'showModal'.
        ModalService.showModal({
            templateUrl: "public/src/partials/modals/createNewModelModal.html",
            controller: "createBotModalController"
        }).then(function(modal) {
            // The modal object has the element built, if this is a bootstrap modal
            // you can call 'modal' to show it, if it's a custom modal just show or hide
            // it as you need to.
            modal.element.modal();
            modal.close.then(function(result) {
                console.log(result);
                // $scope.message = (result === "Yes") ? "You said Yes" : growl.addErrorMessage("User canceled Creating a Model");
                if (result.error === 0) {
                    // getavailableModelsList();
                    $rootScope.$broadcast('refreshModelList');
                    growl.addSuccessMessage("Model Created Successfully");
                    console.log("Hey") //Notifications on sucessful bot creation or failure
                    console.log("bot list refreshed after adding a new bot");
                } else {
                    growl.addErrorMessage("Error in adding the new Model");
                    console.log("Error in creating a model OR unable to refresh the Dashboard");
                }

            });
        });

    };
    //**Create New Bot MODAL ENDS**//


    $scope.$on('refreshModelList', function() {
        getavailableModelsList();
    });
    //**Request for available bots / refresh Bot List**//
    function getavailableModelsList() {
        botFactory.availableModels().then(function(bots) {
            // console.log("From Sort controller to widgets");
            // console.log(bots);
            $rootScope.models = bots.Data;
            $rootScope.$broadcast('modelsLoaded', bots);
            // refreshSlick();//
        });
    }

    getavailableModelsList(); // loading the bots onto the dashboard on load depends on organization

    $scope.$on('modelCreateDelete', function() {
        getavailableModelsList(); // loading the bots onto the dashboard on load depends on organization TODO pass _orgId
    });

    //**sort Bots by Date / Name Start **//
    $scope.sortBotsByFunc = function(value) {

        if ($scope.sortBotsBy === value) {
            // value += -value;
            $scope.sortBotsBy = '-' + value;
        } else if ($scope.sortBotsBy === '-' + value) {
            $scope.sortBotsBy = value;
        } else {
            $scope.sortBotsBy = value;
        }

    };
    //**sort Bots by Date / Name End **//

}]);
