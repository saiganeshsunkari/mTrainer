//ChatCtrl panel Controller
app.controller('ChatCtrl', ['$scope', '$location', 'botFactory', 'localStorageService', 'userService', 'nlpFactory', function($scope, $location, botFactory, localStorageService, userService, nlpFactory) {
    userService.checkUserLogin(); //check for user login(Change is accordingly when token based auth is defined)
    var stick = $('.top-bar').height();
    var panelHeight = $(window).height() - (stick + 20);

    function setChatPanelHeight() {
        $('.chat-panel').css({
            "height": $(window).height() - stick,
            "top": stick
        });
    }

    setChatPanelHeight();
    $(window).resize(function() {
        setChatPanelHeight();
    });

    /*$('.chat-body').slimScroll({
     height: '300px',
     wheelStep: 10,
     distance: '0px',
     color: '#878787',
     railOpacity: '0.1',
     size: '2px'
     });*/

    $("#close-chat-icon").on('click', function() {
        $(".chat-icon").removeClass('active');
        $(".slide-panel").removeClass('active');
        $('.panel-content').removeClass('chat-active');
        $(".chat-icon").css('display', 'block');
    });
    console.log($('.chat-body').height());
    //styling END
    var data,
        userChatMsg = {},
        modelResponse = {};
    $scope.chatMessages = [];

    $scope.sendTestChat = function() {
        console.log($scope.userMessage);
        userChatMsg.class = "user-msg";
        userChatMsg.message = $scope.userMessage;
        $scope.chatMessages.push(userChatMsg);
        data = $scope.userMessage;

        nlpFactory.testProject(data).then(function(response) {
            console.log("chat message posted and response from NLP is");
            console.log(response);
            modelResponse.class = "model";
            modelResponse.message = response.data;
            $scope.chatMessages.push(modelResponse);
            $scope.userMessage = "";
        });

        userChatMsg = {};
        modelResponse = {};
        $scope.userMessage = "";
        console.log("User and model Message in chat array" + JSON.stringify($scope.chatMessages));

    };
}]);
