// Home Controller for header and NAV after successful login
app.controller('homeHeaderCtrl', ['$scope', '$location', 'botFactory', 'localStorageService', 'userService', '$timeout', '$location', '$rootScope', function($scope, $location, botFactory, localStorageService, userService, $timeout, $location, $rootScope) {
    console.log("entered the home Controller");

    $scope.user = localStorageService.get("user");
    console.log($scope.user);

    $scope.takeToBotContents = function(model) {
        console.log(model);
        localStorageService.set("active_model", model);
        $location.path('/botcontents');
        console.log("Clicked on" + model);
    };

    //***userProfile dropdown***//
    $(".top-bar").on('click', '.name-area', function() {
        $(".user-services-contents").slideToggle(300);
        return false;
        // $(".main-content").addClass('active'); //overtaking the Dropdown'sz-index
    });
    $('html').on("click", function() {
        $('.user-services-contents').slideUp(300);
    });
    $(".user-services").on("click", function(e) {
        e.stopPropagation();
    });

    $('.side-menus nav > ul > li.menu-item-has-children > ul > li > a').on('click', function() {
        if ($(window).width() < 979) {
            $('.side-menu-sec').removeClass('slide-out');
            $('.menu-options').removeClass('active');
        }
    });

    // Get Header Height //
    var stick;
    var sortNavHeight = function() {
        $timeout(function() {
            stick = $('.top-bar').height();
            $('.side-menu-sec').css({
                "top": stick
            });
        }, 0)
    };

    sortNavHeight();

    //***** Side Menu *****//
    $('.side-menus li.menu-item-has-children > a').on('click', function() {
        $(this).parent().siblings().children('ul').slideUp();
        $(this).parent().siblings().removeClass('active');
        $(this).parent().children('ul').slideToggle();
        $(this).parent().toggleClass('active');
        return false;
    });

    //***** Side Menu Option *****//

    $('.top-bar').on('click', '.menu-options', function() {
        $('.menu-options').toggleClass('active');
        $('.side-menu-sec').toggleClass('slide-out');
        $('.main-content').toggleClass('menu-slide')
    });

    /*================== Notifications Dropdown =====================*/
    $(".dropdown > span").on("click", function() {
        $(this).parent().find(".drop-list").toggleClass("active");
        return false;
    });
    $('html').on("click", function() {
        $('.drop-list').removeClass('active');
    });
    $(".drop-list,.dropdown").on("click", function(e) {
        e.stopPropagation();
    });

    $(document).scrollTop(0);

    // Get Header Height //
    var sticks = $('.top-bar').height();
    $('.panel-content, .user-services').css({
        "margin-top": sticks
    });

    //**Request for available bots list / refresh Bot List**//
    function getavailableModelsList() {
        var intentCount = 0,
            entityCount = 0;
        $scope.$on('modelsLoaded', function(event, models) {
            //getting the models list from homeHeaderCtrl
            intentCount = 0;
            entityCount = 0;
            if (models.error !== 1) {
                $scope.bots = models.Data;
                for (var i = 0; i < $scope.bots.length; i++) {
                    intentCount += $scope.bots[i].intents.length;
                    entityCount += $scope.bots[i].entities.length;
                }

            } else {
                $scope.bots = [];
                $scope.totalIntents = 0;
                $scope.totalEntities = 0;
            }
            $scope.totalIntents = intentCount;
            $scope.totalEntities = entityCount;
        });

    }

    botFactory.availableModels().then(function(bots) {

        $rootScope.models = bots.Data;
        $rootScope.$broadcast('modelsLoaded', bots);

    });

    getavailableModelsList();

    $scope.$on('modelCreateDelete', function() {
        getavailableModelsList(); // loading the bots onto the dashboard on load depends on organization TODO pass _orgId
    });
    $scope.$on('refreshModelList', function() {
        getavailableModelsList(); // loading the bots onto the dashboard on load depends on organization TODO pass _orgId
    });
    $scope.$on('onLoginScreen', function() {
        $scope.loggedIn = false; // on login Screen
    });
    $scope.$on('loginSuccess', function() {
        $scope.loggedIn = true; // on successful login From botcontents / sortCtrl
        sortNavHeight();
    });

    $scope.signOutUser = function() {
        console.log("Clicked on Signout");
        userService.signOut();
    };

    $scope.switchModelTab = function(model, tabID) {
        $scope.takeToBotContents(model);
        $rootScope.$broadcast('changeTab', tabID);
    }

}]);
